import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import {
  CONTACT_EMAIL,
  EMAIL_URL,
  PHONE_TEL_URL,
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_URL
} from '@/utils/contactChannels';
import { trackWebsiteEvent } from '@/utils/analytics';
import { BUSINESS, FOUNDER, FULL_ADDRESS } from '@/data/siteContent';
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
            <h3 className="leader-name">{FOUNDER.name}</h3>
            <p className="leader-role">{FOUNDER.jobTitle}, {BUSINESS.shortName}</p>
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
                <a href={PHONE_TEL_URL} onClick={() => trackWebsiteEvent('phone_click', { location: 'connect_card' })}>
                  {WHATSAPP_NUMBER_DISPLAY}
                </a>
              </li>
              <li>
                <Mail size={14} className="connect-icon" />
                <a href={EMAIL_URL} onClick={() => trackWebsiteEvent('email_click', { location: 'connect_card' })}>
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <MapPin size={14} className="connect-icon" />
                <span>{FULL_ADDRESS}</span>
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
