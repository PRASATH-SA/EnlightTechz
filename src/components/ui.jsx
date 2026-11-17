import { Link } from 'react-router-dom';
import { ArrowRight, Check, AlertCircle } from './Icons';
import { ASSURANCES, CLIENTS, PRIMARY_CTA } from '../data/site';

export function Logo({ variant = 'horizontal', height = 36, to = '/' }) {
  return (
    <Link className="et-logo" to={to} aria-label="Enlight Techz home" style={{ '--logo-h': `${height}px` }}>
      <img className="et-logo__light" src={`/brand/logo/${variant}-black.png`} alt="Enlight Techz" />
      <img className="et-logo__dark" src={`/brand/logo/${variant}-white.png`} alt="" aria-hidden="true" />
    </Link>
  );
}

/** The one primary action site-wide. Links to the contact form, optionally pre-selecting a service. */
export function PrimaryCTA({ size, service, label = PRIMARY_CTA, magnetic = true, arrow = true, className = '' }) {
  const to = service ? `/contact?service=${encodeURIComponent(service)}#consultation` : '/contact#consultation';
  const cls = ['et-btn', 'et-btn--primary', size && `et-btn--${size}`, magnetic && 'et-magnetic', className].filter(Boolean).join(' ');
  return (
    <Link className={cls} to={to}>
      {label} {arrow && <ArrowRight />}
    </Link>
  );
}

export function TextLink({ to, href, children }) {
  const inner = <>{children} <ArrowRight /></>;
  return href ? <a className="et-link" href={href}>{inner}</a> : <Link className="et-link" to={to}>{inner}</Link>;
}

export function Assurance({ items = ASSURANCES }) {
  return (
    <ul className="et-assure">
      {items.map((t) => <li key={t}><Check />{t}</li>)}
    </ul>
  );
}

export function SectionHeader({ title, lead, center, as: H = 'h2', id }) {
  return (
    <header className={`et-section-head et-reveal${center ? ' et-section-head--center' : ''}`}>
      <H id={id}>{title}</H>
      {lead && <p>{lead}</p>}
    </header>
  );
}

export function CTABand({ title, text, link, service }) {
  return (
    <div className="et-cta-band et-reveal">
      <div className="et-cta-band__text">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="et-cta-band__actions">
        {link && <TextLink to={link.to}>{link.label}</TextLink>}
        <PrimaryCTA service={service} />
      </div>
    </div>
  );
}

export function PageHead({ title, lead, children, assurance = false }) {
  return (
    <section className="page-head et-stage et-parallax-scene">
      <div className="et-dots" data-parallax="far" aria-hidden="true" />
      <div className="et-container">
        <div className="page-head__inner">
          <h1 className="display-xl et-fade-in">{title}</h1>
          {lead && <p className="body-lg et-fade-in" style={{ '--et-i': 1 }}>{lead}</p>}
          {children && <div className="page-head__actions et-fade-in" style={{ '--et-i': 2 }}>{children}</div>}
          {assurance && <div className="et-fade-in" style={{ '--et-i': 3 }}><Assurance /></div>}
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({ service, index = 0 }) {
  return (
    <div className="et-reveal" style={{ '--et-i': index % 4 }}>
      <article className="et-service et-service--media et-glass et-tilt">
        <div className="et-service__media">
          <img src={service.image} alt={service.imageAlt || ''} width="1200" height="750" loading="lazy" />
        </div>
        <div className="et-service__body">
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
          <Link className="et-btn et-btn--soft et-btn--sm" to={`/services#${service.slug}`} aria-label={`Learn more about ${service.title}`}>
            Learn more <ArrowRight />
          </Link>
        </div>
      </article>
    </div>
  );
}

export function ClientMarquee({ clients = CLIENTS }) {
  // Each half of the track must be wider than the viewport for a seamless loop.
  const half = Array.from({ length: 4 }, () => clients).flat();
  return (
    <>
      <ul className="sr-only">{clients.map((c) => <li key={c.name}>{c.name}</li>)}</ul>
      <div className="et-marquee et-reveal" aria-hidden="true">
        <div className="et-marquee__track et-marquee__track--tiles">
          {[...half, ...half].map((c, i) => (
            <div className="et-logo-tile et-glass client-tile" key={i}>
              <span className="client-tile__plate">
                <img src={c.logo} alt="" style={c.height ? { "--logo-h": `${c.height}px` } : undefined} loading="lazy" decoding="async" draggable="false" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function Testimonials({ items }) {
  return (
    <div className="et-testimonials">
      {items.map((t, i) => (
        <figure className="et-testimonial et-glass et-reveal" style={{ '--et-i': i }} key={t.name}>
          <blockquote>“{t.quote}”</blockquote>
          <figcaption>
            <span className="et-testimonial__name">{t.name}</span>
            <span className="et-testimonial__role">{t.role}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function FAQ({ items }) {
  return (
    <div className="et-faq et-reveal">
      {items.map((f, i) => (
        <details key={f.q} open={i === 0}>
          <summary>{f.q}</summary>
          <div>{f.a}</div>
        </details>
      ))}
    </div>
  );
}

export function Chips({ items }) {
  return <ul className="et-chips">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}

/** Chips as marquee rows scrolling in alternate directions. Screen readers (and reduced motion) get the plain list. */
export function ChipMarquee({ items, rows = 3 }) {
  const lines = Array.from({ length: rows }, (_, r) => {
    const shift = Math.round((r * items.length) / rows);
    return [...items.slice(shift), ...items.slice(0, shift)]; // same items, different starting point per row
  });
  return (
    <div className="chip-marquee">
      <ul className="et-chips chip-marquee__static">{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className="chip-marquee__rows" aria-hidden="true">
        {lines.map((line, r) => (
          <div className="et-marquee" key={r}>
            <ul className={`et-chips et-marquee__track chip-marquee__track${r % 2 ? ' chip-marquee__track--rev' : ''}`} style={{ '--chip-speed': `${34 + r * 6}s` }}>
              {[...line, ...line].map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Notice({ type, children }) {
  if (!children) return null;
  return (
    <div className={`notice notice--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {type === 'success' ? <Check /> : <AlertCircle />}
      <span>{children}</span>
    </div>
  );
}
