import React from 'react';
import { ArrowRight } from 'lucide-react';
import { handleAnchorClick } from '@/utils/scrollToSection';
import './BrandStatement.css';

// Sits directly above the enquiry form, so its one job is to ask for the enquiry.
export default function BrandStatement() {
  return (
    <div className="brand-statement-strip">
      <div className="brand-statement-inner">
        <span className="brand-statement-line"></span>
        <div className="brand-statement-content">
          <p className="brand-statement-tagline">
            Ready for more enquiries?
          </p>
          <a
            href="#contact"
            className="btn btn-primary brand-statement-cta"
            onClick={(event) => handleAnchorClick(event, '#contact')}
          >
            Book a Free Discovery Call <ArrowRight size={18} />
          </a>
        </div>
        <span className="brand-statement-line"></span>
      </div>
    </div>
  );
}
