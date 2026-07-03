import React, { useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyPartner from './components/WhyPartner';
import Leadership from './components/Leadership';
import WhoWeAre from './components/WhoWeAre';
import Process from './components/Process';
import BrandStatement from './components/BrandStatement';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
const WebsiteAssistant = lazy(() => import('./components/WebsiteAssistant'));
const VoiceAgentButton = lazy(() => import('./components/VoiceAgentButton'));
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
        <WhyPartner />
        <Leadership />
        <WhoWeAre />
        <BrandStatement />
        <Process />
        <Testimonials />
        <FAQ />
        <ContactForm />
      </main>
      <Suspense fallback={null}>
        <VoiceAgentButton />
        <WebsiteAssistant />
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
