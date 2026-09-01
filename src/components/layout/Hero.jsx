import React, { useEffect, useState } from 'react';
import { ArrowDown, MessageSquare, Sparkles } from 'lucide-react';
import './Hero.css';

const capabilities = [
  'Website Development',
  'Digital Marketing',
  'Performance Marketing',
  'AI Powered Solutions',
  'Content Design & Management'
];

const heroProof = [
  { value: '10+', label: 'Years of experience' },
  { value: '12+', label: 'Brands served' },
  { value: '5', label: 'Service lines' },
  { value: '8', label: 'Areas of expertise' }
];

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 90;
  const deletingSpeed = 45;
  const delayBetweenWords = 2000;

  useEffect(() => {
    let timer;
    const currentWord = capabilities[currentWordIndex];

    if (isDeleting) {
      timer = window.setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
      }, deletingSpeed);
    } else {
      timer = window.setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && currentText === currentWord) {
      timer = window.setTimeout(() => setIsDeleting(true), delayBetweenWords);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % capabilities.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  const handleScrollToContact = (e) => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToServices = (e) => {
    e.preventDefault();
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="hero" id="home">
      {/* Dynamic ambient background glows */}
      <div className="hero-glow hero-glow-1"></div>
      <div className="hero-glow hero-glow-2"></div>
      <div className="hero-grid"></div>

      <div className="container hero-grid-split animate-fade-in-up">
        <div className="hero-left-content">
          <span className="hero-tag">
            <Sparkles size={13} className="hero-tag-sparkle" /> Digital Growth Partner
          </span>

          <h1 className="hero-title">
            Website development and digital performance marketing{' '}
            <span className="gradient-text">using AI</span>
          </h1>

          <p className="hero-ticker" aria-hidden="true">
            <span className="hero-ticker-label">Built for you:</span>
            <span className="hero-ticker-word">
              {currentText}
              <span className="cursor-blink">|</span>
            </span>
          </p>

          <p className="hero-description">
            We help brands and businesses grow their digital presence with data-driven marketing,
            engaging content, and AI-powered strategies that deliver real results.
          </p>

          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary" onClick={handleScrollToContact}>
              Book Free Discovery Call <MessageSquare size={18} />
            </a>
            <a href="#services" className="btn btn-secondary" onClick={handleScrollToServices}>
              What We Do <ArrowDown size={18} className="arrow-bounce" />
            </a>
          </div>

          <div className="hero-proof">
            {heroProof.map((item) => (
              <div key={item.label} className="hero-proof-item">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-scroll-indicator" onClick={handleScrollToServices}>
        <span>Scroll Down</span>
        <ArrowDown size={16} />
      </div>
    </header>
  );
}
