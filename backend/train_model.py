"""
train_model.py
==============
Trains two models on the Ransomware_headers.csv dataset:
  1. Random Forest Classifier
  2. Feedforward Neural Network (FNN)

Then compares both models and saves them for use in app.py.

Run:
    cd ~/Desktop/deepshield/backend
    python3 train_model.py
"""

import os
import pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, roc_auc_score, roc_curve
)
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import joblib

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
CSV_PATH    = os.path.join(BASE_DIR, 'Ransomware_headers.csv')
MODEL_DIR   = os.path.join(BASE_DIR, 'model')
PLOT_DIR    = os.path.join(BASE_DIR, 'plots')
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(PLOT_DIR,  exist_ok=True)

RF_PATH     = os.path.join(MODEL_DIR, 'rf_ransomware.pkl')
FNN_PATH    = os.path.join(MODEL_DIR, 'fnn_ransomware.pth')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler_ransomware.pkl')
FEATURES_PATH = os.path.join(MODEL_DIR, 'feature_cols.pkl')


# ── 1. Load dataset ────────────────────────────────────────────────────────
print("\n" + "="*60)
print("  DeepShield — Ransomware Model Training")
print("="*60)

print("\n[1] Loading dataset...")
df = pd.read_csv(CSV_PATH)
print(f"    Shape      : {df.shape}")
print(f"    Ransomware : {(df['GR'] == 1).sum()}")
print(f"    Benign     : {(df['GR'] == 0).sum()}")

# Features = columns 0..1023 (raw PE header bytes)
feature_cols = [str(i) for i in range(1024)]
X = df[feature_cols].values.astype(np.float32)
y = df['GR'].values.astype(int)

# Save feature column names
joblib.dump(feature_cols, FEATURES_PATH)
print(f"    Features   : {X.shape[1]}")


# ── 2. Train / test split ──────────────────────────────────────────────────
print("\n[2] Splitting data (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"    Train : {len(X_train)}  Test : {len(X_test)}")


# ── 3. Scale features (for FNN) ────────────────────────────────────────────
print("\n[3] Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)
joblib.dump(scaler, SCALER_PATH)
print(f"    Scaler saved → {SCALER_PATH}")


# ══════════════════════════════════════════════════════════════════════════
# MODEL 1 — RANDOM FOREST
# ══════════════════════════════════════════════════════════════════════════
print("\n" + "─"*60)
print("  MODEL 1 — Random Forest")
print("─"*60)

rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
)
rf.fit(X_train, y_train)
joblib.dump(rf, RF_PATH)
print(f"  Saved → {RF_PATH}")

rf_pred  = rf.predict(X_test)
rf_prob  = rf.predict_proba(X_test)[:, 1]
rf_acc   = accuracy_score(y_test, rf_pred)
rf_auc   = roc_auc_score(y_test, rf_prob)

print(f"\n  Accuracy : {rf_acc:.4f}")
print(f"  ROC-AUC  : {rf_auc:.4f}")
print(f"\n  Classification Report:")
print(classification_report(y_test, rf_pred,
      target_names=['Benign', 'Ransomware']))

# Feature importance plot
importances = rf.feature_importances_
top_idx     = np.argsort(importances)[::-1][:20]
top_names   = [feature_cols[i] for i in top_idx]
top_vals    = importances[top_idx]

plt.figure(figsize=(10, 6))
plt.barh(top_names[::-1], top_vals[::-1], color='#2563eb')
plt.xlabel('Importance')
plt.title('Random Forest — Top 20 Feature Importances')
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, 'rf_feature_importance.png'), dpi=120)
plt.close()

# Confusion matrix
cm_rf = confusion_matrix(y_test, rf_pred)
plt.figure(figsize=(5, 4))
plt.imshow(cm_rf, cmap='Blues')
plt.colorbar()
plt.xticks([0, 1], ['Benign', 'Ransomware'])
plt.yticks([0, 1], ['Benign', 'Ransomware'])
for i in range(2):
    for j in range(2):
        plt.text(j, i, str(cm_rf[i, j]), ha='center', va='center',
                 color='white' if cm_rf[i, j] > cm_rf.max()/2 else 'black')
plt.title('Random Forest — Confusion Matrix')
plt.ylabel('Actual'); plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, 'rf_confusion.png'), dpi=120)
plt.close()
print(f"  Plots saved → {PLOT_DIR}")


# ══════════════════════════════════════════════════════════════════════════
# MODEL 2 — FEEDFORWARD NEURAL NETWORK
# ══════════════════════════════════════════════════════════════════════════
print("\n" + "─"*60)
print("  MODEL 2 — Feedforward Neural Network (FNN)")
print("─"*60)

INPUT_DIM = X_train_scaled.shape[1]

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
        )

    def forward(self, x):
        return self.net(x).squeeze(1)


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"  Device : {device}")

