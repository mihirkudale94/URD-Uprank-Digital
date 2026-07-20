import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { publicAsset } from '@/utils/publicAsset';
import './Navbar.css';

const navLinks = [
  {
    label: 'Services',
    href: '#services',
    kicker: 'Web, ads, content, AI'
  },
  {
    label: 'Process',
    href: '#process',
    kicker: 'Structured delivery model'
  },
  {
    label: 'Why Us',
    href: '#why-us',
    kicker: 'What makes us different'
  },
  {
    label: 'About',
    href: '#leadership',
    kicker: 'About Up Rank Digital'
  },
  {
    label: 'FAQ',
    href: '#faq',
    kicker: 'Answers before you book'
  }
];

const sectionIds = ['home', 'services', 'why-us', 'leadership', 'about', 'process', 'testimonials', 'faq', 'contact'];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry?.target?.id) {
        setActiveSection(visibleEntry.target.id);
      }
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: [0.15, 0.35, 0.6]
    });

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    const target = document.querySelector(href);
    if (target) {
      const offset = window.innerWidth <= 768 ? 76 : 92;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      window.history.replaceState(null, '', href);
    }
  };

  return (
    <nav className={`nav-container ${isScrolled ? 'nav-scrolled' : ''}`} aria-label="Primary navigation">
      <div className="container nav-wrap">
        <a href="#home" className="nav-logo" onClick={(e) => handleLinkClick(e, '#home')} aria-label="Up Rank Digital home">
          <img src={publicAsset('/img/logo-header.png')} alt="Up Rank Digital" className="logo-header-img" width="160" height="40" />
        </a>

        <div className="nav-desktop-panel">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`nav-item-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
                  aria-current={activeSection === link.href.slice(1) ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <a href="#contact" className="btn btn-primary btn-sm-nav" onClick={(e) => handleLinkClick(e, '#contact')}>
              Book Discovery Call <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <button
          className="nav-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <button
        className={`nav-mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-label="Close mobile navigation"
        tabIndex={isMobileMenuOpen ? 0 : -1}
      />

      <div className={`nav-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`} id="mobile-navigation">
        <div className="nav-mobile-drawer-wrap">
          <div className="mobile-drawer-header">
            <span>Navigate Up Rank Digital</span>
            <small>Services, process, credibility, and booking.</small>
          </div>

          <ul className="mobile-nav-list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={activeSection === link.href.slice(1) ? 'active' : ''}
                >
                  <span>{link.label}</span>
                  <small>{link.kicker}</small>
                </a>
              </li>
            ))}
          </ul>

          <div className="mobile-action-row">
            <button onClick={toggleTheme} className="theme-toggle-btn mobile-theme-btn" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <a href="#contact" className="btn btn-primary" onClick={(e) => handleLinkClick(e, '#contact')}>
              Book Discovery Call <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="nav-scroll-progress" style={{ width: `${scrollProgress}%` }} />
    </nav>
  );
}
