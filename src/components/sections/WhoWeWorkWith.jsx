import React from 'react';
import './WhoWeWorkWith.css';

export default function WhoWeWorkWith() {
  return (
    <section className="section who-section" id="who-we-work-with">
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="who-split">
          <div className="who-header section-header section-header-left scroll-animate">
            <span className="section-subtitle">Who We Work With</span>
            <h2 className="heading-md">
              Every kind of business,<br />
              <span className="gradient-text">at every stage.</span>
            </h2>
          </div>

          <div className="who-body scroll-animate delay-100">
            <p className="who-lead">
              We work with all types of businesses &mdash; new ventures finding their first
              customers and established brands scaling what already works. Food and FMCG,
              manufacturing, healthcare, education, real estate, retail, professional and
              local services.
            </p>

            {/* The point of the section, so it gets the hairline and the heavier type:
                the qualifier is how they want it run, not their industry or size. */}
            <p className="who-point">
              The common thread isn&rsquo;t an industry or a size. It&rsquo;s a business that wants
              the website, the campaigns and the reporting handled by one team instead of chased
              across three.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
