import React, { useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Clients from './components/Clients';
import Services from './components/Services';
import WhoWeAre from './components/WhoWeAre';
import Leadership from './components/Leadership';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
const Chatbot = lazy(() => import('./components/Chatbot'));
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="app-root">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhoWeAre />
        <Leadership />
        <Process />
        <Clients />
        <Testimonials />
        <FAQ />
        <ContactForm />
      </main>
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
