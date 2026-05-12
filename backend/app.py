from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import hashlib
import os
import joblib
import numpy as np
import jwt
import datetime
import re
from functools import wraps
import torch
import torch.nn as nn

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///deepshield.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'deepshield-ict301-permanent-secret-2026')

db = SQLAlchemy(app)

# ── Allowed extensions ──────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {'exe', 'dll'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Model paths ─────────────────────────────────────────────────────────────
MODEL_DIR     = os.path.join(os.path.dirname(__file__), 'model')
RF_PATH       = os.path.join(MODEL_DIR, 'rf_ransomware.pkl')
FNN_PATH      = os.path.join(MODEL_DIR, 'fnn_ransomware.pth')
SCALER_PATH   = os.path.join(MODEL_DIR, 'scaler_ransomware.pkl')
FEATURES_PATH = os.path.join(MODEL_DIR, 'feature_cols.pkl')

# ── FNN architecture ─────────────────────────────────────────────────────────
class FNN(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        return self.net(x).squeeze(1)

# ── Load models ──────────────────────────────────────────────────────────────
rf_model     = None
fnn_model    = None
scaler       = None
feature_cols = None

def load_models():
    global rf_model, fnn_model, scaler, feature_cols
    try:
        rf_model     = joblib.load(RF_PATH)
        scaler       = joblib.load(SCALER_PATH)
        feature_cols = joblib.load(FEATURES_PATH)
        print(f'Random Forest loaded! Features: {len(feature_cols)}')
    except Exception as e:
        print(f'Warning: Could not load Random Forest: {e}')
    try:
        input_dim = len(feature_cols) if feature_cols else 1024
        fnn       = FNN(input_dim)
        fnn.load_state_dict(torch.load(FNN_PATH, map_location='cpu'))
        fnn.eval()
        fnn_model = fnn
        print(f'FNN loaded! Input dim: {input_dim}')
    except Exception as e:
        print(f'Warning: Could not load FNN: {e}')

load_models()

# ── Database models ──────────────────────────────────────────────────────────
class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(100), nullable=False)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role     = db.Column(db.String(20), default='student')

    def to_dict(self):
        return {'id': self.id, 'name': self.name,
                'email': self.email, 'role': self.role}

class ScanResult(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    email      = db.Column(db.String(120))
    filename   = db.Column(db.String(200))
    verdict    = db.Column(db.String(20))
    confidence = db.Column(db.Float)
    hash       = db.Column(db.String(64))
    scan_time  = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=db.func.now())

class ActivityLog(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    email      = db.Column(db.String(120))
    role       = db.Column(db.String(20))
    action     = db.Column(db.String(50))
    detail     = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id, 'email': self.email,
            'role': self.role, 'action': self.action,
            'detail': self.detail, 'created_at': str(self.created_at),
        }

with app.app_context():
    db.create_all()

# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_password(p):
    return hashlib.sha256(p.encode()).hexdigest()

def get_file_hash(b):
    return hashlib.sha256(b).hexdigest()

def log_activity(user_id, email, role, action, detail=''):
    try:
        db.session.add(ActivityLog(
            user_id=user_id, email=email,
            role=role, action=action, detail=detail
        ))
        db.session.commit()
    except:
        pass

def generate_token(user):
    payload = {
        'sub':   str(user.id),
        'email': user.email,
        'role':  user.role,
        'iat':   datetime.datetime.utcnow(),
        'exp':   datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    return jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])

# ── Feature extractor ─────────────────────────────────────────────────────────
def extract_features(file_bytes):
    header = file_bytes[:1024]
    arr    = list(header) + [0] * (1024 - len(header))
    return np.array([arr], dtype=np.float32)

# ── Scan with both models ─────────────────────────────────────────────────────
def scan_file_with_models(filename, file_bytes):
    import time
    start     = time.time()
    file_hash = get_file_hash(file_bytes)
    features  = extract_features(file_bytes)

    # Random Forest
    rf_verdict    = 'Unknown'
    rf_confidence = 0.0
    rf_raw        = 0.0
    if rf_model is not None:
        try:
            rf_raw        = rf_model.predict_proba(features)[0, 1]
            rf_verdict    = 'Ransomware' if rf_raw >= 0.5 else 'Clean'
            rf_confidence = round(float(rf_raw) * 100 if rf_raw >= 0.5
                                  else (1 - float(rf_raw)) * 100, 1)
        except Exception as e:
            print(f'RF error: {e}')

    # FNN
    fnn_verdict    = 'Unknown'
    fnn_confidence = 0.0
    fnn_raw        = 0.0
    if fnn_model is not None:
        try:
            scaled   = scaler.transform(features)
            tensor   = torch.tensor(scaled, dtype=torch.float32)
            with torch.no_grad():
                fnn_raw = fnn_model(tensor).item()
            fnn_verdict    = 'Ransomware' if fnn_raw >= 0.5 else 'Clean'
            fnn_confidence = round(float(fnn_raw) * 100 if fnn_raw >= 0.5
                                   else (1 - float(fnn_raw)) * 100, 1)
        except Exception as e:
            print(f'FNN error: {e}')

    # Ensemble
    ens_prob       = (rf_raw + fnn_raw) / 2
    ens_verdict    = 'Ransomware' if ens_prob >= 0.5 else 'Clean'
    ens_confidence = round(float(ens_prob) * 100 if ens_prob >= 0.5
                           else (1 - float(ens_prob)) * 100, 1)

    scan_time = round(time.time() - start, 2)

    return {
        'verdict':         ens_verdict,
        'confidence':      ens_confidence,
        'rf_verdict':      rf_verdict,
        'rf_confidence':   rf_confidence,
        'fnn_verdict':     fnn_verdict,
        'fnn_confidence':  fnn_confidence,
        'hash':            file_hash,
        'scan_time':       scan_time,
    }

