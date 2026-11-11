import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Facebook, ArrowUp } from 'lucide-react';
import { publicAsset } from '@/utils/publicAsset';
import { handleAnchorClick, prefersReducedMotion } from '@/utils/scrollToSection';
import { trackWebsiteEvent } from '@/utils/analytics';
import { CONTACT_EMAIL, EMAIL_URL, PHONE_TEL_URL, WHATSAPP_NUMBER_DISPLAY } from '@/utils/contactChannels';
import { ADDRESS_LINES, BUSINESS, SOCIAL_LINKS } from '@/data/siteContent';
import './Footer.css';

const quickLinks = [
  { href: '#services', label: 'What We Do' },
  { href: '#expertise', label: 'Expertise' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#how-we-work', label: 'How We Work' },
  { href: '#leadership', label: 'About' }
];

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <footer className="footer-container">
      <div className="container footer-wrap">
        {/* Brand Block */}
        <div className="footer-brand-col">
          <img src={publicAsset('/img/logo-footer.png')} alt={BUSINESS.name} className="footer-logo" width="168" height="42" loading="lazy" />
          <p className="footer-slogan">
            {BUSINESS.slogan}
          </p>
          <div className="footer-socials">
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
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
                <p>
                  <a href={EMAIL_URL} onClick={() => trackWebsiteEvent('email_click', { location: 'footer' })}>
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            </li>
            <li>
              <Phone size={16} className="footer-contact-icon" />
              <div>
                <h4>Call Us</h4>
                <p>
                  <a href={PHONE_TEL_URL} onClick={() => trackWebsiteEvent('phone_click', { location: 'footer' })}>
                    {WHATSAPP_NUMBER_DISPLAY}
                  </a>
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Address Block */}
        <div className="footer-links-col">
          <h3>Our Office</h3>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={16} className="footer-contact-icon" />
              <div>
                <h4>India Office</h4>
                {ADDRESS_LINES.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </li>
          </ul>
        </div>

        {/* Quick Links / Resources */}
        <div className="footer-links-col">
          <h3>Quick Links</h3>
          <ul className="footer-text-links">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={handleAnchorClick}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>


      {/* Footer Copy & Sticky Top */}
      <div className="container footer-bottom">
        <div className="footer-copyright">
          <p>
            {BUSINESS.legalName} &copy; {BUSINESS.foundingYear}. All rights reserved. &middot;{' '}
            <a href="/privacy.html">Privacy Policy</a>
          </p>
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
