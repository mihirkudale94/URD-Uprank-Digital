import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { buildLeadPayload, submitLead } from '../utils/leadSubmission';
import './ContactForm.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    url: '',
    message: ''
  });
  
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [websiteConfirmation, setWebsiteConfirmation] = useState('');

  const servicesList = [
    { id: 'digital', label: 'Digital Services' },
    { id: 'marketing', label: 'Marketing Services' },
    { id: 'advertise', label: 'Advertising Services' },
    { id: 'content', label: 'Content Services' },
    { id: 'software', label: 'Software Services' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleService = (label) => {
    if (selectedServices.includes(label)) {
      setSelectedServices(selectedServices.filter(s => s !== label));
    } else {
      setSelectedServices([...selectedServices, label]);
    }
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
      await submitLead(buildLeadPayload({
        formData,
        selectedServices
      }));

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        url: '',
        message: ''
      });
      setSelectedServices([]);
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
          <span className="section-subtitle">Get in Touch</span>
          <h2 className="heading-md">Let's Build Your Next Growth System</h2>
          <p className="contact-info-desc">
            Share your business goal, website, timeline, and budget comfort. The URD team will review the context and suggest the most useful next step.
          </p>

          <div className="contact-methods">
            <div className="contact-method-card glass-card">
              <h4>Direct Support</h4>
              <p className="highlight-contact">sachin@uprankdigital.com</p>
              <p>+91 93711 16165</p>
            </div>
            
            <div className="contact-method-card glass-card">
              <h4>Headquarters</h4>
              <p>Shyamal CHS</p>
              <p>Pune 411048, India</p>
            </div>
          </div>
        </div>

        <div className="contact-form-panel glass-card scroll-animate delay-100">
          {isSubmitted ? (
            <div className="success-state animate-fade-in-up">
              <CheckCircle2 className="success-icon" size={64} />
              <h3>Thank You!</h3>
              <p>Your details have been successfully received. A digital growth specialist from Uprank Digital will reach out to you shortly.</p>
              <button className="btn btn-secondary" onClick={() => setIsSubmitted(false)}>
                Send Another Message <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" id="intake-form">
              <h3>Intake Questionnaire</h3>
              <p className="form-sub-header">Help us understand your business requirements.</p>

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
                    aria-label="Your Name"
                    placeholder="Your Name *" 
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

                <div className="input-group">
                  <input 
                    type="text" 
                    name="businessName" 
                    id="contact-business"
                    aria-label="Business Name"
                    placeholder="Business Name" 
                    value={formData.businessName} 
                    onChange={handleInputChange} 
                    maxLength={160}
                  />
                </div>

                <div className="input-group full-width">
                  <input 
                    type="text" 
                    inputMode="url"
                    name="url" 
                    id="contact-url"
                    aria-label="Website URL"
                    placeholder="Website URL (e.g. www.mycompany.com)" 
                    value={formData.url} 
                    onChange={handleInputChange} 
                    maxLength={300}
                  />
                </div>
              </div>

              {/* Services Chip Selection */}
              <div className="services-selector-wrap">
                <h4>I'm interested in:</h4>
                <div className="chips-container">
                  {servicesList.map(service => {
                    const isSelected = selectedServices.includes(service.label);
                    return (
                      <button
                        type="button"
                        key={service.id}
                        id={`contact-chip-${service.id}`}
                        className={`service-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleService(service.label)}
                      >
                        {service.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea */}
              <div className="input-group full-width">
                <textarea 
                  name="message" 
                  id="contact-message"
                  aria-label="Project Goals Message"
                  placeholder="Tell us more about your project goals (Optional)..." 
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
