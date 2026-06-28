import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Facebook, ArrowUp } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container">
      <div className="container footer-wrap">
        {/* Brand Block */}
        <div className="footer-brand-col">
          <img src={publicAsset('/img/logo-footer.png')} alt="Uprank Digital" className="footer-logo" />
          <p className="footer-slogan">
            Transforming brands, designing websites, and scaling digital solutions with global expertise.
          </p>
          <div className="footer-socials">
            <a href="https://in.linkedin.com/company/uprankdigital" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="https://www.facebook.com/UpRankDigital/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        {/* Contact Info Block */}
        <div className="footer-links-col">
          <h3>Get in Touch</h3>
          <ul className="footer-contact-list">
            <li>
              <Mail size={16} className="footer-contact-icon" />
              <div>
                <h4>Email</h4>
                <p><a href="mailto:sachin@uprankdigital.com">sachin@uprankdigital.com</a></p>
              </div>
            </li>
            <li>
              <Phone size={16} className="footer-contact-icon" />
              <div>
                <h4>Call Us</h4>
                <p>+91 93711 16165</p>
                <p>+91 98236 60991</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Address Block */}
        <div className="footer-links-col">
          <h3>Our Office</h3>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={18} className="footer-contact-icon" />
              <div>
                <h4>India Office</h4>
                <p>16 Harshnil Society, 81 Rambag Colony,</p>
                <p>Paud Road, Pune 411038, INDIA</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Quick Links / Resources */}
        <div className="footer-links-col">
          <h3>Quick Links</h3>
          <ul className="footer-text-links">
            <li><a href="#services">What We Do</a></li>
            <li><a href="#who">Who We Are</a></li>
            <li><a href="#process">How We Work</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Copy & Sticky Top */}
      <div className="container footer-bottom">
        <div className="footer-bottom-spacer" />
        <div className="footer-copyright">
          <p>URD SOLUTIONS PVT. LTD. &copy; 2017. All Rights Reserved.</p>
        </div>

        <button 
          className="back-to-top-btn" 
          onClick={handleScrollToTop}
          aria-label="Scroll back to top"
        >
          <ArrowUp size={18} />
        </button>
      </div>

      <style>{`
        .footer-container {
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 5rem 0 2rem 0;
          position: relative;
          z-index: 10;
        }

        .footer-wrap {
          display: grid;
          grid-template-columns: 1.25fr 0.85fr 1.1fr 0.8fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .footer-logo {
          height: 42px;
          object-fit: contain;
          align-self: flex-start;
          filter: var(--footer-logo-filter);
        }

        .footer-slogan {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .footer-socials {
          display: flex;
          gap: 1rem;
        }

        .footer-socials a {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }

        .footer-socials a:hover {
          background: var(--gradient-accent);
          color: #ffffff;
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(229, 46, 113, 0.25);
        }

        .footer-links-col h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.75rem;
        }

        .footer-contact-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .footer-contact-list li {
          display: flex;
          gap: 1rem;
          min-width: 0;
        }

        .footer-contact-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .footer-contact-list h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .footer-contact-list p {
          color: var(--text-main);
          font-size: 0.9rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .footer-contact-list a:hover {
          color: var(--primary);
        }

        .footer-text-links {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .footer-text-links a {
          color: var(--text-muted);
          font-size: 0.95rem;
          transition: var(--transition-fast);
        }

        .footer-text-links a:hover {
          color: var(--primary);
          padding-left: 5px;
        }

        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-bottom-spacer {
          width: 44px;
          display: block;
        }

        .footer-copyright {
          text-align: center;
        }

        .footer-copyright p {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin: 0;
        }

        .back-to-top-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          outline: none;
        }

        .back-to-top-btn:hover {
          background: var(--gradient-accent);
          color: #ffffff;
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(229, 46, 113, 0.25);
        }

        @media (max-width: 1024px) {
          .footer-wrap {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        @media (max-width: 600px) {
          .footer-wrap {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .footer-container {
            padding: 3rem 0 2rem 0;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1.5rem;
            justify-content: center;
          }
          .footer-bottom-spacer {
            display: none;
          }
          .footer-contact-list li {
            gap: 0.75rem;
          }
        }
      `}</style>
    </footer>
  );
}
