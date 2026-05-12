 import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './About.css';

const STEPS = [
  {
    num: '01',
    title: 'Create an account',
    desc: 'Click "Sign up" in the navigation bar. Enter your name, email address and a password. You will be logged in immediately — no email verification required.',
    tip: null,
  },
  {
    num: '02',
    title: 'Log in',
    desc: 'If you already have an account, click "Log in" and enter your email and password. Authenticated users can access the Scanner and scan History pages.',
    tip: null,
  },
  {
    num: '03',
    title: 'Open the Scanner',
    desc: 'Click "Scan" in the navigation bar (or the "Start scanning free" button on the home page). You must be logged in to access this page.',
    tip: null,
  },
  {
    num: '04',
    title: 'Upload a PE file',
    desc: 'Drag and drop a Windows executable (.exe or .dll) onto the upload area, or click "Choose file" to browse. The file must be 10 MB or smaller.',
    tip: 'Only Windows PE files are supported. Other file types (scripts, archives, PDFs) will be rejected.',
  },
  {
    num: '05',
    title: 'Run the scan',
    desc: 'Click "Scan file". DeepShield extracts 1 024 raw bytes from the PE header and passes them through two models — Random Forest and a Feedforward Neural Network — simultaneously.',
    tip: null,
  },
  {
    num: '06',
    title: 'Read the verdict',
    desc: 'Each model returns a verdict (Ransomware or Clean) and a confidence percentage. An ensemble verdict summarises the combined result. A SHA-256 hash of the uploaded file is also shown for cross-referencing with external threat intelligence sources.',
    tip: 'A high confidence score (>95%) from both models is a strong indicator. If the two models disagree, treat the file with caution.',
  },
  {
    num: '07',
    title: 'Review your scan history',
    desc: 'Every scan is saved automatically. Open the "History" page to view all past scans, including file name, SHA-256 hash, verdict, confidence and scan timestamp.',
    tip: null,
  },
];

const VERDICTS = [
  {
    label: 'Clean',
    color: '#0F6E56',
    bg: '#E1F5EE',
    border: '#bbf7d0',
    desc: 'Neither model detected ransomware indicators. The file appears benign based on its PE header features.',
  },
  {
    label: 'Ransomware',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    desc: 'One or both models detected patterns consistent with ransomware. Do not execute the file. Quarantine or delete it immediately.',
  },
];

const FAQS = [
  { q: 'What file types can I scan?', a: 'Only Windows PE files: .exe and .dll. Other formats are not supported because DeepShield\'s models are trained on PE header features.' },
  { q: 'What is the maximum file size?', a: '10 MB. Files larger than this are rejected before the scan begins.' },
  { q: 'Is my file stored on the server?', a: 'No. The uploaded file is processed in memory to extract PE header bytes and is not written to permanent storage. Only the scan result (file name, hash, verdict, confidence) is saved to your scan history.' },
  { q: 'What does the confidence score mean?', a: 'It is the probability (0–100%) that the model\'s verdict is correct, based on how the file\'s features compare to the training data. Scores above 90% indicate high certainty.' },
  { q: 'Can DeepShield detect all ransomware?', a: 'DeepShield achieves 97.7% accuracy (Random Forest) and 98.2% accuracy (FNN) on the test dataset. No detector is perfect — novel or heavily obfuscated ransomware may evade detection. Use DeepShield as one layer in a broader security strategy.' },
  { q: 'Why are two models used?', a: 'Running two independent models reduces the risk of a single false negative letting a threat through. If the models disagree, you receive an extra warning to treat the file with caution.' },
  { q: 'What is a SHA-256 hash?', a: 'A cryptographic fingerprint of the file. You can paste this hash into threat intelligence platforms (e.g. VirusTotal) to check whether the exact file has been seen before.' },
  { q: 'I get "Invalid file type" even for a .exe file — why?', a: 'Make sure the file extension is .exe or .dll in lowercase. Also verify that the file is a genuine Windows PE binary and not a renamed file of a different format.' },
];