# ── JWT middleware ────────────────────────────────────────────────────────────
def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth  = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth.split(' ', 1)[1]
        if not token:
            return jsonify({'message': 'Please log in to continue.'}), 401
        try:
            payload = decode_token(token)
            request.current_user = {
                'id':    int(payload['sub']),
                'email': payload['email'],
                'role':  payload['role'],
            }
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Session expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token. Please log in again.'}), 401
        return f(*args, **kwargs)
    return decorated

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status':        'ok',
        'message':       'DeepShield API running',
        'random_forest': 'loaded' if rf_model  is not None else 'not loaded',
        'fnn':           'loaded' if fnn_model is not None else 'not loaded',
    })

@app.route('/api/scans/recent', methods=['GET'])
def get_recent_scans():
    scans = ScanResult.query.order_by(
        ScanResult.created_at.desc()
    ).limit(6).all()
    return jsonify([{
        'filename':   s.filename,
        'verdict':    s.verdict,
        'confidence': s.confidence,
        'created_at': str(s.created_at),
    } for s in scans])

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role     = data.get('role', 'student')

    if role not in ('student', 'supervisor'):
        role = 'student'
    if not name or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered. Please sign in.'}), 409

    user = User(name=name, email=email,
                password=hash_password(password), role=role)
    db.session.add(user)
    db.session.commit()
    log_activity(user.id, email, role, 'SIGNUP', 'New account created')
    token = generate_token(user)
    return jsonify({'message': 'Account created successfully',
                    'user': user.to_dict(), 'token': token}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'message': 'Please enter email and password'}), 400
    user = User.query.filter_by(
        email=email, password=hash_password(password)
    ).first()
    if not user:
        return jsonify({'message': 'Invalid email or password.'}), 401
    log_activity(user.id, user.email, user.role, 'LOGIN', 'User logged in')
    token = generate_token(user)
    return jsonify({'message': 'Login successful',
                    'user': user.to_dict(), 'token': token})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required
def get_me():
    user = db.session.get(User, request.current_user['id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})

@app.route('/api/scan', methods=['POST'])
@jwt_required
def scan_file():
    if 'files' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    files = request.files.getlist('files')
    email = request.current_user['email']
    uid   = request.current_user['id']
    role  = request.current_user['role']

    invalid = [f.filename for f in files if not allowed_file(f.filename)]
    if invalid:
        return jsonify({'error': 'Only .exe and .dll files are supported.'}), 400

    f          = files[0]
    file_bytes = f.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        return jsonify({'error': 'File exceeds 10MB limit'}), 400

    result = scan_file_with_models(f.filename, file_bytes)

    scan = ScanResult(
        user_id=uid, email=email,
        filename=f.filename,
        verdict=result['verdict'],
        confidence=result['confidence'],
        hash=result['hash'],
        scan_time=result['scan_time'],
    )
    db.session.add(scan)
    db.session.commit()

    log_activity(uid, email, role, 'FILE_SCAN',
        f"Scanned {f.filename} — {result['verdict']} ({result['confidence']}%)")

    result['email'] = email
    return jsonify(result)

@app.route('/api/scans/my', methods=['GET'])
@jwt_required
def get_my_scans():
    scans = ScanResult.query.filter_by(
        user_id=request.current_user['id']
    ).order_by(ScanResult.created_at.desc()).limit(50).all()
    return jsonify([{
        'filename':   s.filename,
        'verdict':    s.verdict,
        'confidence': s.confidence,
        'hash':       s.hash,
        'scan_time':  s.scan_time,
        'created_at': str(s.created_at),
    } for s in scans])

@app.route('/api/scans', methods=['GET'])
@jwt_required
def get_all_scans():
    scans = ScanResult.query.order_by(
        ScanResult.created_at.desc()
    ).limit(200).all()
    return jsonify([{
        'filename':   s.filename,
        'verdict':    s.verdict,
        'email':      s.email,
        'confidence': s.confidence,
        'hash':       s.hash,
        'scan_time':  s.scan_time,
        'created_at': str(s.created_at),
    } for s in scans])

@app.route('/api/logs', methods=['GET'])
@jwt_required
def get_logs():
    logs = ActivityLog.query.order_by(
        ActivityLog.created_at.desc()
    ).limit(200).all()
    return jsonify([l.to_dict() for l in logs])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)