import React from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Award, Quote } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';
import './Leadership.css';

export default function Leadership() {
  const expertise = [
    'Website Development',
    'Digital Performance Marketing',
    'AI Powered Marketing Solutions',
    'Search & Paid Media Strategy',
    'Conversion Optimization',
    'Analytics & Growth Strategy',
    'Content Design & Management',
    'Social Media Strategy',
    'Campaign Planning & Execution'
  ];

  const highlights = [
    { title: 'Result-Driven Strategies' },
    { title: 'Data-Backed Decisions' },
    { title: 'Transparent Communication' },
    { title: 'Measurable Results' }
  ];

  return (
    <section className="section leadership-section" id="leadership">
      <div className="glow-bg"></div>
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Leadership Spotlight</span>
          <h2 className="heading-md">Meet Our Managing Director</h2>
          <p className="section-description">
            Driving digital transformation and leading URD with a commitment to measurable performance.
          </p>
        </div>

        <div className="leader-profile-grid scroll-animate delay-100">
          {/* Left Column: Portrait & Connect Card */}
          <div className="leader-visual-box">
            <div className="leader-image-wrapper">
              <img 
                src={publicAsset('/img/sachin-raje.jpg')} 
                alt="Sachin Raje - Managing Director" 
                className="leader-img"
                width="400"
                height="470"
                loading="lazy"
                onError={(e) => {
                  e.target.src = publicAsset('/img/Boy.png'); // Fallback to legacy avatar if file not yet uploaded
                }}
              />
              <div className="leader-experience-tag">
                <Award size={20} className="tag-icon" />
                <div>
                  <h4>10+ Years</h4>
                  <p>Of Driving Growth</p>
                </div>
              </div>
              <div className="image-glow-ring"></div>
            </div>

            {/* Let's Connect Mini Card */}
            <div className="leader-connect-card glass-card">
              <h3>Let's Connect</h3>
              <ul className="connect-details-list">
                <li>
                  <Phone size={14} className="connect-icon" />
                  <span>+91 93711 16165</span>
                </li>
                <li>
                  <Mail size={14} className="connect-icon" />
                  <a href="mailto:sachin@uprankdigital.com">sachin@uprankdigital.com</a>
                </li>
                <li>
                  <MapPin size={14} className="connect-icon" />
                  <span>Pune, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Bio, Expertise & Focus */}
          <div className="leader-info-box">
            <div className="leader-title-wrap">
              <span className="leader-badge">
                Digital Growth Partner
              </span>
              <h3 className="leader-name">Sachin Raje</h3>
              <p className="leader-role">Managing Director, URD Solutions</p>
            </div>

            <div className="leader-pitch">
              <h4>Website development and digital performance marketing using AI</h4>
              <p>
                "I help sports clubs, brands, and businesses grow their digital presence with AI-supported planning, data-driven marketing, engaging content, conversion optimization, and practical strategies that deliver real results."
              </p>
            </div>

            {/* Core Pillars */}
            <div className="why-work-leader">
              {highlights.map((h, i) => (
                <div key={i} className="leader-highlight-tag">
                  <span className="tag-bullet"></span>
                  <span>{h.title}</span>
                </div>
              ))}
            </div>

            {/* Expertise Checklist */}
            <div className="leader-expertise-wrap">
              <h3>Area of Expertise</h3>
              <div className="expertise-checkbox-grid">
                {expertise.map((item, index) => (
                  <div key={index} className="expertise-check-item">
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quote Block */}
        <div className="leader-quote-block glass-card scroll-animate">
          <Quote className="quote-icon" size={32} />
          <p>Creating impact online. Winning results together.</p>
          <span className="quote-author">URD - The Upward Move</span>
        </div>
      </div>
    </section>
  );
}