# Tensors
Xt  = torch.tensor(X_train_scaled, dtype=torch.float32).to(device)
yt  = torch.tensor(y_train,        dtype=torch.float32).to(device)
Xv  = torch.tensor(X_test_scaled,  dtype=torch.float32).to(device)
yv  = torch.tensor(y_test,         dtype=torch.float32).to(device)

loader = DataLoader(
    TensorDataset(Xt, yt),
    batch_size=32, shuffle=True
)

# Class weight
pos_weight = torch.tensor(
    [(y_train == 0).sum() / max((y_train == 1).sum(), 1)],
    dtype=torch.float32
).to(device)

model     = FNN(INPUT_DIM).to(device)
criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)

EPOCHS = 50
train_losses, val_losses = [], []

print(f"\n  Training for {EPOCHS} epochs...")
for epoch in range(1, EPOCHS + 1):
    model.train()
    epoch_loss = 0.0
    for xb, yb in loader:
        optimizer.zero_grad()
        loss = criterion(model(xb), yb)
        loss.backward()
        optimizer.step()
        epoch_loss += loss.item() * len(xb)
    scheduler.step()
    avg_train = epoch_loss / len(Xt)
    train_losses.append(avg_train)

    model.eval()
    with torch.no_grad():
        val_loss = criterion(model(Xv), yv).item()
    val_losses.append(val_loss)

    if epoch % 10 == 0:
        print(f"  Epoch {epoch:3d}/{EPOCHS}  "
              f"train={avg_train:.4f}  val={val_loss:.4f}")

# Add sigmoid for inference
model.net.add_module('sigmoid', nn.Sigmoid())
torch.save(model.state_dict(), FNN_PATH)
print(f"\n  Saved → {FNN_PATH}")

# Evaluate FNN
model.eval()
with torch.no_grad():
    fnn_prob_t = model(Xv).cpu().numpy()

fnn_pred = (fnn_prob_t >= 0.5).astype(int)
fnn_acc  = accuracy_score(y_test, fnn_pred)
fnn_auc  = roc_auc_score(y_test, fnn_prob_t)

print(f"\n  Accuracy : {fnn_acc:.4f}")
print(f"  ROC-AUC  : {fnn_auc:.4f}")
print(f"\n  Classification Report:")
print(classification_report(y_test, fnn_pred,
      target_names=['Benign', 'Ransomware']))

# Loss curve
plt.figure(figsize=(7, 4))
plt.plot(train_losses, label='Train Loss')
plt.plot(val_losses,   label='Val Loss')
plt.xlabel('Epoch'); plt.ylabel('BCE Loss')
plt.title('FNN — Training Curve')
plt.legend(); plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, 'fnn_loss_curve.png'), dpi=120)
plt.close()

# FNN confusion matrix
cm_fnn = confusion_matrix(y_test, fnn_pred)
plt.figure(figsize=(5, 4))
plt.imshow(cm_fnn, cmap='Greens')
plt.colorbar()
plt.xticks([0, 1], ['Benign', 'Ransomware'])
plt.yticks([0, 1], ['Benign', 'Ransomware'])
for i in range(2):
    for j in range(2):
        plt.text(j, i, str(cm_fnn[i, j]), ha='center', va='center',
                 color='white' if cm_fnn[i, j] > cm_fnn.max()/2 else 'black')
plt.title('FNN — Confusion Matrix')
plt.ylabel('Actual'); plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, 'fnn_confusion.png'), dpi=120)
plt.close()


# ══════════════════════════════════════════════════════════════════════════
# MODEL COMPARISON
# ══════════════════════════════════════════════════════════════════════════
print("\n" + "─"*60)
print("  MODEL COMPARISON")
print("─"*60)
print(f"  {'Model':<25} {'Accuracy':>10} {'ROC-AUC':>10}")
print(f"  {'-'*45}")
print(f"  {'Random Forest':<25} {rf_acc:>10.4f} {rf_auc:>10.4f}")
print(f"  {'FNN':<25} {fnn_acc:>10.4f} {fnn_auc:>10.4f}")

# ROC curve comparison
fpr_rf,  tpr_rf,  _ = roc_curve(y_test, rf_prob)
fpr_fnn, tpr_fnn, _ = roc_curve(y_test, fnn_prob_t)

plt.figure(figsize=(7, 6))
plt.plot(fpr_rf,  tpr_rf,  label=f'Random Forest (AUC={rf_auc:.4f})',  lw=2)
plt.plot(fpr_fnn, tpr_fnn, label=f'FNN          (AUC={fnn_auc:.4f})',  lw=2, linestyle='--')
plt.plot([0, 1], [0, 1], 'k--', lw=1)
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve — Random Forest vs FNN')
plt.legend(loc='lower right')
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, 'roc_comparison.png'), dpi=120)
plt.close()

print(f"\n  All plots saved → {PLOT_DIR}/")
print("\n" + "="*60)
print("  Training complete! Models saved to backend/model/")
print("="*60 + "\n")