import React, { Suspense, lazy } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/layout/Hero';
import Footer from '@/components/layout/Footer';

import Clients from '@/components/sections/Clients';
import Expertise from '@/components/sections/Expertise';
import Services from '@/components/sections/Services';
import ExperienceBanner from '@/components/sections/ExperienceBanner';
import WhyPartner from '@/components/sections/WhyPartner';
import Testimonials from '@/components/sections/Testimonials';
import Leadership from '@/components/sections/Leadership';
import BrandStatement from '@/components/sections/BrandStatement';
import FAQ from '@/components/sections/FAQ';
import ContactForm from '@/components/sections/ContactForm';

const WebsiteAssistant = lazy(() => import('@/components/features/WebsiteAssistant'));

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function App() {
  useScrollAnimation();

  return (
    <div className="app-root">
      <Navbar />
      <main>
        <Hero />
        <Clients />
        <Expertise />
        <Services />
        <ExperienceBanner />
        <WhyPartner />
        <Testimonials />
        <Leadership />
        <BrandStatement />
        <FAQ />
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
