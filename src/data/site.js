import defaults from '../../shared/defaults.json';

export const COMPANY = {
  name: 'Enlight Techz',
  email: 'info@enlighttechz.in',
  location: 'Karaikal and Puducherry',
  tagline: 'Illuminating your digital presence with innovative IT solutions.'
};

export const PRIMARY_CTA = 'Book a free consultation';

export const NAV = [
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/career', label: 'Careers' },
  { to: '/contact', label: 'Contact' }
];

export const DEFAULT_SERVICES = defaults.services;
export const DEFAULT_PACKAGES = defaults.packages;

export const ASSURANCES = ['Free consultation', 'No obligation', '24/7 support for live projects'];

export const HERO_STRIP = ['Mobile apps', 'Websites & web apps', 'SEO & AEO', 'AI agents', 'AR/VR & 3D', 'Digital marketing'];

export const CLIENTS = [
  { name: 'Chola Taxi', logo: '/brand/clients/chola-taxi.png', height: 120 },
  { name: 'Favoflex', logo: '/brand/clients/favoflex.png', height: 116 },
  { name: 'BM The Hand Crafted Product', logo: '/brand/clients/bm-handcrafted.png', height: 128 },
  { name: 'Ansha Accessories', logo: '/brand/clients/ansha-accessories.png', height: 64 }
];

export const TESTIMONIALS = [
  {
    quote: 'Enlight Techz transformed our business with a stunning web platform. Their attention to detail and performance is unmatched.',
    name: 'M. Bharanidharan',
    role: 'Founder, Chola Taxi'
  },
  {
    quote: 'The SEO results we got were incredible. We started appearing on the first page of Google within months!',
    name: 'C. Vivine Joan',
    role: 'CEO, Favoflex'
  },
  {
    quote: 'A professional team that truly understands modern web technologies. Highly recommended for any IT project.',
    name: 'Covarthene R. M',
    role: 'Founder, Ansha Accessories'
  }
];

export const WORK = [
  {
    client: 'Chola Taxi',
    title: 'Web platform for Chola Taxi',
    service: 'Web development',
    image: '/brand/services/web-development.jpg',
    imageAlt: 'Illustration: a browser window with code',
    testimonial: TESTIMONIALS[0]
  },
  {
    client: 'Favoflex',
    title: 'Search visibility for Favoflex',
    service: 'SEO & AEO',
    image: '/brand/services/seo-aeo.jpg',
    imageAlt: 'Illustration: a search bar with the top result highlighted',
    testimonial: TESTIMONIALS[1]
  },
  {
    client: 'Ansha Accessories',
    title: 'Website for Ansha Accessories',
    service: 'Web development',
    image: '/brand/services/web-development.jpg',
    imageAlt: 'Illustration: a browser window with code',
    testimonial: TESTIMONIALS[2]
  }
];

export const INDUSTRIES = [
  'Finance', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing', 'Logistics',
  'Tours & travel', 'Real estate', 'Food & beverage', 'Entertainment'
];

export const FAQS = [
  {
    q: 'What services does Enlight Techz offer?',
    a: 'Custom web development, iOS and Android apps, enterprise software, SEO, AEO and GEO, CRM solutions, AI agent development, AR/VR, 3D modelling and digital marketing.'
  },
  {
    q: 'How can I request a quote or consultation?',
    a: 'Book a free consultation through the contact form or by email. Once we understand your needs, we send a custom solution and a detailed quote.'
  },
  {
    q: 'What industries do you serve?',
    a: 'Finance, healthcare, education, e-commerce, manufacturing, logistics, and tours and travel.'
  },
  {
    q: 'How do you handle data security and privacy?',
    a: 'Industry-standard encryption, secure cloud hosting, regular audits, and compliance with regulations such as GDPR and local cybersecurity laws.'
  },
  {
    q: 'What is your support process?',
    a: '24/7 support by phone, email and remote assistance for live projects, plus a knowledge base and a ticketing system.'
  },
  {
    q: 'How long does a project take?',
    a: 'Small projects take a few weeks; enterprise-scale solutions take several months, with regular progress updates.'
  },
  {
    q: 'What are your pricing models?',
    a: 'Fixed-price projects, hourly rates, or subscription-based managed services. Every quote follows a free consultation.'
  }
];

export const PROCESS = [
  { title: 'Free consultation', text: 'Tell us what you want to achieve. We learn about your business and recommend the right mix of services, with no obligation.' },
  { title: 'Custom quote', text: 'Once we understand your needs, you get a custom solution and a detailed quote: fixed price, hourly, or a managed subscription.' },
  { title: 'Build and support', text: 'We build your solution with regular progress updates. Live projects get 24/7 support by phone, email and remote assistance.' }
];

export const JOBS = [
  {
    title: 'Full Stack Developer',
    meta: 'Karaikal and Puducherry · Full-time',
    text: 'We are looking for a developer with experience in React, Node.js and MongoDB.'
  },
  {
    title: 'Digital Marketing Specialist',
    meta: 'Karaikal and Puducherry · Full-time',
    text: 'Lead client campaigns across social media marketing, SEO and AEO.'
  }
];

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/enlighttechz' },
  { label: 'Facebook', href: 'https://www.facebook.com/enlighttechz' },
  { label: 'YouTube', href: 'https://www.youtube.com/enlighttechz' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/enlighttechz' }
];
