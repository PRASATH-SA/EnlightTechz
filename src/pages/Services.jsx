import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CTABand, PageHead, PrimaryCTA, SectionHeader, TextLink } from '../components/ui';
import { ArrowRight } from '../components/Icons';
import { useApiData, usePageTitle } from '../hooks/useApi';
import { DEFAULT_PACKAGES, DEFAULT_SERVICES } from '../data/site';
import { scrollToTarget } from '../lib/smoothScroll';

function Packages() {
  const packages = useApiData('/api/packages', DEFAULT_PACKAGES);
  const categories = useMemo(() => [...new Set(packages.map((p) => p.category))], [packages]);
  const [active, setActive] = useState(0);
  const current = categories[Math.min(active, categories.length - 1)];
  const list = packages.filter((p) => p.category === current);

  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + categories.length) % categories.length;
    setActive(next);
    document.getElementById(`pkg-tab-${next}`)?.focus();
  };

  return (
    <section className="et-section et-section--alt dots" id="packages" aria-labelledby="packages-title">
      <div className="et-container">
        <SectionHeader id="packages-title" title="Packages"
          lead="Starting points for the most common projects. Every package is quoted after a free consultation, so you only pay for what you need." />
        <div className="tabs" role="tablist" aria-label="Package type" onKeyDown={onKey}>
          {categories.map((c, i) => (
            <button key={c} id={`pkg-tab-${i}`} type="button" role="tab" aria-selected={c === current}
              aria-controls="pkg-panel" tabIndex={c === current ? 0 : -1} onClick={() => setActive(i)}>{c}</button>
          ))}
        </div>
        <div className="grid-3" id="pkg-panel" role="tabpanel" aria-labelledby={`pkg-tab-${active}`}>
          {list.map((p, i) => (
            <div className="et-reveal is-visible" style={{ '--et-i': i }} key={p._id || p.name}>
              <article className={`package et-glass et-glass-card et-tilt${p.isPremium ? ' package--premium' : ''}`}>
                <h3>{p.name}</h3>
                <p className="package__price">
                  {p.price || 'Custom quote'}
                  <small>{p.price ? 'Starting price' : 'Priced after a free consultation'}</small>
                </p>
                <ul className="ticks">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link className="et-btn et-btn--soft et-btn--sm" to={`/contact?service=${encodeURIComponent(`${p.category}: ${p.name}`)}#consultation`}>
                  Get a quote <ArrowRight />
                </Link>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({ s, ...props }) {
  return (
    <article {...props}>
      <div className="service-row__media"><img src={s.image} alt={s.imageAlt || ''} loading="lazy" width="1200" height="750" /></div>
      <div className="service-row__body">
        <h2>{s.title}</h2>
        <p>{s.description || s.summary}</p>
        {s.points?.length > 0 && <ul className="ticks">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>}
        <TextLink to={`/contact?service=${encodeURIComponent(s.title)}#consultation`}>Discuss {s.title.split(',')[0].toLowerCase()}</TextLink>
      </div>
    </article>
  );
}

// The pinned version needs room: a wide, reasonably tall screen and motion allowed.
const SPOT_QUERY = '(min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Services pinned in one spot: as you scroll, each one fades up into the place of the last. */
function ServiceDetails({ services }) {
  const spot = useMedia(SPOT_QUERY);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const n = services.length;

  useEffect(() => {
    if (!spot) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;
      const step = track.querySelector('.spot__anchor:nth-child(2)')?.offsetTop || window.innerHeight * 0.7;
      const progress = -track.getBoundingClientRect().top / step;
      setActive(Math.max(0, Math.min(n - 1, Math.round(progress))));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [spot, n]);

  if (!spot) {
    return (
      <div className="service-rows">
        {services.map((s) => <ServiceRow s={s} className="service-row et-reveal" id={s.slug} key={s.slug} style={{ scrollMarginTop: 120 }} />)}
      </div>
    );
  }

  const go = (i) => {
    const el = document.getElementById(services[i].slug);
    if (el) scrollToTarget(el);
  };

  return (
    <div className="spot" ref={trackRef} style={{ '--spot-n': n }}>
      {/* One invisible anchor per service along the scroll track, so /services#slug links still land on it. */}
      <div className="spot__anchors" aria-hidden="true">
        {services.map((s, i) => <span className="spot__anchor" id={s.slug} key={s.slug} style={{ '--i': i }} />)}
      </div>
      <div className="spot__stage">
        <div className="spot__bar">
          <span className="spot__count" aria-hidden="true">
            {String(active + 1).padStart(2, '0')} <span>/ {String(n).padStart(2, '0')}</span>
          </span>
          <ol className="spot__steps" aria-label="Services">
            {services.map((s, i) => (
              <li key={s.slug}>
                <button type="button" className={i <= active ? 'is-done' : ''} aria-current={i === active ? 'step' : undefined}
                  aria-label={s.title} title={s.title} onClick={() => go(i)} />
              </li>
            ))}
          </ol>
          <span className="spot__name" aria-live="polite">{services[active]?.title}</span>
        </div>
        <div className="spot__slides">
          {services.map((s, i) => (
            <ServiceRow s={s} key={s.slug} aria-hidden={i !== active} inert={i !== active}
              className={`service-row spot__slide ${i === active ? 'is-active' : i < active ? 'is-past' : 'is-next'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  usePageTitle('Services', 'Mobile apps, web development, SEO & AEO, AI agents, AR/VR, 3D modelling, digital marketing, enterprise software and custom CRM.');
  const services = useApiData('/api/services', DEFAULT_SERVICES);

  return (
    <>
      <PageHead title="Services we provide"
        lead="Mobile apps, websites, AI agents, AR/VR and 3D, plus the SEO and marketing that bring people to them. One team, from first call to launch and support."
        assurance>
        <PrimaryCTA />
        <TextLink href="#packages">See packages</TextLink>
      </PageHead>

      <section className="et-section section--spot" aria-label="Service details">
        <div className="et-container">
          <ServiceDetails services={services} />
          <CTABand title="Need more than one of these?"
            text="Most projects combine a few services. We plan them together so you deal with one team and one timeline."
            link={{ to: '/portfolio', label: 'See our work' }} />
        </div>
      </section>

      <Packages />
    </>
  );
}
