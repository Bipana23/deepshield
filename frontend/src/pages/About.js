import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './About.css';

const COMPARE = [
  {
    old: { title: 'Signature-based detection',  desc: 'Relies on known patterns. Fails against new ransomware variants and obfuscated payloads.' },
    new: { title: 'Static feature analysis',    desc: 'Extracts 1024 raw PE header bytes from the binary header — no execution or signatures needed.' },
  },
  {
    old: { title: 'Manual rule updates',   desc: 'Requires constant signature database updates. Slow to react to new ransomware families.' },
    new: { title: 'Dual model verdict',    desc: 'Random Forest + Neural Network run independently. Ensemble result gives higher accuracy.' },
  },
  {
    old: { title: 'Single detection engine', desc: 'One model makes all decisions. A false negative means the threat gets through completely.' },
    new: { title: 'Confidence scoring',      desc: 'Every scan returns a precise probability from both models so you know exactly how risky a file is.' },
  },
];

const STEPS = [
  { num: '01', title: 'Upload PE file',      desc: '.exe or .dll, max 10 MB' },
  { num: '02', title: 'Feature extraction',  desc: '1024 raw PE header bytes extracted from the binary' },
  { num: '03', title: 'Dual model scan',     desc: 'Random Forest + FNN run in parallel' },
  { num: '04', title: 'Verdict',             desc: 'Ransomware or Clean + confidence score' },
];

const TECH = [
  { label: 'Random Forest',     color: '#534AB7', bg: '#EEEDFE', desc: '300 estimators, balanced class weights, feature importance ranking' },
  { label: 'Neural Network',    color: '#0F6E56', bg: '#E1F5EE', desc: '3-layer FNN, BatchNorm + Dropout, AdamW optimiser, cosine LR' },
  { label: 'Python / Flask',    color: '#854F0B', bg: '#FAEEDA', desc: 'REST API, PE file processing with pefile, scikit-learn + PyTorch' },
  { label: 'React',             color: '#185FA5', bg: '#E6F1FB', desc: 'Fast responsive scanning interface with drag-and-drop upload' },
  { label: 'SQLite / JWT',      color: '#5F5E5A', bg: '#F1EFE8', desc: 'Secure scan result storage with JWT authentication' },
  { label: 'pefile',            color: '#3B6D11', bg: '#EAF3DE', desc: 'PE header, section, import table and resource feature extraction' },
];

const TEAM = [
  { initials: 'BS', name: 'Bipana Shrestha', role: 'Project Lead',  color: '#085041', bg: '#E1F5EE', desc: 'Problem identification, scope, project planning and stakeholder analysis' },
  { initials: 'SP', name: 'Shrijal Panday',  role: 'Researcher',    color: '#3C3489', bg: '#EEEDFE', desc: 'Literature review, ML vs DL comparison and technology justification' },
  { initials: 'SU', name: 'Suraj',           role: 'Analyst',       color: '#0C447C', bg: '#E6F1FB', desc: 'Requirements analysis, use case design and traceability matrix' },
  { initials: 'RA', name: 'Rabina',          role: 'Designer',      color: '#633806', bg: '#FAEEDA', desc: 'System design, architecture, navigation and UI prototyping' },
  { initials: 'SM', name: 'Susmita',         role: 'Editor',        color: '#791F1F', bg: '#FCEBEB', desc: 'Quality review, formatting and final editing across all deliverables' },
];

const FEATURES_EXTRACTED = [
  'Section entropy (max, min, mean)',
  'Crypto APIs - CryptEncrypt, BCryptGenerateSymmetricKey',
  'File system calls - FindFirstFile, WriteFile, DeleteFile',
  'Shadow copy APIs - WinExec, ShellExecute',
  'Registry calls - RegSetValue, RegCreateKey',
  'Targeted extension strings - .docx .pdf .jpg .xlsx',
  'Network APIs - InternetOpen, WSAStartup',
  'PE header - machine type, timestamps, section count',
  'Import table - DLL count, function count',
];

