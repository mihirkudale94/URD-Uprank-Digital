import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Facebook, ArrowUp } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';
import './Footer.css';

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container">
      <div className="container footer-wrap">
        {/* Brand Block */}
        <div className="footer-brand-col">
          <img src={publicAsset('/img/logo-footer.png')} alt="Uprank Digital" className="footer-logo" width="168" height="42" loading="lazy" />
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
                <p>+91 7391096690</p>
                <p>+91 9371116165</p>
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
                <p>Shyamal CHS</p>
                <p>Pune 411038, India</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Quick Links / Resources */}
        <div className="footer-links-col">
          <h3>Quick Links</h3>
          <ul className="footer-text-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#who">About</a></li>
            <li><a href="#process">Approach</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Copy & Sticky Top */}
      <div className="container footer-bottom">
        <div className="footer-copyright">
          <p>URD SOLUTIONS PVT. LTD. &copy; 2017. All Rights Reserved.</p>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button 
        className={`back-to-top-btn ${showBackToTop ? 'visible' : ''}`}
        onClick={handleScrollToTop}
        aria-label="Scroll back to top"
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  );
}
