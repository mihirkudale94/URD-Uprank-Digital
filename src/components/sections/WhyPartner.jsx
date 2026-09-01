import React from 'react';
import { Target, BarChart2, MessageCircle, Trophy } from 'lucide-react';
import './WhyPartner.css';

const reasons = [
  { title: 'Result Driven Strategies', icon: <Target size={20} /> },
  { title: 'Data Backed Decisions', icon: <BarChart2 size={20} /> },
  { title: 'Transparent Communication', icon: <MessageCircle size={20} /> },
  { title: 'Measurable Results', icon: <Trophy size={20} /> }
];

export default function WhyPartner() {
  return (
    <section className="section why-partner-section" id="why-us">
      <div className="glow-bg"></div>
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="section-header section-header-left scroll-animate">
          <span className="section-subtitle">Why Work With Us?</span>
          <h2 className="heading-md">
            Built on four <span className="gradient-text">non-negotiables.</span>
          </h2>
        </div>

        <div className="why-partner-pillars scroll-animate delay-100">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="why-pillar-card">
              <span className="pillar-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="pillar-icon">{reason.icon}</div>
              <h3>{reason.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
