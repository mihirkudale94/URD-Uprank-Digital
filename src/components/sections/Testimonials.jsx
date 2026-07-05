import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { publicAsset } from '@/utils/publicAsset';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Mr. Achyut Chitale',
    role: 'Founder & Managing Director',
    company: 'Candid Confectioneries Pvt Ltd. (Flipper)',
    image: publicAsset('/img/Testimonial/p1.png'),
    quote: 'We developed a great bonding with Up Rank Digital and their dedication to our website is evident in all aspects of the site. We appreciate their attention to detail and creative approach to bringing our new exhibit to life online.'
  },
  {
    name: 'Dr. Vasudha Keskar',
    role: 'Founder & Pioneer',
    company: 'Kanak Jaggery',
    image: publicAsset('/img/Testimonial/p2.png'),
    quote: 'Up Rank Digital is a master at making your website fantasies come true. We are so pleased with their work that we have already recommended them to several of our friends. They handle things very efficiently and are available for any questions we have. They also keep us updated with all the posts and content, so we can see how our site is performing. I would highly recommend Up Rank digital to anyone in need of web development or SEO services!'
  },
  {
    name: 'Mr. Prasad Apte',
    role: 'Managing Director',
    company: 'Shree Devashree Foods',
    image: publicAsset('/img/Testimonial/p3.png'),
    quote: 'With the help of Up Rank Digital we were able to make an online presence for our business Shree Devashree Foods. Their commitment to our website is visible in every element of it. The response to our new website has been overwhelmingly positive. With their help, we did product shoots for 17 of our ready-to-make products in just 2 days during the pandemic, helping us expand our business in the US and UK. High appreciation for their efforts!'
  },
  {
    name: 'Mr. Abhijeet Gangdhar',
    role: 'Owner',
    company: 'Gangdhar Mithaiwale',
    image: publicAsset('/img/Testimonial/p4.png'),
    quote: 'Up Rank Digital listened to what we wanted in a new website and built it! Our site views, service inquiries, and ease of maintenance have all improved dramatically. I\'ve gone through several website redesigns, and this was by far the smoothest and least stressful. Every step of the way, I was heard and valued. Our new website has exceeded our expectations.'
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoPlayTimer = useRef(null);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);
  }, [stopAutoPlay]);

  useEffect(() => {
    if (isPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isPlaying, activeIndex, startAutoPlay, stopAutoPlay]);

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <section className="section" id="testimonials">
      <div className="glow-bg"></div>

      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Testimonials</span>
          <h2 className="heading-md">What Our Clients Say</h2>
          <p className="section-description">
            Read stories of how we have helped business owners establish reliable websites and drive growth.
          </p>
        </div>

        <div 
          className="testimonials-carousel scroll-animate delay-100"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Main Active Testimonial Card */}
          <div className="testimonial-active-card glass-card">
            <Quote className="quote-mark" size={48} />
            
            <div className="testimonial-content">
              <p className="testimonial-text">
                "{testimonials[activeIndex].quote}"
              </p>
              
              <div className="testimonial-author">
                {/* Visual Avatar frame. If image fails, fallback to nice styled character representation */}
                <div className="avatar-frame-box">
                  <img 
                    src={testimonials[activeIndex].image} 
                    alt={testimonials[activeIndex].name} 
                    className="author-avatar"
                    width="60"
                    height="60"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback placeholder
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="fallback-avatar-icon">
                    {testimonials[activeIndex].name.charAt(0)}
                  </div>
                </div>
                <div className="author-info">
                  <h4>{testimonials[activeIndex].name}</h4>
                  <p>{testimonials[activeIndex].role}, <span className="highlight-company">{testimonials[activeIndex].company}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="testimonials-controls">
            <button className="control-btn" onClick={handlePrev} aria-label="Previous Testimonial">
              <ChevronLeft size={20} />
            </button>
            
            <div className="dots-container">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`dot ${activeIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                ></button>
              ))}
            </div>

            <button className="control-btn" onClick={handleNext} aria-label="Next Testimonial">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
