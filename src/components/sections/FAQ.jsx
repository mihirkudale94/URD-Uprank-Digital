import React, { useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { handleAnchorClick } from '@/utils/scrollToSection';
import { faqItems } from '@/data/faq';
import './FAQ.css';


const trustPoints = [
  { label: 'Transparent ownership', icon: ShieldCheck },
  { label: 'Measured outcomes', icon: BarChart3 },
  { label: 'Scope-first pricing', icon: CheckCircle2 }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section faq-section" id="faq" aria-labelledby="faq-title">
      <div className="grid-bg-overlay"></div>

      <div className="container faq-layout">
        <div className="faq-intro scroll-animate">
          <span className="section-subtitle">FAQ</span>
          <h2 className="heading-md" id="faq-title">Clear answers before you book a call</h2>
          <p className="section-description">
            The questions serious buyers ask before choosing a digital growth partner, answered with clarity instead of generic marketing noise.
          </p>

          <div className="faq-trust-list" aria-label="Client assurance points">
            {trustPoints.map(({ label, icon: Icon }) => (
              <div className="faq-trust-pill" key={label}>
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <a className="btn btn-secondary faq-cta" href="#contact" onClick={handleAnchorClick}>
            Ask a specific question <ArrowRight size={16} />
          </a>
        </div>

        <div className="faq-accordion scroll-animate delay-100">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;
            const buttonId = `faq-question-${index}`;

            return (
              <article className={`faq-item ${isOpen ? 'active' : ''}`} key={item.question}>
                <button
                  className="faq-question"
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="faq-question-icon">
                    <HelpCircle size={17} />
                  </span>
                  <span>{item.question}</span>
                  <ChevronDown className="faq-chevron" size={18} />
                </button>

                <div
                  className="faq-answer"
                  id={answerId}
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
