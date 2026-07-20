import React from 'react';
import { Trophy, Users, Megaphone, CalendarDays, ArrowRight } from 'lucide-react';
import './SportsClubs.css';

const offerings = [
  {
    icon: <Trophy size={20} />,
    title: 'Club Websites & Registrations',
    text: 'Modern club and academy websites with fixtures, results, membership enquiries, and player registrations built in.'
  },
  {
    icon: <Users size={20} />,
    title: 'Fan & Community Engagement',
    text: 'Social content and campaigns that keep members, parents, and supporters connected to the club all season.'
  },
  {
    icon: <Megaphone size={20} />,
    title: 'Sponsor-Ready Presence',
    text: 'A professional digital footprint and audience numbers that help clubs attract and retain sponsors.'
  },
  {
    icon: <CalendarDays size={20} />,
    title: 'Match-Day Content',
    text: 'Creatives, reels, and result graphics that turn every fixture into engaging brand content.'
  }
];

export default function SportsClubs() {
  const handleScrollToContact = (e) => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section sports-clubs-section" id="sports-clubs">
      <div className="container">
        <div className="section-header scroll-animate">
          <span className="section-subtitle">Sports Clubs &amp; Academies</span>
          <h2 className="heading-md">Digital Growth for Sports Clubs</h2>
          <p className="section-description">
            We help sports clubs, academies, and leagues grow their digital presence with data-driven
            marketing, engaging content, and AI-powered strategies that deliver real results.
          </p>
        </div>

        <div className="sports-clubs-grid scroll-animate delay-100">
          {offerings.map((item) => (
            <div key={item.title} className="sports-club-card glass-card">
              <div className="pillar-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="sports-clubs-cta scroll-animate delay-200">
          <a href="#contact" className="btn btn-primary" onClick={handleScrollToContact}>
            Grow Your Club <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
