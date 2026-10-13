import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { publicAsset } from '@/utils/publicAsset';
import { scrollToSection } from '@/utils/scrollToSection';
import './Navbar.css';

const navLinks = [
  {
    label: 'What We Do',
    href: '#services',
    kicker: 'Five service lines'
  },
  {
    label: 'Expertise',
    href: '#expertise',
    kicker: 'Eight core capabilities'
  },
  {
    label: 'Why Us',
    href: '#why-us',
    kicker: 'Why work with us'
  },
  {
    label: 'How We Work',
    href: '#how-we-work',
    kicker: 'Our four-step process'
  },
  {
    label: 'Clients',
    href: '#testimonials',
    kicker: 'Brands that trust us',
    // The logo wall (#clients), the client profile (#who-we-work-with) and the
    // quotes (#testimonials) are one idea split across three sections; all of
    // them should highlight this item.
    matches: ['testimonials', 'clients', 'who-we-work-with']
  },
  {
    label: 'About',
    href: '#leadership',
    kicker: 'About Up Rank Digital'
  }
];

const sectionIds = [
  'home', 'clients', 'who-we-work-with', 'services', 'expertise', 'why-us', 'how-we-work',
  'testimonials', 'leadership', 'contact'
];

const isLinkActive = (link, activeSection) =>
  (link.matches || [link.href.slice(1)]).includes(activeSection);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

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
    const inBand = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inBand.add(entry.target.id);
        } else {
          inBand.delete(entry.target.id);
        }
      });

      // Two sections share the band while one scrolls into the other. Take the
      // later one in document order: that is the section being scrolled into,
      // so the highlight advances with the reader rather than lagging behind
      // the section being left.
      for (let index = sectionIds.length - 1; index >= 0; index -= 1) {
        if (inBand.has(sectionIds[index])) {
          setActiveSection(sectionIds[index]);
          break;
        }
      }
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
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

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    scrollToSection(href);
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
                  className={`nav-item-link ${isLinkActive(link, activeSection) ? 'active' : ''}`}
                  aria-current={isLinkActive(link, activeSection) ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
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
                  className={isLinkActive(link, activeSection) ? 'active' : ''}
                >
                  <span>{link.label}</span>
                  <small>{link.kicker}</small>
                </a>
              </li>
            ))}
          </ul>

          <div className="mobile-action-row">
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
