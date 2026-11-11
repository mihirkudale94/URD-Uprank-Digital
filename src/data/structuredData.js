// Builds the Organization / ProfessionalService JSON-LD from siteContent.js. vite.config.js
// writes the result into index.html, so the structured data Google reads is made from the
// same values the visitor sees on the page.
import {
  ADDRESS,
  AREA_SERVED,
  BUSINESS,
  CONTACT,
  EXPERTISE,
  FOUNDER,
  SERVICES,
  SITE_URL,
  SOCIAL_LINKS
} from './siteContent.js';

export const buildOrganizationJsonLd = () => {
  const logo = new URL(BUSINESS.logoPath, SITE_URL).href;
  const telephone = `+${CONTACT.phoneE164}`;

  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE_URL}#organization`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateNames,
    legalName: BUSINESS.legalName,
    description: BUSINESS.description,
    slogan: BUSINESS.slogan,
    image: logo,
    logo,
    url: SITE_URL,
    email: CONTACT.email,
    telephone,
    foundingDate: BUSINESS.foundingYear,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.streetAddress,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.countryCode
    },
    areaServed: AREA_SERVED.map(({ type, name }) => ({ '@type': type, name })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone,
      email: CONTACT.email,
      areaServed: ADDRESS.countryCode,
      availableLanguage: BUSINESS.languages
    },
    founder: {
      '@type': 'Person',
      name: FOUNDER.name,
      jobTitle: FOUNDER.jobTitle
    },
    knowsAbout: EXPERTISE.map((item) => item.title),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: SERVICES.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.title }
      }))
    },
    sameAs: Object.values(SOCIAL_LINKS)
  };
};

// `<` is escaped so no value can close the script tag early.
export const renderJsonLdScript = (data = buildOrganizationJsonLd()) =>
  `<script type="application/ld+json">\n${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')}\n</script>`;
