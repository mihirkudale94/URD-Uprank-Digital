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
          <h2 className="heading-md">A Digital Growth Partner Focused on Measurable Outcomes</h2>
          <p className="section-description">
            Up Rank Digital brings website development, marketing, content, analytics, and software execution together so businesses can improve visibility, lead quality, and digital performance.
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
    </section>
  );
}
