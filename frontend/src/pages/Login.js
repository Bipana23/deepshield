import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../auth/api';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      login({ user: data.user, token: data.token });
      navigate('/scan');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const FAMILIES = [
    { name: 'WannaCry',  tag: '2017 · Global' },
    { name: 'Ryuk',      tag: '2018 · Enterprise' },
    { name: 'LockBit',   tag: '2020 · Critical' },
    { name: 'BlackCat',  tag: '2021 · Multi-sector' },
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
              Ransomware detector
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 28 }}>
              Detect ransomware<br />
              <span style={{ color: '#16a372' }}>before it encrypts</span>
            </h2>

            {/* Ransomware families */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {FAMILIES.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#111f35',
                  border: '1px solid #1e3a5f',
                  borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }} />
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{f.name}</span>
                  </div>
                  <span style={{
                    fontSize: 11, color: '#f87171',
                    background: '#450a0a',
                    border: '1px solid #7f1d1d',
                    padding: '2px 8px', borderRadius: 20,
                  }}>
                    {f.tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: '1024',   lbl: 'PE bytes' },
                { val: '98%',    lbl: 'Accuracy' },
                { val: 'RF+FNN', lbl: 'Models' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center',
                  background: '#111f35',
                  border: '1px solid #1e3a5f',
                  borderRadius: 8, padding: '12px 6px',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#16a372' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{s.lbl}</div>
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
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
              Sign in to scan for ransomware
            </p>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', borderRadius: 8,
                padding: '10px 14px', fontSize: 13, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={submit}>
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
                  outline: 'none', boxSizing: 'border-box', marginBottom: 18,
                  color: '#111827',
                }}
              />

              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                name="password" type="password"
                placeholder="••••••••"
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
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 13 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#16a372', fontWeight: 600, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}