import React, { useState } from 'react';
import { ArrowRight, Bot, Camera, Code, LineChart, Smartphone, Tablet, Target, Terminal, Monitor } from 'lucide-react';

export default function Services() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [deviceMode, setDeviceMode] = useState('desktop'); // For digital mockup

  const servicesData = [
    {
      title: 'Digital',
      desc: 'We transform your brand into a dynamic digital medium designed to drive conversions, increase traffic, and skyrocket sales.',
      icon: <Code size={24} />,
      bullets: ['Website Development', 'Graphic & UI/UX Design', 'E-commerce Solutions', 'Cross-Platform App Dev']
    },
    {
      title: 'Marketing',
      desc: 'Digital performance marketing strategies focused on paid media, organic growth, search engines, and strategic audience connection.',
      icon: <Target size={24} />,
      bullets: ['Digital Performance Marketing', 'Search Engine Optimization (SEO)', 'Social Media Strategy', 'Campaign Planning & Execution']
    },
    {
      title: 'AI Growth',
      desc: 'AI-powered marketing solutions that improve campaign planning, audience insights, content workflows, and growth decisions.',
      icon: <Bot size={24} />,
      bullets: ['AI Powered Marketing Solutions', 'Analytics & Growth Strategy', 'Conversion Optimization', 'Performance Reporting']
    },
    {
      title: 'Content',
      desc: 'Content design and management that tells your story via copywriting, product shoots, and rich video production.',
      icon: <Camera size={24} />,
      bullets: ['Content Design & Management', 'Copywriting & Storytelling', 'Product Photoshoots', 'Video & Animations']
    },
    {
      title: 'Software',
      desc: 'Custom, scalable, and enterprise-grade software development integrating modern APIs, CMS, LMS, and business systems.',
      icon: <Terminal size={24} />,
      bullets: ['Custom Web Applications', 'Enterprise Android & iOS Apps', 'CMS & LMS Integrations', 'Business System Integration']
    }
  ];

  // Helper to render interactive mockup based on active tab
  const renderInteractiveMockup = () => {
    switch(activeCategory) {
      case 0: // Digital
        return (
          <div className="mockup-frame digital-mock">
            <div className="mockup-controls">
              <button
                className={`control-tab-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setDeviceMode('desktop')}
                aria-label="Preview desktop layout"
                title="Desktop"
              >
                <Monitor size={12} />
              </button>
              <button
                className={`control-tab-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
                onClick={() => setDeviceMode('tablet')}
                aria-label="Preview tablet layout"
                title="Tablet"
              >
                <Tablet size={12} />
              </button>
              <button
                className={`control-tab-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setDeviceMode('mobile')}
                aria-label="Preview mobile layout"
                title="Mobile"
              >
                <Smartphone size={12} />
              </button>
            </div>
            <div className={`responsive-viewport ${deviceMode}`}>
              <div className="mock-browser-bar">
                <div className="browser-dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
                <div className="browser-url">uprankdigital.com</div>
              </div>
              <div className="mock-website-body">
                <div className="mock-web-nav">
                  <div className="mock-logo">URD</div>
                  <div className="mock-nav-dots"><span className="nav-dot"></span><span className="nav-dot"></span></div>
                </div>
                <div className="mock-hero-section">
                  <h4 className="mock-web-title">Premium Web Design</h4>
                  <p className="mock-web-para">Optimized for search indexing and user conversion.</p>
                  <div className="mock-web-btn">Start Project</div>
                </div>
                <div className="mock-grid-features">
                  <span className="feat-block"></span>
                  <span className="feat-block"></span>
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // Marketing
        return (
          <div className="mockup-frame marketing-mock">
            <div className="marketing-dashboard-header">
              <span>Performance Analytics</span>
              <span className="live-pill">LIVE</span>
            </div>
            <div className="marketing-chart-wrapper">
              <div className="stat-row">
                <div className="mini-stat">
                  <span className="stat-lbl">Impressions</span>
                  <span className="stat-val">682.4K</span>
                </div>
                <div className="mini-stat">
                  <span className="stat-lbl">Conversion Rate</span>
                  <span className="stat-val text-green">+4.2%</span>
                </div>
              </div>
              <div className="bar-chart-container">
                <div className="chart-bar bar-1"><span className="tooltip">Jun: 140k</span></div>
                <div className="chart-bar bar-2"><span className="tooltip">Jul: 220k</span></div>
                <div className="chart-bar bar-3"><span className="tooltip">Aug: 390k</span></div>
                <div className="chart-bar bar-4"><span className="tooltip">Sept: 682k</span></div>
              </div>
            </div>
            <div className="channel-breakdown">
              <span>Google PPC: <strong>4.8x ROI</strong></span>
              <span>Meta Ads: <strong>3.6x ROI</strong></span>
            </div>
          </div>
        );
      case 2: // AI Growth
        return (
          <div className="mockup-frame ai-growth-mock">
            <div className="ai-panel-header">
              <Bot size={16} />
              <span>AI Growth Engine</span>
              <span className="ai-status-pill">Optimizing</span>
            </div>
            <div className="ai-score-card">
              <LineChart size={28} />
              <div>
                <span className="ai-score-label">Growth Opportunity Score</span>
                <strong>91%</strong>
              </div>
            </div>
            <div className="ai-insight-list">
              <span>Audience segments prioritized</span>
              <span>Landing page friction flagged</span>
              <span>Campaign budget reallocation suggested</span>
            </div>
          </div>
        );
      case 3: // Content
        return (
          <div className="mockup-frame content-mock">
            <div className="instagram-preview-header">
              <div className="insta-avatar"></div>
              <div>
                <span className="insta-name">uprankdigital</span>
                <span className="insta-location">Pune, India</span>
              </div>
            </div>
            <div className="instagram-image-box">
              <div className="insta-image-gradient">
                <Camera size={32} className="content-camera-icon" />
                <span className="img-badge">Interactive Product Shoot</span>
              </div>
            </div>
            <div className="instagram-footer">
              <div className="insta-actions"><span>1,284 likes</span></div>
              <p className="insta-caption"><strong>uprankdigital</strong> Telling authentic brand stories that resonate globally. Creative shoots done right.</p>
            </div>
          </div>
        );
      case 4: // Software
        return (
          <div className="mockup-frame software-mock">
            <div className="terminal-header">
              <div className="terminal-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
              <span>bash - active_endpoints.js</span>
            </div>
            <div className="terminal-body">
              <p className="term-line"><span className="green-txt">client-apps@urd-sys:~$</span> npm run build</p>
              <p className="term-line-dim">vite v8.1.0 building for production...</p>
              <p className="term-line-dim">42 modules transformed.</p>
              <p className="term-line"><span className="cyan-txt">info</span> deployment pipeline synced successfully.</p>
              <p className="term-line"><span className="green-txt">client-apps@urd-sys:~$</span> <span className="cursor-blink">|</span></p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="section" id="services">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">What We Offer</span>
          <h2 className="heading-md">Result-Oriented Digital Services</h2>
          <p className="section-description">
            We provide a comprehensive range of creative, technical, and analytical services to grow your brand in this digitalized world.
          </p>
        </div>

        {/* Desktop Interactive Layout */}
        <div className="services-showcase scroll-animate delay-100">
          {/* Left Category Selector */}
          <div className="services-menu">
            {servicesData.map((service, index) => (
              <button
                key={service.title}
                className={`services-menu-btn ${activeCategory === index ? 'active' : ''}`}
                onClick={() => setActiveCategory(index)}
              >
                <span className="service-menu-icon">{service.icon}</span>
                <div className="service-menu-text">
                  <h3>{service.title}</h3>
                  <p>{service.bullets[0]} & More</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Detailed Showcase Panel */}
          <div className="services-details glass-card">
            <div className="services-details-content">
              <div className="services-details-text animate-fade-in-up">
                <span className="service-badge">Service Overview</span>
                <h3 className="heading-sm">{servicesData[activeCategory].title} Solutions</h3>
                <p className="service-desc-text">{servicesData[activeCategory].desc}</p>
                
                <h4 className="service-list-title">Core Competencies:</h4>
                <div className="service-bullets-grid">
                  {servicesData[activeCategory].bullets.map((bullet, idx) => (
                    <div key={idx} className="service-bullet-chip">
                      <span className="bullet-indicator"></span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <a href="#contact" className="btn btn-primary service-cta-btn">
                  Enquire About {servicesData[activeCategory].title} <ArrowRight size={16} />
                </a>
              </div>

              {/* Right panel side mockup container */}
              <div className="services-details-image-box">
                <div className="services-image-frame-container">
                  {renderInteractiveMockup()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Render as Cards */}
        <div className="services-mobile-cards">
          {servicesData.map((service) => (
            <div key={service.title} className="service-mobile-card glass-card">
              <div className="mobile-card-header">
                <span className="mobile-card-icon">{service.icon}</span>
                <h3>{service.title}</h3>
              </div>
              <p className="mobile-card-desc">{service.desc}</p>
              <div className="mobile-bullets">
                {service.bullets.map((bullet, idx) => (
                  <span key={idx} className="mobile-bullet-badge">{bullet}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .services-showcase {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 3rem;
          min-height: 520px;
        }

        .services-menu {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .services-menu-btn {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          text-align: left;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition-normal);
        }

        .services-menu-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(5px);
        }

        .services-menu-btn.active {
          background: rgba(247, 151, 31, 0.08);
          border-color: var(--primary);
          color: var(--text-main);
          box-shadow: inset 0 0 12px rgba(247, 151, 31, 0.1);
        }

        .service-menu-icon {
          color: var(--text-dim);
          transition: var(--transition-fast);
        }

        .services-menu-btn.active .service-menu-icon {
          color: var(--primary);
        }

        .service-menu-text h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .service-menu-text p {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .services-details {
          padding: 3rem;
          min-height: 100%;
          display: flex;
        }

        .services-details-content {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3rem;
          width: 100%;
          align-items: center;
        }

        .services-details-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .service-badge {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary);
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .service-desc-text {
          color: var(--text-muted);
          margin-top: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.975rem;
          line-height: 1.6;
        }

        .service-list-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .service-bullets-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          margin-bottom: 2rem;
          width: 100%;
        }

        .service-bullet-chip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .bullet-indicator {
          width: 6px;
          height: 6px;
          background: var(--gradient-accent);
          border-radius: 50%;
        }

        .service-cta-btn {
          margin-top: auto;
          border-radius: 8px;
        }

        .services-details-image-box {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .services-image-frame-container {
          position: relative;
          width: 100%;
          min-height: 320px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-color);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mockup Styles */
        .mockup-frame {
          width: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
        }

        /* Digital mockup (device viewports) */
        .digital-mock {
          background: transparent;
          border: none;
          box-shadow: none;
        }
        .mockup-controls {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .control-tab-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .control-tab-btn.active {
          background: var(--gradient-accent);
          color: #ffffff;
          border-color: var(--primary);
        }
        .responsive-viewport {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          transition: all 0.4s ease-in-out;
          background: #030712;
          color: #fff;
        }
        .responsive-viewport.tablet {
          width: 75%;
        }
        .responsive-viewport.mobile {
          width: 55%;
        }
        .mock-browser-bar {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .browser-dots {
          display: flex;
          gap: 0.25rem;
        }
        .browser-dots .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
        }
        .browser-url {
          background: rgba(255,255,255,0.04);
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.6);
          border-radius: 3px;
          padding: 0.1rem 0.75rem;
          text-align: center;
          flex-grow: 1;
        }
        .mock-website-body {
          padding: 0.75rem;
        }
        .mock-web-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .mock-logo {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--primary);
        }
        .mock-nav-dots {
          display: flex;
          gap: 0.3rem;
        }
        .nav-dot {
          width: 8px;
          height: 3px;
          background: rgba(255,255,255,0.15);
          border-radius: 20px;
        }
        .mock-hero-section {
          text-align: center;
          padding: 1rem 0.25rem;
          background: rgba(255,255,255,0.02);
          border-radius: 6px;
        }
        .mock-web-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.25rem;
        }
        .mock-web-para {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.75rem;
        }
        .mock-web-btn {
          font-size: 0.6rem;
          font-weight: 700;
          background: var(--gradient-accent);
          color: #fff;
          border-radius: 4px;
          padding: 0.25rem 0.6rem;
          display: inline-block;
        }
        .mock-grid-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .feat-block {
          height: 24px;
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.03);
        }

        /* Marketing mockup styling */
        .marketing-mock {
          padding: 1rem;
          background: rgba(9, 13, 22, 0.95);
          color: #fff;
        }
        .marketing-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .live-pill {
          background: #ef4444;
          color: #fff;
          font-size: 0.55rem;
          font-weight: 800;
          padding: 0.05rem 0.35rem;
          border-radius: 30px;
        }
        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .mini-stat {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          padding: 0.5rem;
          border-radius: 6px;
        }
        .stat-lbl {
          font-size: 0.6rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }
        .stat-val {
          display: block;
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
        }
        .text-green { color: #10b981; }
        .bar-chart-container {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 0.25rem;
        }
        .chart-bar {
          flex: 1;
          background: rgba(247,151,31,0.25);
          border: 1px solid var(--primary);
          border-bottom: none;
          border-radius: 3px 3px 0 0;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .chart-bar:hover {
          background: var(--gradient-accent);
          filter: drop-shadow(0 0 4px var(--primary));
        }
        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translate(-50%, 4px);
          background: #090d16;
          color: #fff;
          font-size: 0.55rem;
          font-weight: 700;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          z-index: 20;
        }
        .chart-bar:hover .tooltip {
          opacity: 1;
          transform: translate(-50%, -6px);
        }
        .bar-1 { height: 35%; }
        .bar-2 { height: 50%; }
        .bar-3 { height: 75%; }
        .bar-4 { height: 100%; }
        .channel-breakdown {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          margin-top: 0.75rem;
          color: var(--text-muted);
        }

        /* AI growth mockup styling */
        .ai-growth-mock {
          padding: 1rem;
          background:
            radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.18), transparent 34%),
            radial-gradient(circle at 86% 8%, rgba(59, 130, 246, 0.16), transparent 30%),
            #07111f;
          color: #fff;
          gap: 0.85rem;
        }
        .ai-panel-header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding-bottom: 0.6rem;
        }
        .ai-status-pill {
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 999px;
          padding: 0.12rem 0.45rem;
          font-size: 0.58rem;
          text-transform: uppercase;
        }
        .ai-score-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.85rem;
        }
        .ai-score-card svg {
          color: #10b981;
        }
        .ai-score-label {
          display: block;
          color: var(--text-dim);
          font-size: 0.62rem;
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }
        .ai-score-card strong {
          font-size: 1.55rem;
          line-height: 1;
        }
        .ai-insight-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .ai-insight-list span {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: var(--text-muted);
          font-size: 0.7rem;
          padding: 0.55rem 0.65rem;
        }

        /* Content mockup styling */
        .content-mock {
          background: #000;
        }
        .instagram-preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
        }
        .insta-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gradient-accent);
        }
        .insta-name {
          font-size: 0.7rem;
          font-weight: 700;
          display: block;
          color: #fff;
          line-height: 1.1;
        }
        .insta-location {
          font-size: 0.55rem;
          color: var(--text-dim);
          display: block;
        }
        .instagram-image-box {
          aspect-ratio: 1.5;
          width: 100%;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .insta-image-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #ff8a00, #e52e71);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #fff;
        }
        .content-camera-icon {
          animation: bounce 2s infinite;
        }
        .img-badge {
          font-size: 0.65rem;
          font-weight: 800;
          background: rgba(0,0,0,0.4);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }
        .instagram-footer {
          padding: 0.5rem;
        }
        .insta-actions {
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.25rem;
        }
        .insta-caption {
          font-size: 0.65rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Software mockup styling */
        .software-mock {
          font-family: monospace;
          background: #030712;
          color: #fff;
        }
        .terminal-header {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        .terminal-dots {
          display: flex;
          gap: 0.25rem;
        }
        .terminal-dots .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .terminal-dots .red { background: #ef4444; }
        .terminal-dots .yellow { background: #f59e0b; }
        .terminal-dots .green { background: #10b981; }
        
        .terminal-body {
          padding: 0.75rem;
          min-height: 140px;
          font-size: 0.7rem;
        }
        .term-line {
          color: #fff;
          margin-bottom: 0.35rem;
        }
        .term-line-dim {
          color: var(--text-dim);
          margin-bottom: 0.35rem;
        }
        .green-txt { color: #10b981; }
        .cyan-txt { color: #06b6d4; }
        
        .services-mobile-cards {
          display: none;
          flex-direction: column;
          gap: 1.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .services-showcase {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .services-menu {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
          .services-menu-btn {
            flex-shrink: 0;
            padding: 1rem 1.25rem;
          }
          .service-menu-text p {
            display: none;
          }
          .services-details-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .services-image-frame-container {
            min-height: auto;
            max-width: 440px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .services-showcase {
            display: none;
          }
          .services-mobile-cards {
            display: flex;
          }
          .service-mobile-card {
            padding: 2rem;
          }
          .mobile-card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          .mobile-card-icon {
            color: var(--primary);
          }
          .mobile-card-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
          }
          .mobile-bullets {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .mobile-bullet-badge {
            font-size: 0.75rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-color);
            padding: 0.4rem 0.8rem;
            border-radius: 50px;
            color: var(--text-muted);
          }
        }
      `}</style>
    </section>
  );
}
