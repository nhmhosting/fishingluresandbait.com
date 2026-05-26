import { createContext, useContext, useState, useEffect } from 'react';

const SiteSettingsContext = createContext({});

const DEFAULTS = {
  // Contact
  contact_phone_sales: '888-555-FISH',
  contact_phone_shop: '888-555-FISH',
  contact_email: 'info@fishingluresandbait.com',
  contact_address: '123 Lakeside Rd, Fishing Creek, OH 44657',
  contact_business_hours: 'Monday - Saturday: 6:00 AM - 6:00 PM EST, Sunday: 7:00 AM - 2:00 PM EST',
  contact_business_hours_short: 'Mon-Sat 6 am to 6 pm, Sun 7 am to 2 pm EST',

  // SEO
  seo_home_title: 'Fishing Lures & Bait | Custom Painted Lures, Live Bait & Soft Plastics',
  seo_home_description: 'Shop premium fishing lures, custom painted crappie and bass lures, live bait, soft plastics, and tackle. Made in Ohio. Free shipping on orders over $50.',
  seo_shop_title: 'Shop Fishing Lures, Baits & Tackle | Freshwater & Saltwater',
  seo_shop_description: 'Browse our full selection of fishing lures, custom painted baits, live bait, soft plastics, hard baits, and tackle for bass, crappie, walleye, and more.',
  seo_about_title: 'About Us | Fishing Lures & Bait - Over 30 Years of Fishing Heritage',
  seo_about_description: 'Fishing Lures & Bait has been serving anglers for over 30 years with premium lures, live bait, and custom tackle. Family-owned in Ohio.',
  seo_contact_title: 'Contact Us | Fishing Lures & Bait Experts',
  seo_contact_description: 'Get in touch with Fishing Lures & Bait for custom lure orders, bait availability, and tackle advice. Call or email our fishing experts.',
  seo_shipping_title: 'Shipping | Fishing Lures & Bait',
  seo_shipping_description: 'We ship fishing lures and bait nationwide. Free shipping on orders over $50. Live bait available for local pickup only.',
  seo_how_to_order_title: 'How to Order | Fishing Lures & Bait',
  seo_how_to_order_description: 'Learn how to order custom lures, bait, and tackle from Fishing Lures & Bait.',
  seo_site_name: 'Fishing Lures & Bait',

  // Home
  home_hero_subtitle: 'Fishing Lures & Bait',
  home_hero_title: 'When the fish aren\'t biting...think of us!',
  home_hero_description: 'Premium fishing lures, custom painted baits, live bait & soft plastics — by anglers, for anglers!',
  home_mission_title: 'Our Mission',
  home_mission_text: 'We are dedicated to helping you catch more fish! Whether you\'re a weekend angler, tournament fisherman, or just love spending time on the water, we have the lures, baits, and tackle you need. From custom painted crappie jigs to live minnows, soft plastics to topwater plugs — if the fish are biting, we\'ve got what you need! SO WHEN THE FISH AREN\'T BITING...THINK OF US!!',
  home_fabrication_title: 'Custom Lures & Special Orders',
  home_fabrication_text: 'Looking for something specific? We offer custom painted lures, special color patterns, and hard-to-find tackle. We also carry live bait including minnows, nightcrawlers, and leeches. Let us know what you need and we\'ll do our best to get it for you!',
  home_customer_service_title: 'Customer Service',
  home_customer_service_text: 'We do everything we can to make sure you have the right bait and tackle before you hit the water. Stop in our shop or give us a call — we\'re anglers ourselves and we know what works!',
  home_featured_mode: 'all',

  // About
  about_header_subtitle: 'Over 30 Years on the Water',
  about_what_we_do: 'With over 30 years of fishing experience, we stock a wide variety of fishing lures, live bait, and tackle for every freshwater species. We specialize in custom painted lures, hard baits, soft plastics, and live bait for bass, crappie, walleye, pike, and catfish. Our friendly staff are anglers themselves and can help you pick the right lure, the right bait, and the right tackle for your local waters.',
  about_made_in_usa: 'Our custom lures are 100% Made in America!!',
  about_slogan: 'So...WHEN THE FISH AREN\'T BITING....THINK OF US!!',
  about_mission_text: 'We help you catch fish! Our lures and baits are selected and tested by real anglers who know what works in lakes, rivers, and streams across Ohio and the Midwest. SO WHEN THE FISH AREN\'T BITING THINK OF US!!',
  about_fabrication_text: 'Can\'t find the lure or bait you need? Give us a call! We can order in specialty items, custom paint lures to your specs, and source hard-to-find tackle. Stop in or call us with your request.',
  about_customer_service_text: 'We do everything we can to make sure you have the right bait and tackle for your trip. Call or stop by — we\'re happy to share what\'s working on the local waters right now.',
  about_fiber_laser_text: 'Premium custom painted lures with intricate color patterns designed by local tournament anglers.',
  about_plasma_text: 'Hard bait blanks and jig blanks cut and shaped for maximum action in the water.',
  about_custom_fab_text: 'Custom color matching and special orders on most lure brands and patterns.',
  about_expert_text: 'Decades of hands-on fishing experience on lakes, rivers, and reservoirs across Ohio and beyond.',
  about_years_experience: '30+',
  about_products_count: '800+',
  about_brands_count: '40+',

  // Shipping
  shipping_ground_text: 'We ship fishing lures and tackle via USPS, UPS, and FedEx direct to your door. Free shipping on orders over $50. Live bait is available for in-store pickup only — we cannot ship live bait. We ship nationwide and also to Canada.',
  shipping_freight_text: 'For larger tackle orders and bulk bait orders, we offer local delivery and can arrange freight shipping. Contact us for rates on bulk orders of bait or tackle.',

  // Returns
  returns_policy_text: 'It is our policy that we ask our customers to contact us within 5 business days of receiving their order to notify us of any issues. This applies to standard tackle items in original condition. All returns will be subject to a 20% restocking fee. Lures that have been used or altered are not returnable.',
  returns_special_build_text: 'Custom painted lures and special orders are non-refundable once production has started. We will send a photo confirmation before painting custom orders.',
  returns_closing_text: 'If you have any questions about our products or your order, please don\'t hesitate to contact us before the season starts!',

  // Payment
  payment_methods_list: 'Visa, MasterCard, American Express, Discover, Cash, Check',
  payment_processing_fee_notice: 'We accept all major credit cards. No processing fees.',

  // Terms
  terms_acceptance: 'By accessing and using this website and our services, you accept and agree to be bound by the terms and provisions of this agreement.',
  terms_products_pricing: 'All products displayed on our website are subject to availability. Prices are subject to change without notice. Live bait availability is seasonal.',
  terms_orders_payment: 'Payment must be received before orders are processed and shipped. For custom lure orders, a deposit may be required before work begins.',
  terms_shipping_delivery: 'Shipping times are estimates and are not guaranteed. Live bait is for in-store pickup only.',
  terms_returns_refunds: 'Standard items may be returned in original condition within 5 business days. Custom orders and used lures are non-returnable.',
  terms_liability: 'Fishing Lures & Bait shall not be liable for any damages arising from the use of our products. Proper fishing technique and safety are the responsibility of the angler.',
  terms_product_warranty: 'Our products are designed for fishing use. We stand behind the quality of our lures and tackle. Contact us if you receive a defective product.',
  terms_changes: 'We reserve the right to modify these terms at any time.',

  // Brands (About page)
  brand_bluebird_name: 'Custom Painted',
  brand_bluebird_full: 'Custom Painted Lures',
  brand_bluebird_categories: 'Crappie Jigs, Bass Jigs, Walleye Spoons, Spinnerbaits',
  brand_thomas_name: 'Live Bait',
  brand_thomas_full: 'Live Bait Selection',
  brand_thomas_categories: 'Minnows, Nightcrawlers, Leeches, Wax Worms, Red Wigglers',
  brand_international_name: 'Soft Plastics',
  brand_international_full: 'Soft Plastic Baits',
  brand_international_categories: 'Senko-style, Creature Baits, Swimbaits, Tubes, Grubs',
  brand_collins_name: 'Hard Baits',
  brand_collins_full: 'Hard Bait Lures',
  brand_collins_note: 'Crankbaits, Topwater, Jerkbaits, Spinnerbaits, Spoons',
  brand_collins_categories: 'Crankbaits, Topwater Plugs, Jerkbaits, Spoons, Spinnerbaits',
  brand_carpenter_name: 'Terminal Tackle',
  brand_carpenter_categories: 'Hooks, Sinkers, Bobbers, Swivels, Hook & Loop Bundles',
  brand_wayne_name: 'Fly Fishing',
  brand_wayne_categories: 'Flies, Fly tying materials, Fly rods & reels',

  // Footer
  footer_description: 'Premium fishing lures, custom painted baits, live bait, and tackle for every freshwater species. Family-owned Ohio bait shop since 1994.',
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const flat = {};
          if (data.settings) {
            Object.values(data.settings).forEach(categorySettings => {
              Object.assign(flat, categorySettings);
            });
          }
          setSettings(prev => ({ ...prev, ...flat }));
        }
      } catch (err) {
        console.warn('Failed to fetch site settings, using defaults:', err);
      } finally {
        setLoaded(true);
      }
    }
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  return context.settings || DEFAULTS;
}

export { DEFAULTS as SITE_DEFAULTS };
export default SiteSettingsContext;