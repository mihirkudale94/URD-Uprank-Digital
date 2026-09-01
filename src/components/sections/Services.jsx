import React from 'react';
import { ArrowRight, Code2, Megaphone, TrendingUp, Cpu, PenLine } from 'lucide-react';
import './Services.css';

const services = [
  {
    title: 'Website Development',
    icon: <Code2 size={22} />,
    text: 'Websites built to perform — designed around conversion optimization, not decoration.'
  },
  {
    title: 'Digital Marketing',
    icon: <Megaphone size={22} />,
    text: 'Grow your digital presence with social media strategy and engaging content.'
  },
  {
    title: 'Performance Marketing',
    icon: <TrendingUp size={22} />,
    text: 'Campaign planning and execution backed by analytics and growth strategy.'
  },
  {
    title: 'AI Powered Solutions',
    icon: <Cpu size={22} />,
    text: 'AI-powered strategies applied to marketing, so decisions move faster.'
  },
  {
    title: 'Content Design & Management',
    icon: <PenLine size={22} />,
    text: 'Engaging content, designed and managed end to end.'
  }
];

export default function Services() {
  const handleScrollToContact = (e) => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

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
            Data-driven marketing, engaging content, and AI-powered strategies that deliver real
            results.
          </p>
        </div>

        <div className="services-bento scroll-animate delay-100">
          {services.map((service) => (
            <article
              key={service.title}
              className="service-card glass-card"
            >
              <span className="service-card-icon">{service.icon}</span>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-text">{service.text}</p>
              <a href="#contact" className="service-card-link" onClick={handleScrollToContact}>
                Talk to us <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
