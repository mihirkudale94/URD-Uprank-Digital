import React from 'react';
import { publicAsset } from '@/utils/publicAsset';
import './Clients.css';

export default function Clients() {
  const logos = [
    publicAsset('/img/Logo Clouds/Logo 1.png'),
    publicAsset('/img/Logo Clouds/Logo 2.png'),
    publicAsset('/img/Logo Clouds/Logo 3.png'),
    publicAsset('/img/Logo Clouds/Logo-4.png'),
    publicAsset('/img/Logo Clouds/Logo 5.png'),
    publicAsset('/img/Logo Clouds/Logo-6.png'),
    publicAsset('/img/Logo Clouds/Logo 7.png'),
    publicAsset('/img/Logo Clouds/Logo 8.png'),
    publicAsset('/img/Logo Clouds/Logo 9.png'),
    publicAsset('/img/Logo Clouds/Logo 10.png'),
    publicAsset('/img/Logo Clouds/Logo 11.png'),
    publicAsset('/img/Logo Clouds/Logo 12.png'),
  ];

  // Duplicate logos list for seamless infinite scroll loops
  const doubleLogos = [...logos, ...logos];

  return (
    <section className="section clients-section" id="clients">
      <div className="container">
        <h3 className="clients-title">Trusted By Leading Brands Globally</h3>
        
        <div className="logo-slider-container">
          <div className="logo-slide-track">
            {doubleLogos.map((logo, idx) => (
              <div key={idx} className="logo-slide-card">
                <img src={logo} alt={`Client logo ${idx + 1}`} className="client-logo-img" width="200" height="75" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
