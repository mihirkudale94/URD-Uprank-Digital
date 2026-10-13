import React, { Suspense, lazy } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/layout/Hero';
import Footer from '@/components/layout/Footer';

import Clients from '@/components/sections/Clients';
import WhoWeWorkWith from '@/components/sections/WhoWeWorkWith';
import Expertise from '@/components/sections/Expertise';
import Services from '@/components/sections/Services';
import WhyPartner from '@/components/sections/WhyPartner';
import HowWeWork from '@/components/sections/HowWeWork';
import Testimonials from '@/components/sections/Testimonials';
import Leadership from '@/components/sections/Leadership';
import BrandStatement from '@/components/sections/BrandStatement';
import ContactForm from '@/components/sections/ContactForm';

// Loaded on its own chunk: the panel and its styles are dead weight for a visitor who never
// opens it, and nothing above the fold depends on it.
const WebsiteAssistant = lazy(() => import('@/components/features/WebsiteAssistant'));

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function App() {
  useScrollAnimation();

  return (
    <div className="app-root">
      <a className="skip-to-content" href="#main-content">Skip to main content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Clients />
        <WhoWeWorkWith />
        <Services />
        <Expertise />
        <WhyPartner />
        <HowWeWork />
        <Testimonials />
        <Leadership />
        <BrandStatement />
        <ContactForm />
      </main>
      <Suspense fallback={null}>
        <WebsiteAssistant />
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
