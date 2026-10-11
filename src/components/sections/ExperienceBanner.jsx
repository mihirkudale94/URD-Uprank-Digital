import React from 'react';
import { ArrowRight } from 'lucide-react';
import { handleAnchorClick } from '@/utils/scrollToSection';
import './ExperienceBanner.css';

export default function ExperienceBanner() {
  const handleScrollToContact = (e) => handleAnchorClick(e, '#contact');

  return (
    <section className="experience-banner" id="experience" aria-label="Ten plus years of experience">
      <div className="experience-banner-glow"></div>
      <div className="grid-bg-overlay"></div>

      <div className="container experience-banner-inner scroll-animate">
        <span className="experience-years">10+ Years of Experience</span>

        <h2 className="experience-headline">
          Driving Growth.<br />
          <span className="gradient-text">Delivering Results.</span>
        </h2>

        <a href="#contact" className="btn btn-primary" onClick={handleScrollToContact}>
          Start a Conversation <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
