import React, { useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import './FAQ.css';

const faqItems = [
  {
    question: 'What does Up Rank Digital help with?',
    answer: 'URD helps businesses improve their digital presence through website development, digital marketing, performance marketing, AI powered solutions, and content design & management.'
  },
  {
    question: 'How do we know which service is right for us?',
    answer: 'We begin with your business goal, current website or social presence, audience, budget comfort, and timeline. Then we recommend a practical starting scope, so you do not pay for channels, tools, or features that are not needed yet.'
  },
  {
    question: 'How much does a website or marketing project cost?',
    answer: 'Pricing depends on scope, page count, creative requirements, ad channels, content needs, tracking setup, and timeline. After a short discovery call, URD can suggest the right starting plan instead of forcing every business into one fixed package.'
  },
  {
    question: 'How long does a website project usually take?',
    answer: 'A focused landing page can move faster, while a full website, e-commerce build, or custom software project needs deeper planning, content, design, development, testing, and launch support. URD confirms a realistic timeline after understanding the project size.'
  },
  {
    question: 'Can URD manage website, SEO, ads, content, and analytics together?',
    answer: 'Yes. Many businesses get better results when website experience, search visibility, campaign traffic, content, conversion tracking, and reporting are connected instead of being handled separately by different teams.'
  },
  {
    question: 'How does URD use AI in marketing and growth work?',
    answer: 'AI supports research, planning, audience insights, content workflows, campaign analysis, automation ideas, and conversion optimization. Human strategy, review, brand judgment, and implementation remain central.'
  },
  {
    question: 'Will we own our website, content, and accounts?',
    answer: 'Yes. URD believes in transparent ownership. Your website, brand assets, analytics, ad accounts, content, and business data should stay under your control unless a different arrangement is clearly agreed in advance.'
  },
  {
    question: 'Do you guarantee SEO rankings, leads, or ad results?',
    answer: 'No serious agency should promise fixed rankings, guaranteed leads, or guaranteed revenue. URD focuses on the parts that can be controlled: strategy, technical quality, content, targeting, landing-page experience, tracking, testing, and ongoing optimization.'
  },
  {
    question: 'How do you measure success and report progress?',
    answer: 'Success is tied to the business goal: qualified leads, traffic quality, conversion rate, campaign performance, search visibility, engagement, revenue signals, or operational efficiency. Reports focus on what changed, what it means, and what to do next.'
  },
  {
    question: 'Can you improve an existing website or campaign?',
    answer: 'Yes. URD can audit an existing website, landing page, ad account, SEO setup, analytics, or content workflow, then recommend improvements before suggesting a larger rebuild or campaign plan.'
  },
  {
    question: 'Do you work with startups, local businesses, and established brands?',
    answer: 'Yes. URD works with service-led businesses, e-commerce brands, B2B companies, SaaS teams, sports clubs, and growing brands that need a practical digital partner for strategy and execution.'
  },
  {
    question: 'What is the best way to start?',
    answer: 'Share your business name, website or social link, current goal, timeline, and the challenge you want to solve. URD will review the context and suggest the most useful next step.'
  }
];

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

          <a className="btn btn-secondary faq-cta" href="#contact">
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