const TIPS = [
  { color: '#534AB7', bg: '#EEEDFE', title: 'Use a test binary first',          desc: 'Before scanning production files, try the benign test executable supplied with the project to confirm the scanner is working correctly.' },
  { color: '#0F6E56', bg: '#E1F5EE', title: 'Cross-reference with VirusTotal',  desc: 'Copy the SHA-256 hash shown in the result and search VirusTotal for a second opinion from 70+ AV engines.' },
  { color: '#854F0B', bg: '#FAEEDA', title: 'Never execute suspicious files',    desc: 'A "Clean" verdict means the PE header shows no ransomware indicators. It does not guarantee the file is entirely safe. Always run unknown executables in an isolated sandbox.' },
  { color: '#185FA5', bg: '#E6F1FB', title: 'Check your scan history',           desc: 'If you scan the same file twice, the history page lets you compare results over time and catch any discrepancies.' },
];

export default function UserGuide() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleScanClick = () => {
    if (isAuthenticated) navigate('/scan');
    else navigate('/login');
  };

  return (
    <div className="about-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111827' }}>

      {/* HERO */}
      <section style={{ padding: '56px 40px 48px', borderBottom: '1px solid #f3f4f6', maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          User Guide
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 16, lineHeight: 1.25 }}>
          How to use DeepShield
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 580 }}>
          This guide walks you through every feature of DeepShield — from creating an account
          to reading your scan results and managing your history. No prior security knowledge required.
        </p>
      </section>

      {/* STEP-BY-STEP */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Getting started
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 28 }}>
          Step-by-step walkthrough
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderLeft: '3px solid #16a372', borderRadius: '0 10px 10px 0', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ minWidth: 36, height: 36, borderRadius: '50%', background: '#16a372', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {s.num}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: s.tip ? 8 : 0 }}>{s.desc}</p>
                  {s.tip && (
                    <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                      <strong>Note:</strong> {s.tip}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VERDICTS */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Scan results
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Understanding your verdict
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          Each scan returns a verdict from both the Random Forest model and the Neural Network, plus an ensemble verdict that combines both.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {VERDICTS.map((v, i) => (
            <div key={i} style={{ border: `1px solid ${v.border}`, borderLeft: `3px solid ${v.color}`, borderRadius: '0 10px 10px 0', padding: '16px 20px', background: v.bg }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: v.color, marginBottom: 8 }}>{v.label}</p>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Field</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Random Forest verdict',     'Prediction from the 300-estimator Random Forest model (97.7% accuracy).'],
                ['Random Forest confidence',  'Probability score (0–100%) from the Random Forest model.'],
                ['Neural Network verdict',    'Prediction from the 3-layer Feedforward Neural Network (98.2% accuracy).'],
                ['Neural Network confidence', 'Probability score (0–100%) from the Neural Network model.'],
                ['Ensemble verdict',          'Combined result. If both models agree their verdict is used; if they disagree, you receive a caution warning.'],
                ['SHA-256 hash',              'Cryptographic fingerprint of the uploaded file. Use this to cross-reference with external threat intelligence.'],
                ['File name',                 'The original name of the uploaded file as stored in your scan history.'],
              ].map(([field, desc], i, arr) => (
                <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{field}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', lineHeight: 1.5 }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TIPS */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Best practices
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
          Tips for getting the most from DeepShield
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {TIPS.map((t, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px' }}>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: t.bg, color: t.color, marginBottom: 10 }}>
                {t.title}
              </span>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '48px 40px', borderBottom: '1px solid #f3f4f6', maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          FAQ
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
          Frequently asked questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{f.q}</p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '48px 40px', textAlign: 'center', background: '#f9fafb' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Ready to scan a file?</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          Upload any Windows PE file and get a ransomware verdict from two AI models in under 2 seconds.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleScanClick} style={{ background: '#16a372', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {isAuthenticated ? 'Go to Scanner →' : 'Get started free →'}
          </button>
          <Link to="/about" style={{ display: 'inline-block', border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
            How the AI works
          </Link>
        </div>
      </section>

    </div>
  );
}