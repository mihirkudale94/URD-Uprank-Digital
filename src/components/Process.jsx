import React from 'react';
import { MessageSquare, Lightbulb, PenTool, RotateCw } from 'lucide-react';

export default function Process() {
  const steps = [
    {
      num: '01',
      title: 'Ask',
      desc: 'Every business is unique. We start by asking critical questions to explore your brand and understand your specific challenges and goals.',
      icon: <MessageSquare size={26} />
    },
    {
      num: '02',
      title: 'Think',
      desc: 'Once we gain a clear understanding, we put our thinking hats on and brainstorm outside-the-box ideas to align your strategy with success.',
      icon: <Lightbulb size={26} />
    },
    {
      num: '03',
      title: 'Create',
      desc: 'This is where the magic happens. We transform strategy and code into fully realized, beautiful, high-performance digital products.',
      icon: <PenTool size={26} />
    },
    {
      num: '04',
      title: 'Repeat',
      desc: 'Because repetition leads to perfection, we continuously run feedback loops (Ask, Think, Create) to keep your brand optimized and ahead.',
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

      <style>{`
        .process-timeline-wrap {
          position: relative;
          margin-top: 4rem;
          padding: 2rem 0;
          z-index: 10;
        }

        .process-connector-line {
          position: absolute;
          top: 50%;
          left: 10%;
          right: 10%;
          height: 3px;
          background: linear-gradient(90deg, 
            rgba(247, 151, 31, 0.1) 0%, 
            rgba(247, 151, 31, 0.8) 50%, 
            rgba(56, 189, 248, 0.8) 100%
          );
          transform: translateY(-50%);
          z-index: 1;
          pointer-events: none;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          position: relative;
          z-index: 5;
        }

        .process-node-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2.5rem 2rem;
        }

        .process-icon-box {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          transition: var(--transition-normal);
        }

        .process-vector-icon {
          color: var(--text-muted);
          transition: var(--transition-normal);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .process-step-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--gradient-accent);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(229, 46, 113, 0.3);
        }

        .process-node-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.75rem;
          transition: var(--transition-fast);
        }

        .process-node-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .process-dot-connector {
          position: absolute;
          bottom: -2.5rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-normal);
          z-index: 10;
        }

        .inner-glow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-dim);
          transition: var(--transition-normal);
        }

        /* Hover Interactions */
        .process-node-card:hover {
          border-color: var(--border-color-hover);
          transform: translateY(-8px);
        }

        .process-node-card:hover .process-icon-box {
          border-color: var(--primary);
          background: rgba(247, 151, 31, 0.05);
          box-shadow: 0 0 20px rgba(247, 151, 31, 0.15);
        }

        .process-node-card:hover .process-vector-icon {
          transform: scale(1.1);
          color: var(--primary);
        }

        .process-node-card:hover .process-node-title {
          color: var(--primary);
        }

        .process-node-card:hover .process-dot-connector {
          border-color: var(--primary);
          transform: scale(1.2);
        }

        .process-node-card:hover .inner-glow-dot {
          background: var(--primary);
          box-shadow: 0 0 8px var(--primary);
        }

        @media (max-width: 1024px) {
          .process-connector-line {
            display: none;
          }
          .process-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 3rem;
          }
          .process-dot-connector {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .process-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
