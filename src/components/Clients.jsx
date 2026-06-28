import React from 'react';
import { publicAsset } from '../utils/publicAsset';

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
                <img src={logo} alt={`Client logo ${idx + 1}`} className="client-logo-img" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .clients-section {
          padding: 4rem 0;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          overflow: hidden;
          position: relative;
        }

        .clients-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-dim);
          text-align: center;
          margin-bottom: 3rem;
        }

        .logo-slider-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          padding: 1rem 0;
        }

        /* Gradient mask for smooth fade out at edges */
        .logo-slider-container::before,
        .logo-slider-container::after {
          content: '';
          position: absolute;
          top: 0;
          width: 150px;
          height: 100%;
          z-index: 10;
          pointer-events: none;
        }

        .logo-slider-container::before {
          left: 0;
          background: linear-gradient(90deg, var(--bg-primary) 0%, transparent 100%);
        }

        .logo-slider-container::after {
          right: 0;
          background: linear-gradient(270deg, var(--bg-primary) 0%, transparent 100%);
        }

        .logo-slide-track {
          display: flex;
          gap: 4rem;
          width: max-content;
          animation: scroll-left 40s linear infinite;
        }

        .logo-slide-card {
          flex-shrink: 0;
          width: 170px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1.5rem;
          transition: var(--transition-fast);
        }

        .logo-slide-card:hover {
          transform: scale(1.08);
        }

        .client-logo-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: none;
          opacity: 0.75;
          transition: var(--transition-fast);
        }

        .logo-slide-card:hover .client-logo-img {
          opacity: 1;
          filter: none;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-160px * 12 - 4rem * 12));
          }
        }

        @media (max-width: 640px) {
          .clients-section {
            padding: 3rem 0;
          }
          .clients-title {
            font-size: 0.72rem;
            margin-bottom: 2rem;
          }
          .logo-slider-container::before,
          .logo-slider-container::after {
            width: 64px;
          }
          .logo-slide-track {
            gap: 2.25rem;
            animation-duration: 34s;
          }
          .logo-slide-card {
            width: 132px;
            height: 48px;
            padding: 0 0.75rem;
          }

          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-132px * 12 - 2.25rem * 12));
            }
          }
        }
      `}</style>
    </section>
  );
}
