import React from 'react';
import { Code2, Megaphone, TrendingUp, Cpu, PenLine, Check, MessageCircle } from 'lucide-react';
import { SERVICES } from '@/data/siteContent';
import { requestOpenAssistant } from '@/utils/assistantEvents';
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
            Five service lines. <span className="gradient-text">One growth partner.</span>
          </h2>
          <p className="section-description">
            Start with the one that moves your numbers most. Add the next when the results
            justify it, not because it came bundled.
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
              {service.includes && (
                <ul className="service-card-includes">
                  {service.includes.map((item) => (
                    <li key={item}>
                      <Check size={14} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {service.id === 'ai-solutions' && (
                // The assistant in the corner of this page is the service, working. Showing
                // it beats describing it.
                <button
                  type="button"
                  className="service-card-demo"
                  onClick={() => requestOpenAssistant('ai_service_card')}
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  Try it: the chat assistant on this page is one we built
                </button>
              )}
              {service.forWho && <p className="service-card-for">{service.forWho}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
