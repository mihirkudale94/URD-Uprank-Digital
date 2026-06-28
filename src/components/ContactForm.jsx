import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';

const getBaseUrl = () => import.meta.env.BASE_URL || '/';
const contactEndpoint = `${getBaseUrl().replace(/\/?$/, '/')}contact-submit.php`;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    url: '',
    message: '',
    website: ''
  });
  
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const servicesList = [
    { id: 'digital', label: 'Digital Services' },
    { id: 'marketing', label: 'Performance Marketing' },
    { id: 'ai', label: 'AI Powered Marketing' },
    { id: 'conversion', label: 'Conversion Optimization' },
    { id: 'analytics', label: 'Analytics & Growth Strategy' },
    { id: 'advertise', label: 'Paid Advertising' },
    { id: 'content', label: 'Content Design' },
    { id: 'software', label: 'Software Solutions' }
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
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...formData,
          services: selectedServices,
          page: window.location.href
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'We could not submit your inquiry right now. Please call or WhatsApp us directly.');
      }

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        url: '',
        message: '',
        website: ''
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
          <h2 className="heading-md">Let's Build Something Sparking Together</h2>
          <p className="contact-info-desc">
            Ready to take your business to the next level? Fill out our questionnaire and our team will get in touch with you within 24 hours.
          </p>

          <div className="contact-methods">
            <div className="contact-method-card glass-card">
              <h4>Direct Support</h4>
              <p className="highlight-contact">sachin@uprankdigital.com</p>
              <p>+91 93711 16165</p>
            </div>
            
            <div className="contact-method-card glass-card">
              <h4>Headquarters</h4>
              <p>16 Harshnil Society, 81 Rambag Colony,</p>
              <p>Paud Road, Pune 411038, INDIA</p>
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
                  name="website"
                  id="contact-website-confirmation"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleInputChange}
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

      <style>{`
        .contact-container {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .contact-info-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-info-desc {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .contact-method-card {
          padding: 1.75rem;
        }

        .contact-form-panel:hover,
        .contact-method-card:hover {
          transform: translateY(0);
          background: var(--bg-card);
          box-shadow: var(--glass-shadow);
        }

        .contact-form-panel:hover::after,
        .contact-method-card:hover::after {
          background: var(--gradient-card-border);
        }

        .contact-method-card h4 {
          color: var(--primary);
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
        }

        .contact-method-card p {
          color: var(--text-muted);
          font-size: 0.925rem;
        }

        .highlight-contact {
          color: var(--text-main) !important;
          font-weight: 600;
        }

        .contact-form-panel {
          padding: 3rem;
        }

        .contact-form h3 {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .form-sub-header {
          font-size: 0.875rem;
          color: var(--text-dim);
          margin-bottom: 2rem;
        }

        .form-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 0.8rem 1.2rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .website-confirmation {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .input-group {
          position: relative;
        }

        .input-group.full-width {
          grid-column: span 2;
        }

        .input-group input,
        .input-group textarea {
          width: 100%;
          background: var(--bg-hover-pills);
          border: 1px solid var(--border-color);
          padding: 1rem 1.25rem;
          border-radius: 10px;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition-fast);
        }

        .input-group input:focus,
        .input-group textarea:focus {
          border-color: var(--primary);
          background: var(--bg-hover-pills-hover);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.15);
        }

        .services-selector-wrap {
          margin-bottom: 1.75rem;
        }

        .services-selector-wrap h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .service-chip {
          background: var(--bg-hover-pills);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.55rem 1.35rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          outline: none;
        }

        .service-chip:hover {
          background: var(--bg-hover-pills-hover);
          border-color: var(--border-color-hover);
          color: var(--text-main);
        }

        .service-chip.active {
          background: var(--gradient-accent);
          color: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 8px;
        }

        .success-state {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem 0;
        }

        .success-icon {
          color: #10b981;
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));
        }

        .success-state h3 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .success-state p {
          color: var(--text-muted);
          max-width: 400px;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .contact-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .input-group.full-width {
            grid-column: span 1;
          }
          .contact-form-panel {
            padding: 2.25rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
