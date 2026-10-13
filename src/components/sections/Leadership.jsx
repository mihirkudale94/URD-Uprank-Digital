import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '@/utils/contactChannels';
import { trackWebsiteEvent } from '@/utils/analytics';
import './Leadership.css';

export default function Leadership() {
  const handleWhatsAppClick = () => {
    trackWebsiteEvent('whatsapp_click', { location: 'connect_card' });
  };

  return (
    <section className="section leadership-section" id="leadership">
      <div className="glow-bg"></div>
      <div className="grid-bg-overlay"></div>

      <div className="container">
        <div className="section-header section-header-left scroll-animate">
          <span className="section-subtitle">Leadership</span>
          <h2 className="heading-md">Meet the Founder</h2>
        </div>

        <div className="leader-profile-grid scroll-animate delay-100">
          <div className="leader-title-wrap">
            <h3 className="leader-name">Sachin Raje</h3>
            <p className="leader-role">Managing Director, URD Solutions</p>
          </div>

          <div className="leader-pitch">
            <h4>Three things we won&rsquo;t do</h4>
            <p>
              We won&rsquo;t promise you a number-one ranking or a guaranteed lead count &mdash; no
              honest agency can. We won&rsquo;t keep your website, ad accounts or analytics in our
              name. And we won&rsquo;t sell you a channel you don&rsquo;t need yet because it rounds
              out a package.
            </p>
            <p>
              What&rsquo;s left is the part we can actually control: strategy, build quality,
              targeting, tracking, and a monthly answer to what changed and what we do next.
            </p>
          </div>

          <div className="leader-connect-card glass-card">
            <h3>Let&rsquo;s Connect</h3>
            <ul className="connect-details-list">
              <li>
                <Phone size={14} className="connect-icon" />
                <span>+91 93711 16165 / +91 73910 96690</span>
              </li>
              <li>
                <Mail size={14} className="connect-icon" />
                <a href="mailto:sachin@uprankdigital.com">sachin@uprankdigital.com</a>
              </li>
              <li>
                <MapPin size={14} className="connect-icon" />
                <span>Pune, Maharashtra, India</span>
              </li>
              <li>
                {/* lucide ships no WhatsApp glyph, so this borrows the chat bubble to stay
                    consistent with the outline icons above it. The label carries the brand. */}
                <MessageCircle size={14} className="connect-icon" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={handleWhatsAppClick}
                >
                  Chat with us on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
