import React from 'react';
import { Code2, Megaphone, TrendingUp, Cpu, PenLine } from 'lucide-react';
import { SERVICES } from '@/data/siteContent';
import './Services.css';

// Icons are presentation, so they stay here; the titles and copy come from siteContent.js.
const serviceIcons = {
  'website-development': <Code2 size={22} />,
  'digital-marketing': <Megaphone size={22} />,
  'performance-marketing': <TrendingUp size={22} />,
  'ai-solutions': <Cpu size={22} />,
  'content-management': <PenLine size={22} />
};

export default function Services() {
  return (
    <section className="section services-section" id="services">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">What We Do</span>
          <h2 className="heading-md">
            Five Service Lines. <span className="gradient-text">One Growth Partner.</span>
          </h2>
          <p className="section-description">
            Start with one. Add the next when the numbers justify it &mdash; not because it came
            bundled.
          </p>
        </div>

        <div className="services-bento scroll-animate delay-100">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="service-card glass-card"
            >
              <span className="service-card-icon">{serviceIcons[service.id]}</span>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-text">{service.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
