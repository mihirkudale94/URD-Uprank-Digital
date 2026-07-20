import React, { Suspense, lazy } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/layout/Hero';
import Footer from '@/components/layout/Footer';

import Clients from '@/components/sections/Clients';
import Services from '@/components/sections/Services';
import WhyPartner from '@/components/sections/WhyPartner';
import Leadership from '@/components/sections/Leadership';
import WhoWeAre from '@/components/sections/WhoWeAre';
import Process from '@/components/sections/Process';
import BrandStatement from '@/components/sections/BrandStatement';
import Testimonials from '@/components/sections/Testimonials';
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
        <Services />
        <WhyPartner />
        <Leadership />
        <WhoWeAre />
        <BrandStatement />
        <Process />
        <Clients />
        <Testimonials />
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
