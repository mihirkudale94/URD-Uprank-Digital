import React from 'react';
import { CheckCircle2, Target, BarChart2, MessageCircle, Trophy } from 'lucide-react';
import './WhyPartner.css';

const highlights = [
  { title: 'Result Driven Strategies', icon: <Target size={20} /> },
  { title: 'Data Backed Decisions', icon: <BarChart2 size={20} /> },
  { title: 'Transparent Communication', icon: <MessageCircle size={20} /> },
  { title: 'Measurable Results', icon: <Trophy size={20} /> }
];

const expertise = [
  'Website Development',
  'Digital Performance Marketing',
  'AI Powered Marketing Solutions',
  'Conversion Optimization',
  'Analytics & Growth Strategy',
  'Content Design & Management',
  'Social Media Strategy',
  'Campaign Planning & Execution'
];

export default function WhyPartner() {
  return (
    <section className="section why-partner-section" id="why-us">
      <div className="glow-bg"></div>
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Our Edge</span>
          <h2 className="heading-md">Why Partner with Up Rank Digital?</h2>
          <p className="section-description">
            We don't just run campaigns — we build growth systems engineered around your goals, your data, and your market.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="why-partner-pillars scroll-animate delay-100">
          {highlights.map((h, i) => (
            <div key={i} className="why-pillar-card glass-card">
              <div className="pillar-icon">{h.icon}</div>
              <h3>{h.title}</h3>
            </div>
          ))}
        </div>

        {/* Expertise Grid */}
        <div className="why-expertise-block scroll-animate delay-200">
          <h3 className="expertise-block-title">Area of Expertise</h3>
          <div className="why-expertise-grid">
            {expertise.map((item, index) => (
              <div key={index} className="why-expertise-item">
                <CheckCircle2 size={16} className="check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
