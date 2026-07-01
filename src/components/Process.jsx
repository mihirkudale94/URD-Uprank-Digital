import React from 'react';
import { MessageSquare, Lightbulb, PenTool, RotateCw } from 'lucide-react';
import './Process.css';

export default function Process() {
  const steps = [
    {
      num: '01',
      title: 'Ask',
      desc: 'We start with the business goal, current website or campaign, audience, budget comfort, timeline, and the challenge that needs solving.',
      icon: <MessageSquare size={26} />
    },
    {
      num: '02',
      title: 'Think',
      desc: 'We map the right service mix, prioritize the highest-impact work, and define what should be measured before execution starts.',
      icon: <Lightbulb size={26} />
    },
    {
      num: '03',
      title: 'Create',
      desc: 'We build the website, campaign, content, tracking, or automation workflow with clear ownership and conversion-focused execution.',
      icon: <PenTool size={26} />
    },
    {
      num: '04',
      title: 'Repeat',
      desc: 'We review performance, learn from the data, and improve the next cycle so the digital system keeps getting sharper.',
      icon: <RotateCw size={26} />
    }
  ];

  return (
    <section className="section section-bg-alt" id="process">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Our Methodology</span>
          <h2 className="heading-md">How We Drive Results</h2>
          <p className="section-description">
            A repeatable, structured creative process designed to ensure your digital project is delivered on strategy and on budget.
          </p>
        </div>

        {/* Process Roadmap Wrapper */}
        <div className="process-timeline-wrap">
          {/* Connector Line */}
          <div className="process-connector-line"></div>

          <div className="process-grid">
            {steps.map((step, idx) => (
              <div key={step.title} className={`process-node-card glass-card scroll-animate delay-${(idx + 1) * 100}`}>
                <div className="process-header">
                  <div className="process-icon-box">
                    <span className="process-vector-icon">{step.icon}</span>
                    <span className="process-step-indicator">{step.num}</span>
                  </div>
                </div>

                <h3 className="process-node-title">{step.title}</h3>
                <p className="process-node-desc">{step.desc}</p>
                
                {/* Node connector dot */}
                <div className="process-dot-connector">
                  <div className="inner-glow-dot"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
