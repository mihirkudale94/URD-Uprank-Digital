import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uprankdigital.com"),
  title: "URD Uprank Digital | AI-Driven Growth Agency | Pune",
  description: "A leading creative digital marketing agency in Pune offering SEO, Web Development, and Social Media Marketing with a 2026 futuristic edge.",
  keywords: ["Digital Marketing Pune", "SEO Services", "Web Development Agency", "Social Media Marketing", "AI Growth Agency", "Next-Gen Marketing"],
  icons: {
    icon: "/img/favcon.png",
    apple: "/img/favcon.png",
  },
  openGraph: {
    title: "URD Uprank Digital | Next-Gen Digital Agency",
    description: "Transforming complex business challenges into intuitive digital experiences that drive real growth.",
    url: "https://uprankdigital.com",
    siteName: "URD Uprank Digital",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/img/og-banner.png",
        width: 1200,
        height: 630,
        alt: "URD Uprank Digital — AI-Driven Growth Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "URD Uprank Digital | AI-Driven Growth Agency",
    description: "Leading creative digital marketing agency with a 2026 futuristic edge.",
    images: ["/img/og-banner.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://uprankdigital.com/#organization",
      "name": "URD Uprank Digital",
      "alternateName": "Uprank Digital",
      "url": "https://uprankdigital.com",
      "logo": "https://uprankdigital.com/img/logo-header.png",
      "description": "A Progressive Digital Agency with Creative Spark, offering SEO, Web Development, Social Media Marketing, and Digital Strategy in Pune, India.",
      "foundingDate": "2010",
      "founder": { "@type": "Person", "name": "Sachin Raje" },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "16 Harshnil Society, 81 Rambag Colony, Paud Road",
        "addressLocality": "Pune",
        "postalCode": "411038",
        "addressCountry": "IN",
      },
      "telephone": "+919371116165",
      "email": "info@uprankdigital.com",
      "sameAs": [
        "https://in.linkedin.com/company/uprankdigital",
        "https://www.facebook.com/UpRankDigital/",
      ],
      "areaServed": ["India", "United Kingdom", "United States", "Australia"],
      "priceRange": "₹₹",
    },
    {
      "@type": "WebSite",
      "@id": "https://uprankdigital.com/#website",
      "url": "https://uprankdigital.com",
      "name": "URD Uprank Digital",
      "publisher": { "@id": "https://uprankdigital.com/#organization" },
    },
    {
      "@type": "Service",
      "serviceType": "Digital Marketing",
      "provider": { "@id": "https://uprankdigital.com/#organization" },
      "areaServed": "India",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Digital Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Search Engine Optimisation (SEO)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Web Design & Development" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Social Media Marketing" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Performance Advertising (PPC)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Enterprise Software Solutions" } },
        ],
      },
    },
  ],
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Concierge from "@/components/Concierge";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Concierge />
      </body>
    </html>
  );
}
