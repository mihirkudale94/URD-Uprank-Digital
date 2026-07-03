import React, { useState } from 'react';
import { Eye, Target, Heart, Sparkles, Compass, Award } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';
import './WhoWeAre.css';

export default function WhoWeAre() {
  const [activeTab, setActiveTab] = useState('vision');

  const tabs = {
    vision: {
      label: 'Vision',
      icon: <Eye size={18} />,
      title: 'Practical Digital Growth',
      content: 'To help businesses use websites, marketing, content, analytics, and automation in a practical way that creates measurable growth, not digital noise.',
      image: publicAsset('/img/vision.png')
    },
    mission: {
      label: 'Mission',
      icon: <Target size={18} />,
      title: 'Value-Driven Execution',
      content: 'To understand the business goal first, recommend the right scope, and deliver work that improves visibility, enquiries, conversion, and long-term digital performance.',
      image: publicAsset('/img/mission.png')
    },
    values: {
      label: 'Values',
      icon: <Heart size={18} />,
      title: 'The Two T\'s: Trust & Transparency',
      content: 'We align strategy with the client\'s business goals, keep ownership clear, communicate openly, and avoid selling work that does not support the next growth step.',
      image: publicAsset('/img/values.png')
    }
  };


  return (
    <section className="section section-bg-alt" id="about">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Who Are We</span>
          <h2 className="heading-md">A Digital Growth Partner Focused on Measurable Outcomes</h2>
          <p className="section-description">
            Up Rank Digital brings website development, digital marketing, performance marketing, AI powered solutions, and content design together so businesses can improve visibility, lead quality, and digital performance.
          </p>
        </div>

        {/* Main Split Info Section */}
        <div className="who-grid scroll-animate delay-100">
          <div className="who-image-box">
            <div className="who-image-wrapper">
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
          </div>

          <div className="who-content-box">
            <h3 className="heading-sm">Our Purpose & Values</h3>
            <p className="who-intro-text">
              We focus on the work that moves a business forward: clearer positioning, better digital experiences, stronger campaigns, cleaner tracking, and practical next steps.
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

      </div>
    </section>
  );
}
