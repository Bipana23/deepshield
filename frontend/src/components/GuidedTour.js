import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TOUR_STEPS = [
  {
    title: 'Welcome to DeepShield 👋',
    desc: 'This quick tour will show you everything DeepShield can do. Takes less than a minute.',
    navigate: null,
  },
  {
    title: '🏠 Home page',
    desc: 'You are here! The home page shows how DeepShield works, what ransomware families it detects, and live scan results.',
    navigate: '/',
  },
  {
    title: '📖 About page',
    desc: 'Learn how the AI models work — Random Forest (97.7%) and Neural Network (98.2%) — the tech stack and the team.',
    navigate: '/about',
  },
  {
    title: '🔍 Scanner',
    desc: 'Upload any Windows .exe or .dll file. DeepShield extracts 1024 PE header bytes and gives you a verdict in under 2 seconds.',
    navigate: '/scan',
  },
  {
    title: '🕓 Scan History',
    desc: 'Every scan you run is saved here — file name, SHA-256 hash, verdict and confidence score.',
    navigate: '/history',
  },
  {
    title: '📋 User Guide',
    desc: 'Step-by-step instructions, FAQ and best practices — everything you need to get the most out of DeepShield.',
    navigate: '/user-guide',
  },
  {
    title: "You're all set! 🎉",
    desc: 'Start by creating a free account and uploading your first PE file.',
    navigate: null,
  },
];

export default function GuidedTour({ onFinish }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (current.navigate) {
      navigate(current.navigate);
    }
  }, [step]);

  const next = () => {
    if (isLast) {
      onFinish();
      navigate('/');
      return;
    }
    setStep(s => s + 1);
  };

  const skip = () => {
    onFinish();
    navigate('/');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '28px 28px 22px',
        maxWidth: 420,
        width: '90%',
        position: 'relative',
      }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
          {TOUR_STEPS.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 4,
              background: i <= step ? '#16a372' : '#e5e7eb',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step label */}
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#16a372',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
        }}>
          {step === 0
            ? 'Welcome'
            : step === TOUR_STEPS.length - 1
            ? 'Done'
            : `Step ${step} of ${TOUR_STEPS.length - 2}`}
        </p>

        <h2 style={{
          fontSize: 18, fontWeight: 700, color: '#111827',
          marginBottom: 10, lineHeight: 1.3,
        }}>
          {current.title}
        </h2>

        <p style={{
          fontSize: 14, color: '#6b7280',
          lineHeight: 1.7, marginBottom: 16,
        }}>
          {current.desc}
        </p>

        {/* Page indicator pill */}
        {current.navigate && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#E1F5EE', border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, color: '#0F6E56', fontWeight: 500,
            marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a372' }} />
            Navigating to: {current.navigate}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={skip} style={{
            background: 'transparent', border: 'none',
            color: '#9ca3af', fontSize: 13, cursor: 'pointer',
            padding: '6px 0',
          }}>
            {isLast ? '' : 'Skip tour'}
          </button>
          <button onClick={next} style={{
            background: '#16a372', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '10px 22px', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}>
            {isLast ? 'Get started →' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
}