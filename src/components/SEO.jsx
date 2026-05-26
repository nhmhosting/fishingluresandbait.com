import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Custom Bus and Truck Panels';
const SITE_URL = 'https://custombusandtruckpanels.com';
const DEFAULT_IMAGE = '/images/front-page-image.webp';

// FAQ structured data — shown on homepage and contact page
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you make custom school bus body panels?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We specialize in custom school bus body panel fabrication. Our in-house fiber laser and plasma cutting equipment lets us produce panels to your exact specifications — from one-off replacement parts to bulk orders for bus fleets.',
      },
    },
    {
      '@type': 'Question',
      name: 'What bus brands do you supply parts for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We supply parts for Blue Bird, Thomas Built Buses, International / AmTran, Collins Bus, Carpenter, Wayne, and universal/multi-fit panels. Our catalog covers over 592 active part numbers across all major school bus brands.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship nationwide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We ship school bus parts and panels to bus garages, school districts, and fleet operators across the United States. Standard lead time is 1–3 business days for in-stock items. Custom fabrication orders typically ship within 5–10 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your return policy for school bus parts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standard stocked items can be returned within 30 days in unused, undamaged condition. Custom-cut or custom-fabricated panels are non-returnable unless there is a manufacturing defect. See our full return policy for details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I order parts without creating an account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Guest checkout is available. You can browse and purchase parts without an account. Creating an account lets you access tiered pricing, view order history, and manage saved addresses.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer panel matching for rust repair?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Send us photos and measurements of the damaged panel and we can fabricate a matching replacement. We specialize in rust-repair panels for older school buses where OEM parts are no longer available.',
      },
    },
  ],
};

// Organization structured data — shown on all pages that use SEO component
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.webp`,
  image: `${SITE_URL}/images/front-page-image.webp`,
  description: 'Manufacturer of school bus replacement body panels, rust repair parts, and schoolie conversion supplies. Serving bus garages, school districts, fleet mechanics, and the schoolie community for over 45 years. Based in Minerva, Ohio.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '302 S. Market St',
    addressLocality: 'Minerva',
    addressRegion: 'OH',
    postalCode: '44657',
    addressCountry: 'US',
  },
  telephone: '+1-888-402-1661',
  email: 'custombusandtruck@outlook.com',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-888-402-1661',
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: 'English',
  },
  sameAs: [
    'https://www.facebook.com/custombusandtruckpanels',
  ],
};

// AutoPartsStore structured data — homepage only (Google-rich-result eligible subtype of LocalBusiness)
// Using AutoPartsStore instead of LocalBusiness for better SERP eligibility for parts business
const autoPartsStoreJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoPartsStore',
  '@id': `${SITE_URL}/#autopartsstore`,
  name: SITE_NAME,
  description: 'School bus replacement body panels, rust repair parts, custom fabrication, and schoolie conversion supplies. Over 45 years serving bus garages, fleet mechanics, school districts, and the schoolie community.',
  url: SITE_URL,
  telephone: '+1-888-402-1661',
  email: 'custombusandtruck@outlook.com',
  image: `${SITE_URL}/images/front-page-image.webp`,
  logo: `${SITE_URL}/images/logo.webp`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '302 S. Market St',
    addressLocality: 'Minerva',
    addressRegion: 'OH',
    postalCode: '44657',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7295,
    longitude: -81.1051,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:30',
    closes: '16:30',
  },
  priceRange: '$$',
  paymentAccepted: 'Cash, Check, Visa, MasterCard, American Express, Discover, ACH',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'School Bus Parts',
    url: `${SITE_URL}/shop`,
  },
  knowsAbout: [
    'School bus body panels',
    'School bus replacement parts',
    'Schoolie conversion parts',
    'Bus garage supplies',
    'Blue Bird bus parts',
    'Thomas bus parts',
    'International bus parts',
    'Custom bus fabrication',
    'Skoolie conversion panels',
  ],
};

// ContactPage structured data — contact page only
const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Custom Bus & Truck Panels',
  description: 'Contact Custom Bus & Truck Panels for school bus parts, custom fabrication quotes, and order support.',
  url: `${SITE_URL}/contact`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-888-402-1661',
    contactType: 'customer service',
    email: 'custombusandtruck@outlook.com',
    areaServed: 'US',
    availableLanguage: 'English',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:30',
      closes: '16:30',
    },
  },
};

/**
 * SEO Component for managing meta tags on each page
 * @param {Object} props
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Meta description
 * @param {string} [props.canonical] - Canonical URL path (e.g., '/shop' or '/product/AT105')
 * @param {string} [props.image] - Open Graph image URL
 * @param {string} [props.type] - Open Graph type (default: 'website', use 'product' for products)
 * @param {Object} [props.product] - Product data for structured data
 * @param {boolean} [props.noindex] - Set to true to prevent indexing
 */
function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  product,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullCanonical = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const fullImage = image?.startsWith('http') ? image : `${SITE_URL}${image || DEFAULT_IMAGE}`;

  // Generate product structured data (JSON-LD)
  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || description,
    image: product.image ? `${SITE_URL}${product.image}` : fullImage,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: getBrandName(product.brand),
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        url: fullCanonical,
        priceCurrency: 'USD',
        price: product.price,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      },
    }),
  } : null;

  // Breadcrumb structured data
  const breadcrumbJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${SITE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: fullCanonical,
      },
    ],
  } : null;

  const isHomepage = canonical === '/';
  const isContactPage = canonical === '/contact';

  return (
    <Helmet>
      {/* Document language — must match <html lang="en"> in index.html */}
      <html lang="en" />

      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Product-specific meta */}
      {product && product.price && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="USD" />
        </>
      )}

      {/* Structured Data - Organization (homepage + contact) */}
      {!product && (isHomepage || isContactPage) && (
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
      )}

      {/* Structured Data - AutoPartsStore (homepage only — Google rich-result eligible) */}
      {!product && isHomepage && (
        <script type="application/ld+json">
          {JSON.stringify(autoPartsStoreJsonLd)}
        </script>
      )}

      {/* Structured Data - FAQPage (homepage + contact) */}
      {!product && (isHomepage || isContactPage) && (
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      )}

      {/* Structured Data - ContactPage */}
      {!product && isContactPage && (
        <script type="application/ld+json">
          {JSON.stringify(contactPageJsonLd)}
        </script>
      )}

      {/* Structured Data - Product */}
      {productJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      )}

      {/* Structured Data - Breadcrumbs */}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to get display name for brand
function getBrandName(brand) {
  const brandNames = {
    'bluebird': 'Blue Bird',
    'thomas': 'Thomas',
    'thomas-minotour': 'Thomas Minotour',
    'international': 'International/Amtran',
    'collins': 'Collins',
    'universal': 'Universal/Multi-fit',
  };
  return brandNames[brand] || brand || SITE_NAME;
}

export default SEO;
