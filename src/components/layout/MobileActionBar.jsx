import React from 'react';
import { MessageCircle, Phone, Sparkles } from 'lucide-react';
import { PHONE_TEL_URL, WHATSAPP_URL } from '@/utils/contactChannels';
import { trackWebsiteEvent } from '@/utils/analytics';
import { requestOpenAssistant } from '@/utils/assistantEvents';
import './MobileActionBar.css';

// Phones only (the CSS hides it above 640px). On a phone the page runs about fifteen
// screens and the form sits near the bottom, so the three ways to reach us stay one tap
// away wherever the visitor is: call and WhatsApp for the ready, the assistant for the
// still-deciding. The assistant's own floating bubble is hidden on phones in favour of
// the "Ask AI" button here, so the two never stack on top of each other.
export default function MobileActionBar() {
  return (
    <nav className="mobile-action-bar" aria-label="Contact Up Rank Digital">
      <a
        href={PHONE_TEL_URL}
        className="mobile-action-btn"
        onClick={() => trackWebsiteEvent('phone_click', { location: 'mobile_bar' })}
      >
        <Phone size={18} aria-hidden="true" />
        <span>Call</span>
      </a>
      <a
        href={WHATSAPP_URL}
        className="mobile-action-btn"
        target="_blank"
        rel="noreferrer noopener"
        onClick={() => trackWebsiteEvent('whatsapp_click', { location: 'mobile_bar' })}
      >
        {/* lucide ships no WhatsApp glyph; the label carries the brand, as elsewhere. */}
        <MessageCircle size={18} aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
      <button
        type="button"
        className="mobile-action-btn"
        onClick={() => requestOpenAssistant('mobile_bar')}
      >
        <Sparkles size={18} aria-hidden="true" />
        <span>Ask AI</span>
      </button>
    </nav>
  );
}
