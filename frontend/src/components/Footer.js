import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">

        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            DeepShield
          </div>
          <p className="footer__tagline">
            Deep learning malware detection.<br/>Built for education. Designed for trust.
          </p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__col-title">Platform</p>
            <Link to="/"        className="footer__link">Home</Link>
            <Link to="/login"   className="footer__link">Student login</Link>
            <Link to="/login"   className="footer__link">Supervisor login</Link>
            <Link to="/login"   className="footer__link">Admin login</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Company</p>
            <Link to="/about"   className="footer__link">About us</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Tech stack</p>
            <span className="footer__link">React 18</span>
            <span className="footer__link">Python / Flask</span>
            <span className="footer__link">TensorFlow</span>
            <span className="footer__link">CNN + LSTM</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© 2026 DeepShield — ICT301 Group Project</p>
        <p>React + Python + Flask</p>
      </div>
    </footer>
  );
}