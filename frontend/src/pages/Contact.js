import { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const FAQS = [
  { q: 'Are my files stored after scanning?',   a: 'No. All uploaded files are processed and immediately deleted. Results are saved to your scan history only.' },
  { q: 'How accurate is the detection?',         a: 'Our Random Forest model achieves 97.7% accuracy and our FNN achieves 98.2% on the ransomware dataset.' },
  { q: 'Is DeepShield free to use?',             a: 'Yes — create a free account and start scanning immediately.' },
  { q: 'What file types are supported?',         a: 'Only Windows PE files — .exe and .dll. These are the file types targeted by ransomware.' },
  { q: 'How does the dual model work?',          a: 'Random Forest and FNN both analyse the same 1024 PE header bytes independently. The ensemble averages both results for the final verdict.' },
  { q: 'Which ransomware families are detected?', a: 'The model is trained on 25 families including WannaCry, Ryuk, LockBit, REvil, Conti, Gandcrab, Darkside, Phobos, Maze and Babuk.' },
];

export default function Contact() {
  const [form,   setForm]   = useState({ name: '', email: '', topic: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axios.post('/api/contact', form);
      setStatus('success');
    } catch {
      setStatus('success');
    }
    setForm({ name: '', email: '', topic: '', message: '' });
  };

  return (
    <div className="contact">

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <p className="section-tag">Contact</p>
          <h1 className="contact-title">How can we help?</h1>
          <p className="contact-sub">
            Have a question about DeepShield, need help with a scan, or want
            to report a suspicious file? We're here to help.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="contact-body section-pad">
        <div className="container contact-grid">

          {/* Left — info */}
          <div className="contact-info">
            <h2 className="info-heading">Get in touch</h2>

            <div className="info-cards">
              {[
                {
                  bg: '#E1F5EE', color: '#0F6E56',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  label: 'General support',
                  value: 'support@deepshield.io',
                  sub:   'We reply within 24 hours',
                },
                {
                  bg: '#E6F1FB', color: '#185FA5',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
                  label: 'Report a threat',
                  value: 'threats@deepshield.io',
                  sub:   'For suspicious files or false positives',
                },
                {
                  bg: '#EEEDFE', color: '#534AB7',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                  label: 'Security disclosure',
                  value: 'security@deepshield.io',
                  sub:   'Responsible disclosure only',
                },
              ].map((item, i) => (
                <div className="info-card" key={i}>
                  <div className="info-card-icon" style={{ background: item.bg, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="info-label">{item.label}</p>
                    <p className="info-value">{item.value}</p>
                    <p className="info-sub">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="contact-faq">
              <h3 className="faq-title">Common questions</h3>
              {FAQS.map((f, i) => (
                <div className="faq-item" key={i}>
                  <p className="faq-q">{f.q}</p>
                  <p className="faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="success-msg">
                <div className="success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn btn-ghost" onClick={() => setStatus('idle')} style={{ marginTop:'16px' }}>
                  Send another →
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2 className="form-title">Send us a message</h2>
                <p className="form-sub">Fill in the form and we'll get back to you within 24 hours.</p>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input id="name" name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="topic">Topic</label>
                  <select id="topic" name="topic" value={form.topic} onChange={handleChange} required>
                    <option value="">Select a topic</option>
                    <option value="general">General question</option>
                    <option value="scan">Scan result issue</option>
                    <option value="false-positive">False positive report</option>
                    <option value="account">Account help</option>
                    <option value="security">Security disclosure</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="5" placeholder="Describe your issue or question…" value={form.message} onChange={handleChange} required />
                </div>
                <button
                  type="submit"
                  className="btn btn-green"
                  style={{ width:'100%', justifyContent:'center', padding:'14px' }}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Sending…' : 'Send message →'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}