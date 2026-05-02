"use client";
import styles from "./page.module.css";
import globalStyles from "../page.module.css";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import { useState } from "react";

export default function About() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", business: "", url: "", message: "", services: [] as string[]
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className={globalStyles.container}>
      {/* Header Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Discover Uprank Digital</div>
          <h1 className={`${styles.title} animate-fade-in`}>
            Discover <br/>
            <span className="heading-gradient">Uprank Digital</span>
          </h1>
          <p className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: "0.2s" }}>
            A Progressive Digital Agency with Creative Spark
          </p>
        </div>
      </section>



      {/* Who We Are Bento */}
      <section className={styles.section}>
        <ScrollReveal>
          <div className={`bento-card tilt-card ${styles.whoBento}`}>
            <div className={styles.whoImage}>
              <Image
                src="/img/who-we-are.webp"
                alt="Uprank Digital team — who we are"
                width={600}
                height={400}
                className={styles.imgRounded}
                style={{ width: '100%', height: 'auto' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className={styles.whoText}>
              <h2 className={styles.sectionTitle}>A Progressive Digital Agency with Creative Spark</h2>
              <p className={styles.text}>
                A leading agency established to help clients connect with their target audience by advocating progressive and innovative digital marketing strategies that drive meaningful, measurable results.<br/><br/>
                We are backed by <strong>decades of experience working with digital agencies from the US, UK, and Australia</strong>. We bring that global digital strategy and understanding to every project we undertake in the Indian and international markets.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Vision Mission Values */}
      <section className={styles.section}>
        <div className={styles.bentoGrid3}>
          <ScrollReveal delayClass="revealDelay1">
            <div className={`bento-card tilt-card ${styles.valueCard}`}>
              <div className={styles.valueIcon}>👁️</div>
              <h3 className={styles.cardTitle}>VISION</h3>
              <p className={styles.textSmall}>
                To establish Uprank Digital as an agency that advocates progressive and innovative ideas, framing strategies with next-generation techniques that create lasting impact for every client.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayClass="revealDelay2">
            <div className={`bento-card tilt-card ${styles.valueCard} ${styles.valueFeatured}`}>
              <div className={styles.valueIcon}>🚀</div>
              <h3 className={styles.cardTitle}>MISSION</h3>
              <p className={styles.textSmall}>
                To help businesses grow by deeply understanding their needs, then delivering high-quality, value-for-money solutions with complete client satisfaction.<br/><br/>
                We don&apos;t believe in selling what clients don&apos;t need. We never compromise our integrity to win business.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayClass="revealDelay3">
            <div className={`bento-card tilt-card ${styles.valueCard}`}>
              <div className={styles.valueIcon}>💎</div>
              <h3 className={styles.cardTitle}>VALUES</h3>
              <p className={styles.textSmall}>
                We believe every business is unique — and so are its goals. Our approach adapts to your specific needs and objectives. Guided by our two core <strong>T&apos;s: Transparency and Trust</strong>, we build partnerships that last. We don&apos;t believe in selling you what you don&apos;t need — we focus on what helps you grow.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitleCenter}>Why work with us</h2>
        <div className={styles.reasonsList}>
          {[
            { id: "1", title: "You Talk, We Listen", text: "We make full efforts to understand your business goals first. All strategies are built keeping those goals in mind. A shiny new website is worthless if it doesn't help you reach your targets — so we listen, then we throw in lots of ideas for improvement." },
            { id: "2", title: "Out of the Box Thinking", text: "We are passionately curious about web development and digital marketing. Our team of designers, developers, and marketers are innovative thinkers who deliver creative, tailored solutions for every business challenge." },
            { id: "3", title: "Global Experience, Local Understanding", text: "Our competitive advantage is your competitive advantage. We are backed by decades of experience working with digital agencies from the US, UK, and Australia — bringing global strategy with an understanding of the Indian market." },
            { id: "4", title: "Strategies Built Around Your Goals", text: "Every business is unique — and so are its goals. Our approach adapts to your specific business plan, ensuring execution is aligned with what truly matters for your growth." },
            { id: "5", title: "High Standards and Work Ethics", text: "Our stringent work ethics mean you can trust us to work to the highest standards at all times. Transparency is the key. We don't waste your time or money — we focus on quality over quantity." },
            { id: "6", title: "Enhanced Performance at Every Stage", text: "From acquisition to retention, our team of talented, creative individuals connects powerful ideas with new technologies to build high-performance campaigns that change businesses and meet the demands of online consumers." }
          ].map((reason, i) => (
            <ScrollReveal key={reason.id} delayClass={`revealDelay${(i % 3) + 1}`}>
              <div className={`bento-card tilt-card ${styles.reasonCard}`}>
                <div className={styles.reasonHeader}>
                  <span className={styles.reasonId}>{reason.id}</span>
                  <h3 className={styles.reasonTitle}>{reason.title}</h3>
                </div>
                <p className={styles.textSmall}>{reason.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Our Team */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitleCenter}>Our Team</h2>
        <div className={styles.teamGrid}>
          <ScrollReveal delayClass="revealDelay1">
            <div className={`bento-card tilt-card ${styles.teamCard}`}>
              <Image src="/img/Boy.webp" alt="Sachin Raje — Founder, Uprank Digital" width={200} height={200} className={styles.teamImg} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              <div className={styles.teamInfo}>
                <h4 className={styles.teamName}>Sachin Raje</h4>
                <p className={styles.teamRole}>Founder</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delayClass="revealDelay2">
            <div className={`bento-card tilt-card ${styles.teamCard}`}>
              <Image src="/img/Girl-2.webp" alt="Sneha Raje — Creative Lead, Uprank Digital" width={200} height={200} className={styles.teamImg} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              <div className={styles.teamInfo}>
                <h4 className={styles.teamName}>Sneha Raje</h4>
                <p className={styles.teamRole}>Creative Lead</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Form */}
      <section className={styles.section} id="contact-form">
        <ScrollReveal>
          <div className={`bento-card tilt-card ${styles.formContainer}`}>
            <div className={styles.formHeader}>
              <h2 className={styles.sectionTitle}>Let&apos;s work together</h2>
              <p className={styles.text} style={{ marginTop: '8px' }}>Fill in the form and we&apos;ll get back to you within 24 hours.</p>
            </div>

            {status === "success" ? (
              <div className={styles.successMsg}>
                <div className={styles.successIcon}>✓</div>
                <h3>Message Received!</h3>
                <p>Thank you, we&apos;ll be in touch within 24 hours. You can also reach us directly at <strong>info@uprankdigital.com</strong>.</p>
              </div>
            ) : (
              <form className={styles.formContent} onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name">Name <span className={styles.required}>*</span></label>
                    <input id="name" name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Email <span className={styles.required}>*</span></label>
                    <input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input id="phone" name="phone" type="tel" placeholder="+91 ..." value={form.phone} onChange={handleChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="business">Business Name</label>
                    <input id="business" name="business" type="text" placeholder="Company Name" value={form.business} onChange={handleChange} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label htmlFor="url">Website URL</label>
                    <input id="url" name="url" type="text" placeholder="https://..." value={form.url} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.servicesSelect}>
                  <p className={styles.label}>I&apos;m interested in</p>
                  <div className={styles.checkGrid}>
                    {['Digital', 'Marketing', 'Advertising', 'Content', 'Software'].map(s => (
                      <label key={s} className={`${styles.checkItem} ${form.services.includes(s) ? styles.checkActive : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.services.includes(s)}
                          onChange={() => handleCheckbox(s)}
                        />
                        <span>{s} Services</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="message">Message <span className={styles.required}>*</span></label>
                  <textarea id="message" name="message" placeholder="Tell us about your project..." value={form.message} onChange={handleChange} required />
                </div>

                {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === "loading"}>
                  {status === "loading" ? "Sending..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
