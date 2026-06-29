import React, { useState, useEffect } from 'react';
import { ArrowDown, MessageSquare, Sparkles } from 'lucide-react';
import './Hero.css';

const words = ["Design", "Develop", "Promote", "Optimize"];

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 120;
  const deletingSpeed = 60;
  const delayBetweenWords = 2200;

  useEffect(() => {
    let timer;
    const currentWord = words[currentWordIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && currentText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), delayBetweenWords);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
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
        {/* Centered Headline & Action */}
        <div className="hero-left-content">
          <span className="hero-tag">
            <Sparkles size={13} className="hero-tag-sparkle" /> Elevating Digital Presence
          </span>
          
          <h1 className="hero-title">
            We Help Brands <br />
            <span className="gradient-text hero-typewriter-wrapper">
              {currentText}
              <span className="cursor-blink">|</span>
            </span>
            <br />
            Your Business Needs
          </h1>

          <p className="hero-description">
            A progressive digital growth agency using AI, analytics, performance marketing, and conversion-focused website development to help brands improve visibility, leads, and measurable results.
          </p>

          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary" onClick={handleScrollToContact}>
              Contact Us <MessageSquare size={18} />
            </a>
            <a href="#services" className="btn btn-secondary" onClick={handleScrollToServices}>
              Explore Services <ArrowDown size={18} className="arrow-bounce" />
            </a>
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
