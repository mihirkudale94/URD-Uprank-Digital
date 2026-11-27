import React from 'react';
import { ArrowRight, Check, MessageCircle, PhoneCall, X } from 'lucide-react';
import { SERVICES, SERVICE_PAGES, servicePath } from '@/data/siteContent';
import { buildWhatsAppUrl } from '@/utils/contactChannels';
import { trackWebsiteEvent } from '@/utils/analytics';
import { handleAnchorClick } from '@/utils/scrollToSection';
import HowWeWork from '@/components/sections/HowWeWork';
import Testimonials from '@/components/sections/Testimonials';
import ContactForm from '@/components/sections/ContactForm';
import './ServicePage.css';

// The landing page for one service line, at /services/<id>/. The hero, pain points,
// scope and FAQ are this service's own; process, testimonials and the form are the
// homepage's sections, reused so the enquiry path is identical everywhere.
export default function ServicePage({ serviceId }) {
  const service = SERVICES.find((item) => item.id === serviceId);
  const page = SERVICE_PAGES[serviceId];
  const others = SERVICES.filter((item) => item.id !== serviceId);

  return (
    <>
      <header className="hero service-hero" id="home">
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-grid"></div>
        <div className="container hero-grid-split animate-fade-in-up">
          <nav className="service-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a> <span aria-hidden="true">/</span>{' '}
            <a href="/#services">Services</a> <span aria-hidden="true">/</span>{' '}
            <span aria-current="page">{service.title}</span>
          </nav>
          <h1 className="hero-title">{page.heading}</h1>
          <p className="hero-description">{page.intro}</p>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary" onClick={(e) => handleAnchorClick(e, '#contact')}>
              Book a Free Discovery Call <PhoneCall size={18} />
            </a>
            <a
              href={buildWhatsAppUrl(`Hi Up Rank Digital, I'd like to talk about ${service.title.toLowerCase()}.`)}
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => trackWebsiteEvent('whatsapp_click', { location: `service_${serviceId}` })}
            >
              WhatsApp Us <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </header>

      <section className="section" id="service-detail">
        <div className="container service-columns">
          <div className="glass-card service-panel scroll-animate">
            <h2 className="heading-sm">Sound familiar?</h2>
            <ul className="service-list service-list-problems">
              {page.problems.map((item) => (
                <li key={item}>
                  <X size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card service-panel scroll-animate delay-100">
            <h2 className="heading-sm">What you get</h2>
            <ul className="service-list">
              {service.includes.map((item) => (
                <li key={item}>
                  <Check size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="service-panel-for">{service.forWho}</p>
          </div>
        </div>
      </section>

      <HowWeWork />
      <Testimonials />

      <section className="section section-bg-alt" id="faq">
        <div className="container service-faq">
          <div className="section-header scroll-animate">
            <span className="section-subtitle">FAQ</span>
            <h2 className="heading-md">Questions about {service.title.toLowerCase()}</h2>
          </div>
          {page.faqs.map((faq) => (
            <details key={faq.q} className="glass-card service-faq-item">
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactForm defaultService={service.title} />

      <section className="section" id="other-services">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Also from Up Rank Digital</span>
            <h2 className="heading-md">Other services</h2>
          </div>
          <ul className="service-others">
            {others.map((item) => (
              <li key={item.id}>
                <a className="glass-card" href={`/${servicePath(item.id)}`}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
