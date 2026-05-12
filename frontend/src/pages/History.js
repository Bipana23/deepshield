import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../auth/api';
import { useAuth } from '../auth/AuthContext';

export default function History() {
  const { user }    = useAuth();
  const [scans, setScans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/api/scans/my')
      .then(({ data }) => { setScans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = scans.filter(s => {
    if (filter === 'ransomware') return s.verdict === 'Ransomware' || s.verdict === 'Malware';
    if (filter === 'clean')      return s.verdict === 'Clean'      || s.verdict === 'Benign';
    return true;
  });

  const isRansomware = v => v === 'Ransomware' || v === 'Malware';
  const total      = scans.length;
  const ransomware = scans.filter(s => isRansomware(s.verdict)).length;
  const clean      = total - ransomware;

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#f9fafb',
      padding: '36px 40px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Scan History
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          All ransomware scans for {user?.name || 'you'}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16, marginBottom: 28,
      }}>
        {[
          { label: 'Total Scans',  value: total,      color: '#2563eb' },
          { label: 'Ransomware',   value: ransomware, color: '#dc2626' },
          { label: 'Clean',        value: clean,      color: '#16a372' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter + New Scan */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'ransomware', 'clean'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 20,
              border: '1px solid',
              borderColor: filter === f ? '#16a372' : '#e5e7eb',
              background: filter === f ? '#16a372' : '#fff',
              color: filter === f ? '#fff' : '#6b7280',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>
              {f === 'all' ? 'All' : f === 'ransomware' ? 'Ransomware' : 'Clean'}
            </button>
          ))}
        </div>
        <Link to="/scan" style={{
          background: '#16a372', color: '#fff',
          padding: '8px 18px', borderRadius: 8,
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}>
          + New Scan
        </Link>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>
              {scans.length === 0 ? 'No scans yet.' : 'No results match this filter.'}
            </p>
            {scans.length === 0 && (
              <Link to="/scan" style={{
                background: '#16a372', color: '#fff',
                padding: '9px 20px', borderRadius: 8,
                textDecoration: 'none', fontSize: 13, fontWeight: 600,
              }}>
                Scan your first file →
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['File', 'Verdict', 'Confidence', 'Scan Time', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{
                    padding: '12px 20px', fontSize: 13,
                    color: '#111827', fontWeight: 500,
                    maxWidth: 260, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    📄 {s.filename}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: isRansomware(s.verdict) ? '#fef2f2' : '#ecfdf5',
                      color:      isRansomware(s.verdict) ? '#dc2626' : '#16a372',
                      border: `1px solid ${isRansomware(s.verdict) ? '#fecaca' : '#bbf7d0'}`,
                    }}>
                      {isRansomware(s.verdict) ? 'Ransomware' : 'Clean'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#374151' }}>
                    {s.confidence}%
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#6b7280' }}>
                    {s.scan_time}s
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#6b7280' }}>
                    {new Date(s.created_at).toLocaleDateString('en-AU', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}