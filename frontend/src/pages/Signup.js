import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../auth/api';

export default function Signup() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/signup', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     'student',
      });
      login({ user: data.user, token: data.token });
      setSuccess('Account created! Redirecting…');
      setTimeout(() => navigate('/scan'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const STEPS = [
    { num: '1', title: 'Create your account',  desc: 'Name, email and password — takes 30 seconds' },
    { num: '2', title: 'Upload a PE file',      desc: '.exe or .dll — 1024 PE header bytes extracted' },
    { num: '3', title: 'Get your verdict',      desc: 'Random Forest + FNN both analyse your file' },
  ];

  const TRUST = [
    'No credit card required',
    'Files deleted after scan',
    'Results saved to your history',
    'WannaCry · Ryuk · LockBit · Conti detection',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060c1a',
      display: 'flex',
      alignItems: 'stretch',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
      }}>

        {/* ── LEFT dark panel ── */}
        <div style={{
          width: '44%',
          background: '#0a1628',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
        }}>
          {/* Brand */}
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#16a372',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>DeepShield</span>
          </a>

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#16a372', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Get started free
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 32 }}>
              Start detecting<br />
              <span style={{ color: '#16a372' }}>ransomware today</span>
            </h2>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#16a372', color: '#fff',
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {s.num}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{s.title}</p>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TRUST.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#16a372', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: '#475569' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#334155' }}>
            PE file static analysis · Random Forest + FNN
          </p>
        </div>

        {/* ── RIGHT form ── */}
        <div style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 60px',
          minHeight: '100vh',
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
              Start scanning for ransomware — free forever
            </p>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', borderRadius: 8,
                padding: '10px 14px', fontSize: 13, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: '#ecfdf5', border: '1px solid #bbf7d0',
                color: '#16a372', borderRadius: 8,
                padding: '10px 14px', fontSize: 13, marginBottom: 16,
              }}>
                {success}
              </div>
            )}

            <form onSubmit={submit}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                name="name"
                placeholder="Your name"
                value={form.name} onChange={handle} required
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 8,
                  border: '1px solid #e5e7eb', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', marginBottom: 16,
                  color: '#111827',
                }}
              />

              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Email
              </label>
              <input
                name="email" type="email"
                placeholder="you@example.com"
                value={form.email} onChange={handle} required
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 8,
                  border: '1px solid #e5e7eb', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', marginBottom: 16,
                  color: '#111827',
                }}
              />

              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                name="password" type="password"
                placeholder="Min 8 characters"
                value={form.password} onChange={handle} required
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 8,
                  border: '1px solid #e5e7eb', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', marginBottom: 28,
                  color: '#111827',
                }}
              />

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                borderRadius: 8, border: 'none',
                background: '#16a372', color: '#fff',
                fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 13 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#16a372', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}