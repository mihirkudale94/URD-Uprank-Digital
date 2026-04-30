"use client";
import styles from "./Footer.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email,
          message: "Newsletter subscription request",
        }),
      });
      if (!res.ok) throw new Error();
      setSubStatus("done");
      setEmail("");
    } catch {
      setSubStatus("error");
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Image
            src="/img/logo-footer.png"
            alt="Uprank Digital"
            width={180}
            height={50}
            className={styles.footerLogo}
            sizes="180px"
          />
          <p className={styles.tagline}>A Progressive Digital Agency with Creative Spark</p>
          <div className={styles.socials}>
            {/* LinkedIn */}
            <a href="https://in.linkedin.com/company/uprankdigital" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/UpRankDigital/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/uprankdigital/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@uprankdigital" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        <div className={styles.links}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/">What we do</Link></li>
            <li><Link href="/about">Who are we</Link></li>
            <li><Link href="/#how-we-do">How we do</Link></li>
            <li><Link href="/#what-we-do">What we offer</Link></li>
            <li><Link href="https://uprankdigital.com/blog/" target="_blank">Blog</Link></li>
          </ul>
        </div>

        <div className={styles.contact}>
          <h3>Say Hello to us</h3>
          <p><strong>Email:</strong> info@uprankdigital.com</p>
          <p><strong>Address:</strong> 16 Harshnil Society, 81 Rambag Colony,<br/>Paud Road, Pune 411038<br/>INDIA</p>
          <p><strong>Mobile:</strong><br/>+91 937 111 6165<br/>+91 982 366 0991</p>
        </div>

        <div className={styles.newsletter}>
          <h3>Join our Newsletter</h3>
          <p>Get the latest digital marketing trends delivered to your inbox.</p>
          {subStatus === "done" ? (
            <p className={styles.subSuccess}>✓ You&apos;re subscribed! Welcome aboard.</p>
          ) : (
            <form className={styles.subscribeBox} onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Newsletter email address"
              />
              <button type="submit" className="btn-primary" disabled={subStatus === "loading"}>
                {subStatus === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
          {subStatus === "error" && <p className={styles.subError}>Something went wrong. Please try again.</p>}
        </div>
      </div>

      <div className={styles.bottom}>
        <p>URD SOLUTIONS PVT. LTD. &copy; COPYRIGHT {new Date().getFullYear()}. All Rights Reserved</p>
      </div>
    </footer>
  );
}
