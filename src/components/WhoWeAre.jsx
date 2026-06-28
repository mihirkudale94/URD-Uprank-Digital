import React, { useState } from 'react';
import { Eye, Target, Heart, Sparkles, Compass, Award } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';

export default function WhoWeAre() {
  const [activeTab, setActiveTab] = useState('vision');

  const tabs = {
    vision: {
      label: 'Vision',
      icon: <Eye size={18} />,
      title: 'Next-Gen Digital Pioneers',
      content: 'To establish Up Rank Digital as an agency that advocates progressive and innovative ideas to its clients, framing strategies with next generation techniques.',
      image: publicAsset('/img/vision.png')
    },
    mission: {
      label: 'Mission',
      icon: <Target size={18} />,
      title: 'Value-Driven Execution',
      content: 'To help businesses grow by understanding their business needs and requirements, then delivering high quality and value-for-money solutions with complete satisfaction. We do not believe in selling services that our clients do not need, and transparency is at the core of our business relationship.',
      image: publicAsset('/img/mission.png')
    },
    values: {
      label: 'Values',
      icon: <Heart size={18} />,
      title: 'The Two T\'s: Trust & Transparency',
      content: 'We make every effort to align with our client\'s business goals. All strategies are custom-built. We believe that trust and transparency are the fundamental keys to developing highly successful long-term partnerships.',
      image: publicAsset('/img/values.png')
    }
  };

  const reasons = [
    {
      num: '01',
      title: 'You Talk, We Listen',
      desc: 'We start by listening and learning your business goals. A beautiful website is useless unless it helps you achieve real results. We collaborate and throw in ideas for continuous improvement.',
      spanClass: 'bento-large'
    },
    {
      num: '02',
      title: 'Out of the Box Thinking',
      desc: 'Our team of designers, developers, and marketers are passion-driven. We brainstorm innovative and creative solutions specific to your business needs.',
      spanClass: 'bento-small'
    },
    {
      num: '03',
      title: 'Decades of Global Experience',
      desc: 'Our competitive advantage is backed by decades of experience working with digital agencies across the US, UK, and Australia. We implement international standards and strategy.',
      spanClass: 'bento-small'
    },
    {
      num: '04',
      title: 'High Standards & Work Ethics',
      desc: 'We focus on quality rather than quantity. You can trust us to work to the highest standards at all times, ensuring transparency, so you don\'t waste your time or budget.',
      spanClass: 'bento-large'
    },
    {
      num: '05',
      title: 'Enhanced Performance',
      desc: 'We optimize every stage of your digital campaign, from customer acquisition to brand retention, connecting powerful ideas with next-gen technologies.',
      spanClass: 'bento-small'
    },
    {
      num: '06',
      title: 'Customized Approach',
      desc: 'We understand that every business is unique. Our workflows and strategies change dynamically to match the specific goals and metrics of your brand.',
      spanClass: 'bento-small'
    }
  ];

  return (
    <section className="section section-bg-alt" id="who">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Who Are We</span>
          <h2 className="heading-md">A Progressive Digital Agency with a Creating Spark</h2>
          <p className="section-description">
            Up Rank Digital is a digital marketing agency with over 10 years of experience managing 100+ national and international clients. Our expert team of web designers and developers work with our digital marketers and software developers to ensure we exceed your expectations at every opportunity.
          </p>
        </div>

        {/* Main Split Info Section */}
        <div className="who-grid scroll-animate delay-100">
          <div className="who-image-box">
            {/* The images are fallback or custom. Let's render a gorgeous visual mockup container in dark mode instead of raw png if files don't exist */}
            <div className="who-mockup-visual tab-fade-in">
              {activeTab === 'vision' && (
                <div className="visual-block-inner vision-visual">
                  <Compass size={64} className="who-center-icon vision-color" />
                  <h4>Pioneering Digital Horizons</h4>
                  <p>Advocating progressive web techniques.</p>
                </div>
              )}
              {activeTab === 'mission' && (
                <div className="visual-block-inner mission-visual">
                  <Target size={64} className="who-center-icon mission-color" />
                  <h4>Value-Driven Delivery</h4>
                  <p>Aligning operations with complete customer satisfaction.</p>
                </div>
              )}
              {activeTab === 'values' && (
                <div className="visual-block-inner values-visual">
                  <Award size={64} className="who-center-icon values-color" />
                  <h4>Trust & Transparency</h4>
                  <p>Long-term success built on open communication.</p>
                </div>
              )}
            </div>

            <div className="who-floating-card glass-card">
              <Sparkles size={20} className="glow-icon" />
              <div>
                <h4>10+ Years Experience</h4>
                <p>Global standards in marketing & development.</p>
              </div>
            </div>
          </div>

          <div className="who-content-box">
            <h3 className="heading-sm">Our Purpose & Values</h3>
            <p className="who-intro-text">
              The digital world gives us the ability to reach into the lives of all your consumers at work, at home or on the move. Wherever they are we can help you reach them.
            </p>

            {/* Tabs Selector */}
            <div className="who-tabs-header">
              {Object.keys(tabs).map((key) => (
                <button
                  key={key}
                  className={`who-tab-btn ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {tabs[key].icon}
                  <span>{tabs[key].label}</span>
                </button>
              ))}
            </div>

            {/* Tab Panel */}
            <div className="who-tab-panel glass-card">
              <h4 className="tab-panel-title">{tabs[activeTab].title}</h4>
              <p className="tab-panel-content">{tabs[activeTab].content}</p>
            </div>
          </div>
        </div>

        {/* Why work with us Bento Grid */}
        <div className="why-us-section">
          <h3 className="heading-sm text-center why-us-title scroll-animate">
            Why Partner with Uprank Digital?
          </h3>
          
          <div className="bento-grid-container scroll-animate delay-100">
            {reasons.map((item, idx) => (
              <div key={idx} className={`bento-card glass-card ${item.spanClass}`}>
                <div className="bento-header">
                  <span className="bento-num">{item.num}</span>
                  <h4 className="why-us-card-title">{item.title}</h4>
                </div>
                <p className="why-us-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .who-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: center;
          margin-bottom: 6rem;
        }

        .who-image-box {
          position: relative;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .who-mockup-visual {
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1.15;
          border-radius: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .visual-block-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          gap: 0.75rem;
        }

        .who-center-icon {
          animation: float-icon 3s infinite alternate ease-in-out;
        }

        .vision-color { color: #f59e0b; filter: drop-shadow(0 0 12px rgba(245,158,11,0.3)); }
        .mission-color { color: #10b981; filter: drop-shadow(0 0 12px rgba(16,185,129,0.3)); }
        .values-color { color: #3b82f6; filter: drop-shadow(0 0 12px rgba(59,130,246,0.3)); }

        .visual-block-inner h4 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .visual-block-inner p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .tab-fade-in {
          animation: tabFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .who-floating-card {
          position: absolute;
          bottom: -20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          max-width: 280px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
        }

        .glow-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(247, 151, 31, 0.6));
          flex-shrink: 0;
        }

        .who-floating-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }

        .who-floating-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .who-content-box {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .who-intro-text {
          color: var(--text-muted);
          font-size: 1.05rem;
        }

        .who-tabs-header {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.35rem;
          border-radius: 50px;
          gap: 0.5rem;
          min-width: 0;
        }

        .who-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 50px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .who-tab-btn:hover {
          color: var(--text-main);
        }

        .who-tab-btn.active {
          background: var(--gradient-accent);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
        }

        .who-tab-panel {
          padding: 2rem;
          border-radius: 16px;
        }

        .tab-panel-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .tab-panel-content {
          color: var(--text-muted);
          font-size: 0.975rem;
          line-height: 1.6;
        }

        /* Bento Grid Why Partner layout */
        .why-us-section {
          margin-top: 5rem;
          position: relative;
          z-index: 10;
        }

        .why-us-title {
          margin-bottom: 3.5rem;
        }

        .bento-grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
        }

        .bento-card {
          padding: 2.25rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.8rem;
          min-height: 220px;
        }

        .bento-card.bento-large {
          grid-column: span 2;
        }

        .bento-card.bento-small {
          grid-column: span 1;
        }

        .bento-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .bento-num {
          font-size: 0.75rem;
          font-weight: 800;
          color: #ffffff;
          background: var(--gradient-accent);
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
        }

        .why-us-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .why-us-card-desc {
          font-size: 0.925rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        @keyframes float-icon {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }

        @media (max-width: 1024px) {
          .bento-grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
          .bento-card.bento-large {
            grid-column: span 2;
          }
          .bento-card.bento-small {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .who-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            margin-bottom: 4rem;
          }
          .who-mockup-visual {
            max-width: 100%;
          }
          .who-floating-card {
            bottom: -15px;
            right: 10px;
          }
          .bento-grid-container {
            grid-template-columns: 1fr;
          }
          .bento-card.bento-large, .bento-card.bento-small {
            grid-column: span 1;
            min-height: auto;
          }
        }

        @media (max-width: 520px) {
          .who-tabs-header {
            border-radius: 14px;
            display: grid;
            grid-template-columns: 1fr;
          }
          .who-tab-btn {
            border-radius: 10px;
            justify-content: flex-start;
            padding: 0.8rem 0.9rem;
          }
          .who-floating-card {
            position: static;
            margin: 1rem auto 0;
            max-width: 100%;
          }
          .visual-block-inner {
            padding: 1.5rem;
          }
          .who-center-icon {
            width: 48px;
            height: 48px;
          }
          .bento-card {
            padding: 1.4rem;
          }
          .bento-header {
            align-items: flex-start;
          }
          .why-us-card-title {
            font-size: 1.08rem;
            line-height: 1.3;
          }
        }
      `}</style>
    </section>
  );
}
