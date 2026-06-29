import React, { useState } from 'react';
import { ArrowRight, Camera, Code, Smartphone, Tablet, Target, Terminal, Monitor, Megaphone } from 'lucide-react';
import './Services.css';

export default function Services() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [deviceMode, setDeviceMode] = useState('desktop'); // For digital mockup

  const servicesData = [
    {
      title: 'Digital',
      desc: 'We transform your brand into a dynamic digital medium designed to drive conversions, increase traffic, and skyrocket sales.',
      icon: <Code size={24} />,
      bullets: ['Graphic & UI/UX Design', 'Custom Website Development', 'E-commerce Solutions', 'Cross-Platform App Dev']
    },
    {
      title: 'Marketing',
      desc: 'Result-oriented marketing strategies focused on search engine visibility, organic growth, social engagement, and customer acquisition.',
      icon: <Target size={24} />,
      bullets: ['Search Engine Optimization (SEO)', 'Social Media Strategy & Marketing', 'Content Strategy & Marketing', 'Growth Funnels & Analytics']
    },
    {
      title: 'Advertising',
      desc: 'High-performing, ROI-driven paid advertising campaigns targeting right audiences across search engines, social networks, and premium networks.',
      icon: <Megaphone size={24} />,
      bullets: ['Paid Search (Google PPC & SEM)', 'Paid Social (Meta, LinkedIn Ads)', 'Programmatic & PR Distribution', 'ROI Optimization & Ad Management']
    },
    {
      title: 'Content',
      desc: 'Premium content design, storytelling, and professional asset production that sends the right message to your target audience.',
      icon: <Camera size={24} />,
      bullets: ['Copywriting & Storytelling', 'Premium Product Photoshoots', 'High-Impact Video Production', '2D/3D Motion Graphics & Animation']
    },
    {
      title: 'Software',
      desc: 'Custom, scalable, and enterprise-grade software development integrating modern APIs, CMS, LMS, and business systems.',
      icon: <Terminal size={24} />,
      bullets: ['Custom Web Applications (SaaS)', 'Native Android & iOS Apps', 'Headless CMS & LMS Integrations', 'API & Business System Integrations']
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
      case 2: // Advertising
        return (
          <div className="mockup-frame advertising-mock">
            <div className="ad-preview-header">
              <Megaphone size={14} />
              <span>Ad Campaign Preview</span>
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
                <h4 className="ad-title">URD - #1 Digital Growth & Marketing Agency</h4>
                <p className="ad-description">We help brands scale with result-oriented PPC ads, SEO strategies, and custom software. Get a free proposal today!</p>
                <div className="ad-sitelinks">
                  <span>Contact Us</span>
                  <span>Our Services</span>
                </div>
              </div>
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
    </section>
  );
}
