import React, { useState } from 'react';
import { ArrowRight, Camera, Code, Smartphone, Tablet, Monitor, Megaphone, TrendingUp, Cpu, PenLine } from 'lucide-react';
import './Services.css';

export default function Services() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [deviceMode, setDeviceMode] = useState('desktop'); // For digital mockup

  const servicesData = [
    {
      title: 'Website Development',
      desc: 'Your website is your highest-leverage sales asset. We architect custom, performance-engineered web solutions built for Core Web Vitals excellence, search dominance, and frictionless conversion — not just aesthetics.',
      icon: <Code size={24} />,
      bullets: ['Custom Web Apps & SaaS Platforms', 'E-Commerce & Headless Shopify Architecture', 'Conversion-Optimised Landing Pages', 'UI/UX Systems Built for Revenue']
    },
    {
      title: 'Digital Marketing',
      desc: 'Visibility without intent is noise. We deploy data-led organic growth systems — technical SEO, content architecture, and local authority strategies — engineered to place your brand where buyers are already searching.',
      icon: <Megaphone size={24} />,
      bullets: ['Technical SEO & Core Web Vitals Audits', 'Intent-Mapped Content & Keyword Strategy', 'Google Business & Map Pack Dominance', 'Social Organic Growth & Community Strategy']
    },
    {
      title: 'Performance Marketing',
      desc: 'Every rupee of ad spend is accountable. We build full-funnel, attribution-backed paid acquisition systems across Google and Meta — engineered to compress CAC, maximise ROAS, and scale what is already working.',
      icon: <TrendingUp size={24} />,
      bullets: ['Google Search, Display & Shopping Ads', 'Meta & LinkedIn Performance Campaigns', 'Landing Page CRO & A/B Testing', 'Multi-Touch Attribution & Budget Optimisation']
    },
    {
      title: 'AI Powered Solutions',
      desc: 'AI is no longer optional — it is competitive infrastructure. We deploy custom LLM-powered agents, intelligent lead qualifiers, and workflow automation that operate 24/7, reduce overheads, and accelerate your revenue pipeline.',
      icon: <Cpu size={24} />,
      bullets: ['LLM-Powered Lead Qualification Agents', 'Conversational AI & Voice Automation', 'CRM Integration & Workflow Orchestration', 'AI Retargeting & Personalisation Engines']
    },
    {
      title: 'Content Design & Management',
      desc: 'Content is the compounding asset most brands undervalue. We create high-impact visual identities, direct-response copy, and social media systems that build category authority and convert attention into measurable pipeline.',
      icon: <PenLine size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />,
      bullets: ['Direct-Response Brand Copywriting', 'Product Photography & Video Production', 'Social Media Feed Management & Reels', 'Visual Identity & Brand Design Systems']
    }
  ];

  // Helper to render interactive mockup based on active tab
  const renderInteractiveMockup = () => {
    switch(activeCategory) {
      case 0: // Website Development
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
                  <h4 className="mock-web-title">Custom Web Dev</h4>
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
      case 1: // Digital Marketing
        return (
          <div className="mockup-frame marketing-mock">
            <div className="marketing-dashboard-header">
              <span>Organic Traffic Dashboard</span>
              <span className="live-pill">LIVE</span>
            </div>
            <div className="marketing-chart-wrapper">
              <div className="stat-row">
                <div className="mini-stat">
                  <span className="stat-lbl">SEO Impressions</span>
                  <span className="stat-val">840.2K</span>
                </div>
                <div className="mini-stat">
                  <span className="stat-lbl">Organic Traffic</span>
                  <span className="stat-val text-green">+18.4%</span>
                </div>
              </div>
              <div className="bar-chart-container">
                <div className="chart-bar bar-1"><span className="tooltip">Jun: 140k</span></div>
                <div className="chart-bar bar-2"><span className="tooltip">Jul: 320k</span></div>
                <div className="chart-bar bar-3"><span className="tooltip">Aug: 590k</span></div>
                <div className="chart-bar bar-4"><span className="tooltip">Sept: 840k</span></div>
              </div>
            </div>
            <div className="channel-breakdown">
              <span>Google SEO: <strong>+34% Growth</strong></span>
              <span>Social Referrals: <strong>+12% Growth</strong></span>
            </div>
          </div>
        );
      case 2: // Performance Marketing
        return (
          <div className="mockup-frame advertising-mock">
            <div className="ad-preview-header">
              <Megaphone size={14} />
              <span>Paid Campaign Preview</span>
              <span className="ad-status-pill">Active</span>
            </div>
            <div className="ad-google-search">
              <div className="google-header">
                <span className="google-logo">Google</span>
                <div className="google-search-input">uprank digital agency</div>
              </div>
              <div className="google-ad-result">
                <span className="ad-label">Sponsored</span>
                <span className="ad-url">https://www.uprankdigital.com</span>
                <h4 className="ad-title">URD - #1 Performance Marketing Agency</h4>
                <p className="ad-description">Scale your business with high-ROI Google Ads, Meta Campaigns, and Conversion Rate Optimization. Get a free audit today!</p>
                <div className="ad-sitelinks">
                  <span>Google Ads ROI: 4.8x</span>
                  <span>Meta Ads ROI: 3.6x</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 3: // AI Powered Solutions
        return (
          <div className="mockup-frame software-mock" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="terminal-header">
              <div className="terminal-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
              <span>AI Lead Qualifier Bot - Live Chat</span>
            </div>
            <div className="mock-chat-body" style={{ padding: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)', flexGrow: '1' }}>
              <div className="chat-msg bot" style={{ display: 'flex', gap: '8px' }}>
                <div style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>AI</div>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 10px', borderRadius: '0 10px 10px 10px', maxWidth: '80%' }}>
                  Hi there! Ready to scale? Tell me about your main business goal.
                </div>
              </div>
              <div className="chat-msg user" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <div style={{ background: '#10b981', color: '#fff', padding: '8px 10px', borderRadius: '10px 0 10px 10px', maxWidth: '80%' }}>
                  Need to generate more qualified leads through advertising.
                </div>
              </div>
              <div className="chat-msg bot" style={{ display: 'flex', gap: '8px' }}>
                <div style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>AI</div>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 10px', borderRadius: '0 10px 10px 10px', maxWidth: '80%' }}>
                  Got it! I can book a strategy session with Sachin Raje. What is your WhatsApp number?
                </div>
              </div>
            </div>
          </div>
        );
      case 4: // Content Design & Management
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
                <span className="img-badge">Creative Brand Shoot</span>
              </div>
            </div>
            <div className="instagram-footer">
              <div className="insta-actions"><span>2,482 likes</span></div>
              <p className="insta-caption"><strong>uprankdigital</strong> Premium storytelling, copywriting, and visual assets designed to capture customer attention. #Branding</p>
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
          <span className="section-subtitle">What We Do</span>
          <h2 className="heading-md">Website Development &amp; Digital Performance Marketing Using AI</h2>
          <p className="section-description">
            Five connected service lines — websites, search, ads, AI, and content — that grow your digital presence and deliver real, measurable results.
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
    </section>
  );
}
