import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Home.css';

const FEATURES = [
  { color: '#A32D2D', bg: '#FCEBEB', title: 'Ransomware-specific detection',  desc: 'Trained exclusively on ransomware families including WannaCry, Ryuk, LockBit, REvil and Conti — not generic malware.' },
  { color: '#185FA5', bg: '#E6F1FB', title: 'PE file feature extraction',     desc: 'Extracts 1024 raw bytes from the PE file header — the structural fingerprint of every Windows executable.' },
  { color: '#534AB7', bg: '#EEEDFE', title: 'Dual model comparison',          desc: 'Two models run simultaneously — Random Forest and Feedforward Neural Network — with an ensemble verdict.' },
  { color: '#0F6E56', bg: '#E1F5EE', title: 'Confidence scoring',             desc: 'Every scan returns a precise probability score so you know exactly how risky a file is before you open it.' },
  { color: '#854F0B', bg: '#FAEEDA', title: 'SHA-256 hashing',                desc: 'Every file is fingerprinted with a SHA-256 hash so you can cross-reference results with global threat intelligence.' },
  { color: '#0F6E56', bg: '#E1F5EE', title: 'Scan history',                   desc: 'Every scan is saved to your personal dashboard so you can review past results and track threats over time.' },
];

const STEPS = [
  { num: '01', title: 'Upload PE file',     desc: 'Upload any Windows executable (.exe or .dll). Max 10MB.' },
  { num: '02', title: 'Feature extraction', desc: '1024 raw PE header bytes extracted from the binary — no execution required.' },
  { num: '03', title: 'Dual model scan',    desc: 'Random Forest and Neural Network both analyse the features independently.' },
  { num: '04', title: 'Verdict',            desc: 'Get a clear Ransomware or Clean result with confidence score from both models.' },
];

const RANSOMWARE_FAMILIES = [
  { name: 'WannaCry',  year: '2017', impact: 'Global' },
  { name: 'Ryuk',      year: '2018', impact: 'Enterprise' },
  { name: 'REvil',     year: '2019', impact: 'Global' },
  { name: 'LockBit',   year: '2020', impact: 'Critical infra' },
  { name: 'Conti',     year: '2020', impact: 'Healthcare' },
  { name: 'BlackCat',  year: '2021', impact: 'Multi-sector' },
];

function CountUp({ end, suffix = '', delay = 0 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          let start = 0;
          const step = end / 40;
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setValue(end); clearInterval(timer); }
            else setValue(Math.floor(start));
          }, 30);
        }, delay);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, delay]);
  return <span ref={ref}>{value}{suffix}</span>;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    fetch('/api/scans/recent')
      .then(r => r.json())
      .then(data => setRecentScans(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleScanClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) navigate('/scan');
    else navigate('/login');
  };

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="container hero-inner">

          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-dot" />
              Ransomware detection — powered by AI
            </div>
            <h1 className="hero-title">
              Detect ransomware<br />
              <span className="hero-accent">before it encrypts</span>
            </h1>
            <p className="hero-sub">
              Upload any Windows executable and our dual AI model —
              Random Forest + Neural Network — analyses 1024 PE header bytes
              to detect ransomware in under 2 seconds.
            </p>
            <div className="hero-actions">
              <button onClick={handleScanClick} className="btn btn-green hero-cta">
                {isAuthenticated ? 'Go to Scanner →' : 'Start scanning free →'}
              </button>
              <Link to="/about" className="btn btn-ghost">How it works</Link>
            </div>
            <div className="hero-trust">
              <span className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                PE file analysis
              </span>
              <span className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Random Forest + FNN
              </span>
              <span className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                1024 extracted features
              </span>
            </div>


          </div>

          {/* Right — ransomware families */}
          <div className="hero-right">
            <div className="scanner-card">
              <div className="scanner-header">
                <div className="scanner-header-left">
                  <div className="scanner-pulse" />
                  <span className="scanner-title">Ransomware Families Detected</span>
                </div>
                <span className="scanner-badge">Live</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {RANSOMWARE_FAMILIES.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#dc2626',
                        boxShadow: '0 0 6px #dc262688'
                      }} />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{f.year}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        background: '#fef2f2', color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '2px 8px', borderRadius: 20
                      }}>{f.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={handleScanClick} style={{
                  width: '100%', padding: '10px',
                  background: '#16a372', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}>
                  {isAuthenticated ? 'Scan a file now →' : 'Sign up to scan →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="container stats-grid">
          {[
            { val: 98,   suf: '%',  label: 'Detection accuracy' },
            { val: 2,    suf: 's',  label: 'Average scan time' },
            { val: 1024, suf: '',   label: 'PE bytes extracted' },
            { val: 25,   suf: '+',  label: 'Ransomware families' },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <span className="stat-num"><CountUp end={s.val} suffix={s.suf} delay={i * 100} /></span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE THREAT FEED ── */}
      <section className="threat-section section-pad">
        <div className="container">
          <div className="threat-header">
            <div>
              <p className="section-tag">Live threat intelligence</p>
              <h2 className="section-title">Recent ransomware detections</h2>
            </div>
            <button onClick={handleScanClick} className="btn btn-ghost btn-sm">
              Scan your file →
            </button>
          </div>
          <div className="threat-table">
            <div className="threat-table-head">
              <span>File</span>
              <span>Type</span>
              <span>Confidence</span>
              <span>Verdict</span>
              <span>Time</span>
            </div>
            {recentScans.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                No scans yet — be the first to scan a file.
              </div>
            ) : (
              recentScans.map((t, i) => (
                <div className="threat-row" key={i}>
                  <span className="threat-name">{t.filename}</span>
                  <span className="threat-type">PE Executable</span>
                  <span className="threat-conf">{t.confidence}%</span>
                  <span className={`threat-verdict ${t.verdict === 'Ransomware' ? 'malware' : 'clean'}`}>
                    {t.verdict}
                  </span>
                  <span className="threat-time">
                    {new Date(t.created_at).toLocaleDateString('en-AU', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section section-pad">
        <div className="container">
          <p className="section-tag">Why DeepShield</p>
          <h2 className="section-title">Built specifically for ransomware</h2>
          <p className="section-sub">
            Unlike generic malware scanners, DeepShield is trained and tuned
            exclusively for ransomware detection using static PE file analysis.
          </p>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-dot" style={{ background: f.bg, borderColor: f.color + '40' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color }} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section section-pad">
        <div className="container">
          <p className="section-tag">How it works</p>
          <h2 className="section-title">From upload to verdict in 4 steps</h2>
          <div className="steps-row">
            {STEPS.map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{s.num}</div>
                <div className="step-line" />
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div className="cta-badge">Free · Results in 2 seconds · RF + FNN models</div>
          <h2>Is your file ransomware?</h2>
          <p>Find out instantly. Upload any Windows PE file and get a verdict from two AI models.</p>
          <div className="cta-btns">
            <button onClick={handleScanClick} className="btn btn-green cta-btn">
              {isAuthenticated ? 'Go to Scanner →' : 'Scan a file now →'}
            </button>
            <Link to="/about" className="btn btn-ghost-dark">Learn how it works</Link>
          </div>
        </div>
      </section>

    </div>
  );
}