export default function About() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleScanClick = () => {
    if (isAuthenticated) navigate('/scan');
    else navigate('/login');
  };

  return (
    <div className="about-page" style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#111827',
    }}>

      {/* ─ HERO ─ */}
      <section style={{
        padding: '56px 40px 48px',
        borderBottom: '1px solid #f3f4f6',
        maxWidth: 760, margin: '0 auto',
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          About DeepShield
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 16, lineHeight: 1.25 }}>
          Ransomware detection<br />powered by machine learning
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 580 }}>
          DeepShield analyses Windows PE files by extracting 1024 raw PE header
          bytes and passing them through two independent models: Random Forest
          and a Feedforward Neural Network. Random Forest achieves 97.7% accuracy
          and FNN achieves 98.2% on a dataset of 2,157 real ransomware samples.
        </p>
      </section>

      {/* ─ COMPARE ─ */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Why traditional AV fails
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          A different approach to detection
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
          Signature-based tools only catch what they've already seen.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {COMPARE.map((c, i) => (
            <>
              <div key={`old-${i}`} style={{
                border: '1px solid #fee2e2',
                borderLeft: '3px solid #f87171',
                borderRadius: '0 10px 10px 0',
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Traditional AV
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{c.old.title}</p>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{c.old.desc}</p>
              </div>
              <div key={`new-${i}`} style={{
                border: '1px solid #bbf7d0',
                borderLeft: '3px solid #16a372',
                borderRadius: '0 10px 10px 0',
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  DeepShield
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{c.new.title}</p>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{c.new.desc}</p>
              </div>
            </>
          ))}
        </div>
      </section>

      {/* ─ HOW IT WORKS ─ */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          How it works
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 28 }}>
          From upload to verdict in 4 steps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 8px', position: 'relative' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#16a372', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                margin: '0 auto 12px',
                position: 'relative', zIndex: 1,
              }}>
                {s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', top: 18,
                  left: '50%', right: '-50%',
                  height: 1, background: '#d1fae5', zIndex: 0,
                }} />
              )}
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─ FEATURES EXTRACTED ─ */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Feature extractor
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          What we extract from your PE file
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          1024 raw PE header bytes extracted from the binary - no execution required.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {FEATURES_EXTRACTED.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 14px',
              background: '#f9fafb', border: '1px solid #f3f4f6',
              borderRadius: 8,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#16a372', flexShrink: 0, marginTop: 5,
              }} />
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─ TECH STACK ─ */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Technology
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
          Built on proven foundations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {TECH.map((t, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px',
            }}>
              <span style={{
                display: 'inline-block',
                fontSize: 11, fontWeight: 600,
                padding: '3px 10px', borderRadius: 20,
                background: t.bg, color: t.color,
                marginBottom: 8,
              }}>
                {t.label}
              </span>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* - TEAM - */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          The team
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Who built DeepShield
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          Five developers and researchers.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {TEAM.map((m, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: m.bg, color: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, marginBottom: 10,
              }}>
                {m.initials}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{m.name}</p>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 600,
                padding: '2px 8px', borderRadius: 20,
                background: m.bg, color: m.color, marginBottom: 8,
              }}>
                {m.role}
              </span>
              <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─ CTA ─ */}
      <section style={{
        padding: '48px 40px', textAlign: 'center',
        background: '#f9fafb',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Ready to scan a file?
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          Upload any Windows PE file and get a ransomware verdict from two AI models.
        </p>
        <button onClick={handleScanClick} style={{
          background: '#16a372', color: '#fff',
          border: 'none', borderRadius: 8,
          padding: '11px 24px', fontSize: 14,
          fontWeight: 600, cursor: 'pointer',
        }}>
          {isAuthenticated ? 'Go to Scanner →' : 'Get started free →'}
        </button>
      </section>

    </div>
  );
}