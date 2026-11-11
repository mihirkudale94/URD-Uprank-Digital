import React from 'react';
import { PhoneCall, ClipboardList, Rocket, LineChart } from 'lucide-react';
import { PROCESS_STEPS } from '@/data/siteContent';
import './HowWeWork.css';

// Icons are presentation, so they stay here; the titles and copy come from siteContent.js.
const stepIcons = {
  discovery: <PhoneCall size={20} />,
  plan: <ClipboardList size={20} />,
  launch: <Rocket size={20} />,
  report: <LineChart size={20} />
};

const steps = PROCESS_STEPS.map((step) => ({ ...step, icon: stepIcons[step.id] }));

export default function HowWeWork() {
  return (
    <section className="section how-section" id="how-we-work">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">How We Work</span>
          <h2 className="heading-md">
            From first call to <span className="gradient-text">first results.</span>
          </h2>
          <p className="section-description">
            No long onboarding and no account manager in the middle. You talk to the people
            doing the work, and this is the whole process.
          </p>
        </div>

        {/* An ordered list, because the order is the reassurance. */}
        <ol className="process-rail scroll-animate delay-100">
          {steps.map((step, index) => (
            <li key={step.title} className="process-step">
              <div className="process-step-head">
                <span className="process-step-icon">{step.icon}</span>
                <span className="process-step-index">Step {String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
