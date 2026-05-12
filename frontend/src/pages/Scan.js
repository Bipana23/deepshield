import { useState } from 'react';
import api from '../auth/api';
import './Scan.css';

const ALLOWED_EXTENSIONS = ['exe', 'dll'];

function isValidFileType(filename) {
  return ALLOWED_EXTENSIONS.includes(filename.split('.').pop().toLowerCase());
}

export default function Scan() {
  const [file,     setFile]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status,   setStatus]   = useState('idle');
  const [result,   setResult]   = useState(null);
  const [errMsg,   setErrMsg]   = useState('');

  const handleFile = (incoming) => {
    const f = Array.from(incoming)[0];
    if (!f) return;
    if (!isValidFileType(f.name)) {
      setErrMsg('Invalid file type. Only .exe and .dll files are supported.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrMsg('File too large. Maximum size is 10 MB.');
      return;
    }
    setErrMsg(''); setFile(f); setResult(null); setStatus('idle');
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus('scanning'); setErrMsg('');
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('mode', 'file');
      const res = await api.post('/api/scan', fd);
      setResult(res.data);
      setStatus('done');
    } catch (err) {
      setErrMsg(err.response?.data?.error || err.response?.data?.message || 'Scan failed.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null); setResult(null); setStatus('idle'); setErrMsg('');
  };

  const steps = [
    { num: '01', title: 'Upload PE file',      desc: 'Select a Windows .exe or .dll file.' },
    { num: '02', title: 'Feature extraction',  desc: '1024 raw PE header bytes extracted from the binary.' },
    { num: '03', title: 'Dual model analysis', desc: 'Random Forest and FNN both run independently.' },
    { num: '04', title: 'Verdict',             desc: 'Ransomware or Clean — with confidence from each model.' },
  ];

  const isRansomware = (v) => v === 'Ransomware' || v === 'Malware';

  const ModelCard = ({ label, verdict, confidence }) => (
    <div style={{
      flex: 1,
      border: `1px solid ${isRansomware(verdict) ? '#fecaca' : '#bbf7d0'}`,
      borderRadius: 10,
      padding: '14px 16px',
      background: isRansomware(verdict) ? '#fef2f2' : '#ecfdf5',
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 20, fontWeight: 800,
        color: isRansomware(verdict) ? '#dc2626' : '#16a372',
        marginBottom: 4,
      }}>
        {isRansomware(verdict) ? 'Ransomware' : 'Clean'}
      </p>
      <p style={{ fontSize: 13, color: '#6b7280' }}>
        Confidence: <strong>{confidence}%</strong>
      </p>
    </div>
  );

  return (
    <div className="scan-page">

      <section className="scan-hero">
        <div className="container">
          <p className="section-tag">DeepShield — Ransomware Detector</p>
          <h1 className="scan-title">
            Analyse a PE file for<br />
            <span style={{ color: 'var(--accent)' }}>ransomware</span>
          </h1>
          <p className="scan-sub">
            Upload a Windows executable. We extract 1024 PE header bytes
            and pass them through Random Forest and Neural Network models.
          </p>
        </div>
      </section>

      <section className="scan-body section-pad">
        <div className="container scan-grid">

          {/* ── LEFT ── */}
          <div className="scan-form-wrap">
            {status === 'done' && result ? (

              <div className="scan-result">

                {/* ── Ensemble verdict banner ── */}
                <div className={`result-verdict ${isRansomware(result.verdict) ? 'malware' : 'benign'}`}>
                  {isRansomware(result.verdict)
                    ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                    : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  }
                  <span>{isRansomware(result.verdict) ? 'Ransomware Detected' : 'Clean'}</span>
                </div>

                {/* ── Model comparison cards ── */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: '#374151',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: 10
                  }}>
                    Model Results
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <ModelCard
                      label="Random Forest"
                      verdict={result.rf_verdict}
                      confidence={result.rf_confidence}
                    />
                    <ModelCard
                      label="Neural Network (FNN)"
                      verdict={result.fnn_verdict}
                      confidence={result.fnn_confidence}
                    />
                  </div>

                  {/* Ensemble */}
                  <div style={{
                    border: `2px solid ${isRansomware(result.verdict) ? '#f87171' : '#16a372'}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    background: isRansomware(result.verdict) ? '#fef2f2' : '#ecfdf5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <p style={{
                        fontSize: 11, fontWeight: 700, color: '#6b7280',
                        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4
                      }}>
                        Ensemble (RF + FNN average)
                      </p>
                      <p style={{
                        fontSize: 18, fontWeight: 800,
                        color: isRansomware(result.verdict) ? '#dc2626' : '#16a372',
                      }}>
                        {isRansomware(result.verdict) ? 'Ransomware' : 'Clean'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 28, fontWeight: 800, color: isRansomware(result.verdict) ? '#dc2626' : '#16a372' }}>
                        {result.confidence}%
                      </p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>confidence</p>
                    </div>
                  </div>
                </div>

                {/* ── File details ── */}
                <div className="result-details">
                  <div className="result-row">
                    <span className="result-label">File</span>
                    <span className="result-value">{file?.name}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">SHA-256</span>
                    <span className="result-value result-hash">{result.hash}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Scan time</span>
                    <span className="result-value">{result.scan_time}s</span>
                  </div>
                </div>

                {/* ── Model agreement indicator ── */}
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  background: result.rf_verdict === result.fnn_verdict ? '#ecfdf5' : '#fefce8',
                  border: `1px solid ${result.rf_verdict === result.fnn_verdict ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: result.rf_verdict === result.fnn_verdict ? '#16a372' : '#92400e',
                }}>
                  {result.rf_verdict === result.fnn_verdict
                    ? '✓ Both models agree on the verdict'
                    : '⚠ Models disagree — ensemble verdict used'}
                </div>

                <button
                  className="btn btn-green scan-submit"
                  onClick={reset}
                  style={{ marginTop: 16 }}
                >
                  Scan another file
                </button>
              </div>

            ) : (

              <form className="scan-form" onSubmit={handleScan}>
                <p className="scan-form-title">Upload a Windows PE file</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Supports <strong>.exe</strong> and <strong>.dll</strong> files only (max 10 MB)
                </p>

                <div
                  className={`dropzone ${dragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
                >
                  {file ? (
                    <>
                      <div className="dropzone__file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <p className="dropzone__filename">{file.name}</p>
                      <p className="dropzone__size">{(file.size / 1024).toFixed(1)} KB</p>
                      <button type="button" className="dropzone__remove"
                        onClick={() => { setFile(null); setErrMsg(''); }}>
                        Remove ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropzone__icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <p className="dropzone__label">Drag and drop a PE file here</p>
                      <label className="dropzone__browse">
                        Browse file
                        <input type="file" style={{ display: 'none' }}
                          accept=".exe,.dll"
                          onChange={e => handleFile(e.target.files)} />
                      </label>
                      <p className="dropzone__limit">.exe, .dll · Max 10 MB</p>
                    </>
                  )}
                </div>

                {errMsg && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    color: '#dc2626', padding: '10px 14px',
                    borderRadius: 8, fontSize: 13, marginBottom: 4
                  }}>
                    {errMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-green scan-submit"
                  disabled={!file || status === 'scanning'}
                >
                  {status === 'scanning'
                    ? <><span className="btn-spinner" /> Analysing…</>
                    : '🔍 Scan for ransomware'}
                </button>

                {/* What the model uses */}
                <div style={{
                  marginTop: 20, padding: 16,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 10
                }}>
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: '#374151',
                    marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    What the models analyse
                  </p>
                  {[
                    ['1024 PE header bytes', 'Raw binary features from the file header'],
                    ['Random Forest',        '200 decision trees vote independently'],
                    ['Neural Network (FNN)', '4-layer network — 1024 → 256 → 128 → 64 → 1'],
                    ['Ensemble verdict',     'Average of both model probabilities'],
                  ].map(([feat, desc], i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: '#16a372', fontSize: 13, marginTop: 1 }}>▸</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{feat}</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="scan-info">
            <h3 className="scan-info-title">How it works</h3>
            {steps.map((s, i) => (
              <div className="scan-step" key={i}>
                <span className="scan-step-num">{s.num}</span>
                <div>
                  <p className="scan-step-title">{s.title}</p>
                  <p className="scan-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 24, padding: 16,
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: '#dc2626',
                marginBottom: 8, textTransform: 'uppercase'
              }}>
                Ransomware families targeted
              </p>
              {['WannaCry', 'Ryuk', 'REvil / Sodinokibi', 'LockBit',
                'Conti', 'Gandcrab', 'Darkside', 'Phobos', 'Maze', 'Babuk'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#dc2626', display: 'inline-block', flexShrink: 0
                  }} />
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>

            <div className="scan-note" style={{ marginTop: 16 }}>
              <strong>Privacy:</strong> Files are processed locally and never stored permanently.
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}