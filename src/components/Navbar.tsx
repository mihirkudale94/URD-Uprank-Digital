"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import Image from "next/image";
import Magnetic from "./Magnetic";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  // Detect system preference on mount
  useEffect(() => {
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const active = saved || preferred;
    setTheme(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("#")[0]);
  };

  return (
    <nav className={`${styles.navbar} ${isOpen ? styles.navOpen : ""} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.navWrap}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/img/logo-header.png"
              alt="Uprank Digital Logo"
              width={160}
              height={45}
              className={styles.logoImg}
              priority
            />
          </Link>
        </div>

        {/* Hamburger Icon */}
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          aria-expanded={isOpen}
        >
          <span className={`${styles.bar} ${isOpen ? styles.bar1 : ""}`}></span>
          <span className={`${styles.bar} ${isOpen ? styles.bar2 : ""}`}></span>
          <span className={`${styles.bar} ${isOpen ? styles.bar3 : ""}`}></span>
        </button>

        <ul className={`${styles.navLinks} ${isOpen ? styles.linksOpen : ""}`}>
          <li><Link href="/" className={isActive("/") && pathname === "/" ? styles.activeLink : ""} onClick={() => setIsOpen(false)}>What we do</Link></li>
          <li><Link href="/about" className={isActive("/about") ? styles.activeLink : ""} onClick={() => setIsOpen(false)}>Who are we</Link></li>
          <li><Link href="/#how-we-do" onClick={() => setIsOpen(false)}>How we do</Link></li>
          <li><Link href="/#what-we-do" onClick={() => setIsOpen(false)}>What we offer</Link></li>
          <li><Link href="/#work" onClick={() => setIsOpen(false)}>Who we work with</Link></li>
          <li><Link href="/#client" onClick={() => setIsOpen(false)}>Clients</Link></li>
          <li className={styles.mobileCta}>
            <Link href="/about#contact-form" className="btn-primary" onClick={() => setIsOpen(false)}>
              Get Started
            </Link>
          </li>
        </ul>

        <div className={styles.rightGroup}>
          {/* Dark Mode Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>

          <div className={styles.ctaButton}>
            <Magnetic>
              <Link href="/about#contact-form" className="btn-primary">
                Get Started
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </nav>
  );
}
