import React, { useState } from 'react';
import { Briefcase, Loader2, X } from 'lucide-react';
import { buildLeadPayload, submitLead } from '@/utils/leadSubmission';
import { buildEnquiryPrefill } from '@/utils/enquiryPrefill';
import { trackWebsiteEvent } from '@/utils/analytics';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = { name: '', email: '', company: '', jobTitle: '', phone: '' };

// The consultation request, inside the chat panel. A corporate visitor who has just
// described their objective is at the moment of highest intent, and sending them off to a
// form further down the page loses a share of them on the way. The lead goes to the same
// endpoint as the page's enquiry form, with the conversation attached as the message.
export default function ConsultationCard({ messages, onClose, onSubmitted }) {
  const [formData, setFormData] = useState(emptyForm);
  const [websiteConfirmation, setWebsiteConfirmation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setFormData((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setErrorMsg('');

    if (!formData.name.trim()) return setErrorMsg('Please enter your name.');
    if (!EMAIL_PATTERN.test(formData.email.trim())) return setErrorMsg('Please enter a valid work email.');
    if (!formData.company.trim()) return setErrorMsg('Please enter your company name.');
    if (!formData.phone.trim()) return setErrorMsg('Please enter a contact number.');

    // Bots fill the hidden field; people never see it. Pretend it worked.
    if (websiteConfirmation.trim()) {
      onSubmitted(formData);
      return;
    }

    setLoading(true);
    try {
      const payload = buildLeadPayload({
        formData: {
          ...formData,
          message: buildEnquiryPrefill(messages) || 'Consultation requested from the website assistant.'
        },
        websiteConfirmation,
        leadSource: 'assistant'
      });
      await submitLead(payload);

      // Same GA4 event as the page form, told apart by form_id. No personal data.
      const source = payload.attribution?.last || {};
      trackWebsiteEvent('generate_lead', {
        event_category: 'conversion',
        form_id: 'assistant_consultation',
        has_message: Boolean(payload.message),
        has_job_title: Boolean(payload.job_title),
        lead_source: source.utm_source || (source.gclid ? 'google_ads' : '') || source.referrer || 'direct',
        lead_medium: source.utm_medium || '',
        lead_campaign: source.utm_campaign || ''
      });

      onSubmitted(formData);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="consultation-card" onSubmit={handleSubmit} noValidate>
      <div className="consultation-card-header">
        <span className="consultation-card-icon">
          <Briefcase size={16} />
        </span>
        <div>
          <strong>Request a consultation</strong>
          <small>A senior strategist responds within one business day.</small>
        </div>
        <button type="button" className="consultation-card-close" onClick={onClose} aria-label="Close consultation form">
          <X size={16} />
        </button>
      </div>

      <div className="consultation-card-grid">
        <label>
          <span>Full name *</span>
          <input type="text" autoComplete="name" value={formData.name} onChange={update('name')} maxLength={120} required />
        </label>
        <label>
          <span>Work email *</span>
          <input type="email" autoComplete="email" value={formData.email} onChange={update('email')} maxLength={254} required />
        </label>
        <label>
          <span>Company *</span>
          <input type="text" autoComplete="organization" value={formData.company} onChange={update('company')} maxLength={160} required />
        </label>
        <label>
          <span>Job title</span>
          <input type="text" autoComplete="organization-title" value={formData.jobTitle} onChange={update('jobTitle')} maxLength={120} />
        </label>
        <label className="consultation-card-wide">
          <span>Phone *</span>
          <input type="tel" autoComplete="tel" value={formData.phone} onChange={update('phone')} maxLength={40} required />
        </label>
        {/* Honeypot: hidden from people, filled by bots. */}
        <input
          type="text"
          name="website_confirmation"
          className="consultation-card-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={websiteConfirmation}
          onChange={(event) => setWebsiteConfirmation(event.target.value)}
        />
      </div>

      {errorMsg && (
        <p className="consultation-card-error" role="alert">
          {errorMsg}
        </p>
      )}

      <button type="submit" className="consultation-card-submit" disabled={loading}>
        {loading ? <Loader2 size={16} className="consultation-card-spinner" /> : null}
        <span>{loading ? 'Sending…' : 'Submit request'}</span>
      </button>
      <p className="consultation-card-note">Your conversation so far is shared with the team for context.</p>
    </form>
  );
}
