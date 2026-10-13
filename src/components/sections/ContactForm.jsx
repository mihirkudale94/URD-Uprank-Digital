import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { buildLeadPayload, submitLead } from '@/utils/leadSubmission';
import './ContactForm.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [websiteConfirmation, setWebsiteConfirmation] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (websiteConfirmation.trim()) {
      setIsSubmitted(true);
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Please enter your contact number.');
      return;
    }

    setLoading(true);

    try {
      await submitLead(buildLeadPayload({ formData, websiteConfirmation }));

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      setErrorMsg(error.message || 'We could not submit your inquiry right now. Please call or WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section section-bg-alt" id="contact">
      <div className="glow-bg"></div>

      <div className="container contact-container">
        <div className="contact-info-panel scroll-animate">
          <div className="section-header section-header-left">
            <span className="section-subtitle">Get in Touch</span>
            <h2 className="heading-md">Get a straight answer on your website and ads</h2>
            <p className="section-description">
              Tell us the goal, the site, and roughly what you can spend. We&rsquo;ll come back with
              an honest view of whether we can help &mdash; and what we&rsquo;d do first.
            </p>
          </div>
        </div>

        <div className="contact-form-panel glass-card scroll-animate delay-100">
          {isSubmitted ? (
            <div className="success-state animate-fade-in-up">
              <CheckCircle2 className="success-icon" size={64} />
              <h3>Got it &mdash; thanks.</h3>
              <p>Sachin will call or WhatsApp you within one business day.</p>
              <button className="btn btn-secondary" onClick={() => setIsSubmitted(false)}>
                Send Another Message <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" id="intake-form">
              {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

              <div className="website-confirmation" aria-hidden="true">
                <label htmlFor="contact-website-confirmation">Website confirmation</label>
                <input
                  type="text"
                  id="contact-website-confirmation"
                  name="websiteConfirmation"
                  tabIndex={-1}
                  autoComplete="off"
                  value={websiteConfirmation}
                  onChange={(event) => setWebsiteConfirmation(event.target.value)}
                />
              </div>

              {/* Floating Input Group */}
              <div className="form-grid">
                <div className="input-group">
                  <input 
                    type="text" 
                    name="name" 
                    id="contact-name"
                    aria-label="Full Name"
                    placeholder="Full Name *" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    maxLength={120}
                    required 
                  />
                </div>
                
                <div className="input-group">
                  <input 
                    type="email" 
                    name="email" 
                    id="contact-email"
                    aria-label="Email Address"
                    placeholder="Email Address *" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    maxLength={254}
                    required 
                  />
                </div>

                <div className="input-group">
                  <input 
                    type="tel" 
                    name="phone" 
                    id="contact-phone"
                    aria-label="Phone Number"
                    placeholder="Phone Number *" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    maxLength={40}
                    required 
                  />
                </div>
              </div>

              {/* Textarea */}
              <div className="input-group">
                <textarea 
                  name="message" 
                  id="contact-message"
                  aria-label="Project Goals Message"
                  placeholder="Tell us more about your project goals..." 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  maxLength={3000}
                  rows={4}
                ></textarea>
              </div>

              <button 
                type="submit" 
                id="contact-submit-btn"
                className="btn btn-primary submit-btn" 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'} 
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
