import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';

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

      <style>{`
        .testimonials-carousel {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .testimonial-active-card {
          padding: 4rem;
          min-height: 380px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .quote-mark {
          color: var(--primary);
          opacity: 0.12;
          position: absolute;
          top: 2rem;
          left: 2rem;
        }

        .testimonial-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          gap: 2.5rem;
        }

        .testimonial-text {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--text-main);
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
        }

        .avatar-frame-box {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid var(--primary);
          background: rgba(255,255,255,0.05);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .author-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0; left: 0;
          z-index: 2;
        }

        .fallback-avatar-icon {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          z-index: 1;
        }

        .author-info h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.15rem;
        }

        .author-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .highlight-company {
          color: var(--primary);
          font-weight: 600;
        }

        .testimonials-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          outline: none;
        }

        .control-btn:hover {
          background: var(--gradient-accent);
          color: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 4px 15px rgba(229, 46, 113, 0.25);
          transform: scale(1.05);
        }

        .dots-container {
          display: flex;
          gap: 0.75rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: var(--transition-fast);
          outline: none;
        }

        .dot.active {
          background: var(--primary);
          width: 24px;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .testimonial-active-card {
            padding: 2.5rem 2rem;
            min-height: auto;
          }
          .testimonial-text {
            font-size: 1rem;
          }
          .quote-mark {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
