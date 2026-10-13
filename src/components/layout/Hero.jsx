import React from 'react';
import { ArrowDown, MessageSquare, Sparkles } from 'lucide-react';
import { handleAnchorClick } from '@/utils/scrollToSection';
import './Hero.css';

export default function Hero() {
  const handleScrollToContact = (e) => handleAnchorClick(e, '#contact');
  const handleScrollToServices = (e) => handleAnchorClick(e, '#services');

  return (
    <header className="hero" id="home">
      {/* Dynamic ambient background glows */}
      <div className="hero-glow hero-glow-1"></div>
      <div className="hero-glow hero-glow-2"></div>
      <div className="hero-grid"></div>

      <div className="container hero-grid-split animate-fade-in-up">
        <div className="hero-left-content">
          <span className="hero-tag">
            <Sparkles size={13} className="hero-tag-sparkle" /> Digital Growth Partner
          </span>

          <h1 className="hero-title">
            Website development and digital performance marketing{' '}
            <span className="gradient-text">using AI</span>
          </h1>

          <p className="hero-description">
            Pune-based, 10+ years in. We build your site, run your campaigns, and report what
            actually moved — one team accountable for the whole thing, start to finish.
          </p>

          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary" onClick={handleScrollToContact}>
              Book a Call <MessageSquare size={18} />
            </a>
            <a href="#services" className="btn btn-secondary" onClick={handleScrollToServices}>
              What We Do <ArrowDown size={18} className="arrow-bounce" />
            </a>
          </div>

          <div className="hero-proof">
            <strong className="hero-proof-value">10+</strong>
            <span className="hero-proof-label">
              Years of experience
              <em>Driving growth. Delivering results.</em>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
