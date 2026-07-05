import React from 'react';
import { Mail, Phone, MapPin, Award } from 'lucide-react';
import { publicAsset } from '@/utils/publicAsset';
import './Leadership.css';

export default function Leadership() {

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
              <h4>Website development and Digital performance marketing using AI</h4>
              <p>
                "We help sports clubs, brands, and businesses grow their digital presence with data-driven marketing, engaging content, and AI-powered strategies that deliver real results."
              </p>
            </div>

            {/* Let's Connect — moved to right column */}
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
        </div>
      </div>
    </section>
  );
}
