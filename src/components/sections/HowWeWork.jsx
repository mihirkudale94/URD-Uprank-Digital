import React from 'react';
import { PhoneCall, ClipboardList, Rocket, LineChart } from 'lucide-react';
import './HowWeWork.css';

const steps = [
  {
    title: 'Discovery call',
    icon: <PhoneCall size={20} />,
    text: 'A free call to understand the business, what you’re already running, and where the enquiries are leaking.'
  },
  {
    title: 'Scope and plan',
    icon: <ClipboardList size={20} />,
    text: 'You get it in writing — what we’ll do, what it costs, and the numbers we’re measuring it against.'
  },
  {
    title: 'Build and launch',
    icon: <Rocket size={20} />,
    text: 'We build the site, wire up the tracking and take the campaigns live — in your accounts, in your name.'
  },
  {
    title: 'Run and report monthly',
    icon: <LineChart size={20} />,
    text: 'Every month you get what changed, what it produced, and what we’re doing about it next.'
  }
];

export default function HowWeWork() {
  return (
    <section className="section how-section" id="how-we-work">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">How We Work</span>
          <h2 className="heading-md">
            Four steps, from first call to <span className="gradient-text">monthly report.</span>
          </h2>
          <p className="section-description">
            No onboarding maze, no account-manager relay. This is the whole process.
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
