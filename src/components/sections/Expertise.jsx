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
import './Expertise.css';

const expertise = [
  { title: 'Website Development', icon: <Code2 size={18} /> },
  { title: 'Digital Performance Marketing', icon: <TrendingUp size={18} /> },
  { title: 'AI Powered Marketing Solutions', icon: <Cpu size={18} /> },
  { title: 'Conversion Optimization', icon: <MousePointerClick size={18} /> },
  { title: 'Analytics & Growth Strategy', icon: <BarChart3 size={18} /> },
  { title: 'Content Design & Management', icon: <PenLine size={18} /> },
  { title: 'Social Media Strategy', icon: <Share2 size={18} /> },
  { title: 'Campaign Planning & Execution', icon: <Target size={18} /> }
];

export default function Expertise() {
  return (
    <section className="section expertise-section" id="expertise">
      <div className="grid-bg-overlay"></div>

      <div className="container expertise-split">
        <div className="expertise-lead section-header section-header-left scroll-animate">
          <span className="section-subtitle">Expertise</span>
          <h2 className="heading-md">
            Eight capabilities.<br />
            <span className="gradient-text">One accountable team.</span>
          </h2>
          <p className="section-description">
            Everything needed to grow a digital presence, held by one partner instead of split
            across five vendors.
          </p>
        </div>

        <div className="expertise-matrix scroll-animate delay-100">
          {expertise.map((item, index) => (
            <div key={item.title} className="expertise-tile">
              <span className="expertise-tile-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="expertise-tile-icon">{item.icon}</span>
              <h3 className="expertise-tile-title">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
