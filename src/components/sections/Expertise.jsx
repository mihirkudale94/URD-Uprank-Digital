import React from 'react';
import {
  Code2,
  TrendingUp,
  Cpu,
  MousePointerClick,
  BarChart3,
  PenLine,
  Share2,
  Target
} from 'lucide-react';
import { EXPERTISE } from '@/data/siteContent';
import './Expertise.css';

// Icons are presentation, so they stay here; the titles and copy come from siteContent.js.
const expertiseIcons = {
  'website-development': <Code2 size={18} />,
  'performance-marketing': <TrendingUp size={18} />,
  'ai-marketing': <Cpu size={18} />,
  'conversion-optimization': <MousePointerClick size={18} />,
  analytics: <BarChart3 size={18} />,
  content: <PenLine size={18} />,
  'social-media': <Share2 size={18} />,
  campaigns: <Target size={18} />
};

export default function Expertise() {
  return (
    <section className="section expertise-section" id="expertise">
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="expertise-lead section-header section-header-left scroll-animate">
          <span className="section-subtitle">Our Capabilities</span>
          <h2 className="heading-md">
            Eight capabilities.<br />
            <span className="gradient-text">One accountable team.</span>
          </h2>
          <p className="section-description">
            These are the skills behind every service line. You don&rsquo;t hire them separately
            or coordinate between them: they work as one team toward one goal, more enquiries
            from the money you already spend.
          </p>
        </div>

        <div className="expertise-matrix scroll-animate delay-100">
          {EXPERTISE.map((item, index) => (
            <div key={item.id} className="expertise-tile">
              <span className="expertise-tile-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="expertise-tile-icon">{expertiseIcons[item.id]}</span>
              <h3 className="expertise-tile-title">{item.title}</h3>
              <p className="expertise-tile-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
