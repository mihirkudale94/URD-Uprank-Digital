import React from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { clientLogos } from '@/data/clientLogos';
import './Clients.css';

export default function Clients() {
  // The list is rendered twice so the marquee loops seamlessly. The second pass
  // is always decorative; the first is only exposed to assistive technology for
  // logos that have a real brand name recorded against them.
  const marquee = [
    ...clientLogos.map((logo, index) => ({ ...logo, key: `a-${index}`, decorative: false })),
    ...clientLogos.map((logo, index) => ({ ...logo, key: `b-${index}`, decorative: true }))
  ];

  return (
    <section className="section clients-section" id="clients">
      <div className="container">
        <h3 className="clients-title">Brands That Trust Us</h3>

        <div className="logo-slider-container" role="group" aria-label="Logos of brands we have worked with">
          <div className="logo-slide-track">
            {marquee.map((logo) => {
              const labelled = Boolean(logo.name) && !logo.decorative;

              return (
                <div
                  key={logo.key}
                  className="logo-slide-card"
                  aria-hidden={labelled ? undefined : true}
                >
                  <img
                    src={publicAsset(`/img/Logo Clouds/${logo.file}`)}
                    alt={labelled ? logo.name : ''}
                    className="client-logo-img"
                    width="320"
                    height="180"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
