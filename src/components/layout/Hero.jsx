import React from 'react';
import { MessageCircle, PhoneCall, Sparkles } from 'lucide-react';
import { WHATSAPP_URL } from '@/utils/contactChannels';
import { trackWebsiteEvent } from '@/utils/analytics';
import { handleAnchorClick } from '@/utils/scrollToSection';
import './Hero.css';

export default function Hero() {
  const handleScrollToContact = (e) => handleAnchorClick(e, '#contact');
  const handleWhatsAppClick = () => {
    trackWebsiteEvent('whatsapp_click', { location: 'hero' });
  };

  return (
    <header className="hero" id="home">
      {/* Dynamic ambient background glows */}
      <div className="hero-glow hero-glow-1"></div>
      <div className="hero-glow hero-glow-2"></div>
      <div className="hero-grid"></div>

      <div className="container hero-grid-split animate-fade-in-up">
        <div className="hero-left-content">
          <span className="hero-tag">
            <Sparkles size={13} className="hero-tag-sparkle" /> Clicks don&rsquo;t pay. Enquiries do.
          </span>

          <h1 className="hero-title">
            Website development and digital performance marketing{' '}
            <span className="gradient-text">using AI.</span>
          </h1>

          {/* Two ways in, because they suit different visitors: the form captures the
              considered enquiry, WhatsApp catches the one who wants an answer now. */}
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary" onClick={handleScrollToContact}>
              Book a Call <PhoneCall size={18} />
            </a>
            <a
              href={WHATSAPP_URL}
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer noopener"
              onClick={handleWhatsAppClick}
            >
              {/* lucide ships no WhatsApp glyph, so this borrows the chat bubble, as the
                  contact card does. The label carries the brand. */}
              WhatsApp Us <MessageCircle size={18} />
            </a>
          </div>

          <div className="hero-proof">
            <strong className="hero-proof-value">10+</strong>
            <span className="hero-proof-label">
              Years of experience
              <em>Websites, campaigns and reporting for Indian businesses.</em>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
