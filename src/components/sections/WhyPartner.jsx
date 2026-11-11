import React from 'react';
import { UserCheck, Target, KeyRound, Users, SlidersHorizontal, Award } from 'lucide-react';
import { WHY_US } from '@/data/siteContent';
import './WhyPartner.css';

// Icons are presentation, so they stay here; the titles and copy come from siteContent.js.
const reasonIcons = {
  'founder-led': <UserCheck size={20} />,
  enquiries: <Target size={20} />,
  ownership: <KeyRound size={20} />,
  'one-team': <Users size={20} />,
  'honest-scope': <SlidersHorizontal size={20} />,
  proven: <Award size={20} />
};

export default function WhyPartner() {
  return (
    <section className="section why-partner-section" id="why-us">
      <div className="glow-bg"></div>
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="section-header section-header-left scroll-animate">
          <span className="section-subtitle">Why Work With Us</span>
          <h2 className="heading-md">
            Six reasons clients <span className="gradient-text">stay with us.</span>
          </h2>
          <p className="section-description">
            Most agencies promise results. Here is how we work so you can check them yourself.
          </p>
        </div>

        <div className="why-partner-pillars scroll-animate delay-100">
          {WHY_US.map((reason, index) => (
            <div key={reason.id} className="why-pillar-card">
              <span className="pillar-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="pillar-icon">{reasonIcons[reason.id]}</div>
              <h3>{reason.title}</h3>
              <p className="pillar-text">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
