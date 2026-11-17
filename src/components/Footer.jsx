import { Link } from 'react-router-dom';
import { Logo, PrimaryCTA } from './ui';
import { MapPin, Mail, Instagram, Facebook, YouTube, LinkedIn } from './Icons';
import { COMPANY, SOCIAL } from '../data/site';

const ICONS = { Instagram, Facebook, YouTube, LinkedIn };

const ABOUT_LINKS = [
  ['/about', 'About us'], ['/portfolio', 'Our work'], ['/career', 'Careers'], ['/contact', 'Contact'],
  ['/privacy-policy', 'Privacy policy'], ['/payment-policy', 'Payment policy'], ['/terms-and-conditions', 'Terms & conditions']
];
const SOLUTION_LINKS = [
  ['/services#enterprise-crm', 'Enterprise software'], ['/services#enterprise-crm', 'Custom CRM'], ['/services#ai-agents', 'AI agents'],
  ['/services#enterprise-crm', 'GEO (generative engine optimization)'], ['/services#seo-aeo', 'AEO (answer engine optimization)']
];
const SERVICE_LINKS = [
  ['/services#mobile-apps', 'Mobile apps'], ['/services#web-development', 'Web development'], ['/services#seo-aeo', 'SEO & AEO'],
  ['/services#ai-agents', 'AI agent development'], ['/services#ar-vr', 'AR/VR development'], ['/services#3d-modelling', '3D modelling'],
  ['/services#digital-marketing', 'Digital marketing']
];

function Column({ title, links }) {
  return (
    <nav aria-label={title}>
      <h4>{title}</h4>
      <ul>{links.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="et-footer" data-theme="light">
      <div className="et-container">
        <div className="et-footer__grid">
          <div className="et-footer__brand">
            <Logo variant="stacked" height={112} />
            <p className="et-footer__org">
              <strong>{COMPANY.name}</strong><br />
              <span className="et-footer__line"><MapPin />{COMPANY.location}</span>
            </p>
            <p className="et-footer__label">Contact us</p>
            <p className="et-footer__contact">
              <span className="et-footer__line">Business and project enquiries</span>
              <span className="et-footer__line"><Mail /><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></span>
            </p>
            <PrimaryCTA size="sm" className="et-footer__cta" magnetic={false} arrow={false} />
            <p className="et-footer__label">Follow us on</p>
            <div className="et-social">
              {SOCIAL.map(({ label, href }) => {
                const Icon = ICONS[label];
                return <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon /></a>;
              })}
            </div>
          </div>
          <Column title="About Enlight Techz" links={ABOUT_LINKS} />
          <Column title="Solutions" links={SOLUTION_LINKS} />
          <Column title="Services" links={SERVICE_LINKS} />
        </div>
        <div className="et-footer__bottom">
          <span>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</span>
          <span>{COMPANY.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
