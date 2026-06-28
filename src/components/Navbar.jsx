import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navLinks = [
    { label: 'What we do', href: '#services' },
    { label: 'Who are we', href: '#who' },
    { label: 'How we do', href: '#process' },
    { label: 'Who we work with', href: '#clients' },
    { label: 'What they say', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const offset = 80; // height of floating navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`nav-container ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-wrap">
        <a href="#home" className="nav-logo" onClick={(e) => handleLinkClick(e, '#home')}>
          <img src={publicAsset('/img/logo-header.png')} alt="Uprank Digital" className="logo-header-img" />
        </a>

        {/* Desktop Nav */}
        <div className="nav-links">
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="nav-item-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <a href="#contact" className="btn btn-primary btn-sm-nav" onClick={(e) => handleLinkClick(e, '#contact')}>
            Get in Touch <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="nav-mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`nav-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="nav-mobile-drawer-wrap">
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mobile-action-row">
            <button onClick={toggleTheme} className="theme-toggle-btn mobile-theme-btn" aria-label="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <a href="#contact" className="btn btn-primary" onClick={(e) => handleLinkClick(e, '#contact')}>
              Get in Touch <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Styling specific to navbar */}
      <style>{`
        .nav-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.5rem 0;
          transition: var(--transition-normal);
          border-bottom: 1px solid transparent;
          background: transparent;
        }
        
        .nav-scrolled {
          padding: 0.85rem 0;
          background: var(--bg-nav);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
        }

        .nav-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .logo-header-img {
          height: 40px;
          display: block;
          object-fit: contain;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-links ul {
          display: flex;
          gap: 2rem;
          margin-right: 1rem;
        }

        .nav-item-link {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-muted);
          position: relative;
          padding: 0.25rem 0;
        }

        .nav-item-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background: var(--gradient-accent);
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }

        .nav-item-link:hover {
          color: var(--text-main);
        }

        .nav-item-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

        .theme-toggle-btn {
          background: var(--bg-hover-pills);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          outline: none;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-hover-pills-hover);
          border-color: var(--primary);
          color: var(--primary);
        }

        .btn-sm-nav {
          padding: 0.6rem 1.35rem;
          font-size: 0.875rem;
          border-radius: 8px;
        }

        .nav-mobile-toggle {
          display: none;
          background: var(--bg-hover-pills);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          cursor: pointer;
          z-index: 1100;
          outline: none;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: min(320px, 100vw);
          height: 100dvh;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          z-index: 1050;
          transform: translateX(100%);
          transition: transform var(--transition-normal);
          padding: 6rem 2rem 2rem 2rem;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
        }

        .nav-mobile-drawer.open {
          transform: translateX(0);
        }

        .nav-mobile-drawer-wrap {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .nav-mobile-drawer-wrap ul {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .nav-mobile-drawer-wrap a {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-main);
          display: block;
        }

        .nav-mobile-drawer-wrap a:hover {
          color: var(--primary);
        }

        .mobile-action-row {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mobile-action-row .btn {
          width: 100%;
        }

        .mobile-theme-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          padding: 0.8rem;
          height: auto;
        }

        @media (max-width: 1120px) {
          .nav-links {
            display: none;
          }
          .nav-mobile-toggle {
            display: inline-flex;
          }
        }

        @media (max-width: 768px) {
          .logo-header-img {
            height: 34px;
          }
          .nav-container {
            padding: 1rem 0;
          }
          .nav-scrolled {
            padding: 0.75rem 0;
          }
        }

        @media (max-width: 420px) {
          .nav-mobile-drawer {
            width: 100%;
            padding: 5.5rem 1.25rem 1.5rem;
            border-left: 0;
          }
          .nav-mobile-drawer-wrap {
            gap: 2rem;
          }
        }
      `}</style>
    </nav>
  );
}
