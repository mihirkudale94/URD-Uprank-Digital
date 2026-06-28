import React from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Award, Quote } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';

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

      <style>{`
        .leadership-section {
          background-color: var(--bg-primary);
        }

        .leader-profile-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 4rem;
          align-items: flex-start;
          position: relative;
          z-index: 10;
        }

        .leader-visual-box {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .leader-image-wrapper {
          position: relative;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          aspect-ratio: 0.85;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leader-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 2;
          transition: var(--transition-slow);
        }

        .leader-image-wrapper:hover .leader-img {
          transform: scale(1.03);
        }

        .image-glow-ring {
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--primary), var(--tech-glow));
          opacity: 0.15;
          z-index: 1;
        }

        .leader-experience-tag {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: var(--bg-card);
          border: 1px solid var(--primary);
          padding: 0.8rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          box-shadow: var(--shadow-md);
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .tag-icon {
          color: var(--primary);
        }

        .leader-experience-tag h4 {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
        }

        .leader-experience-tag p {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .leader-connect-card {
          padding: 2rem;
        }

        .leader-connect-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .connect-details-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .connect-details-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .connect-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .connect-details-list a:hover {
          color: var(--primary);
        }

        .leader-info-box {
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
        }

        .leader-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .leader-name {
          font-size: 2.6rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
          letter-spacing: 0;
        }

        .leader-role {
          font-size: 1rem;
          color: var(--text-muted);
          font-weight: 550;
        }

        .leader-pitch {
          border-left: 3px solid var(--primary);
          padding-left: 1.5rem;
        }

        .leader-pitch h4 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .leader-pitch p {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
          font-style: italic;
        }

        .why-work-leader {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .leader-highlight-tag {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          min-width: 0;
        }

        .tag-bullet {
          width: 5px;
          height: 5px;
          background-color: var(--primary);
          border-radius: 50%;
        }

        .leader-expertise-wrap h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .expertise-checkbox-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .expertise-check-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .check-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        .leader-quote-block {
          margin-top: 5rem;
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 10;
        }

        .quote-icon {
          color: var(--primary);
          opacity: 0.15;
        }

        .leader-quote-block p {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
          max-width: 600px;
          line-height: 1.5;
        }

        .leader-quote-block span {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        @media (max-width: 900px) {
          .leader-profile-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .leader-image-wrapper {
            aspect-ratio: 1.1;
          }
        }

        @media (max-width: 600px) {
          .leader-profile-grid {
            gap: 2.25rem;
          }
          .leader-image-wrapper {
            aspect-ratio: 0.95;
          }
          .leader-experience-tag {
            right: 12px;
            bottom: 12px;
            padding: 0.65rem 0.85rem;
          }
          .leader-connect-card {
            padding: 1.4rem;
          }
          .leader-name {
            font-size: 2rem;
          }
          .leader-pitch {
            padding-left: 1rem;
          }
          .leader-pitch h4 {
            font-size: 1.05rem;
          }
          .expertise-checkbox-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .leader-quote-block {
            margin-top: 3rem;
            padding: 1.5rem;
          }
          .leader-quote-block p {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </section>
  );
}
