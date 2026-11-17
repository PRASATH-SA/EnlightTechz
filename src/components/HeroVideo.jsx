import { useEffect, useRef, useState } from 'react';
import { Assurance, PrimaryCTA, TextLink } from './ui';
import { Pause, Play } from './Icons';
import { HERO_STRIP } from '../data/site';

const POSTER = '/brand/video/hero-poster.jpg';

export default function HeroVideo() {
  const video = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 720px)').matches;
    if (reduce || small) { v.pause(); setPaused(true); return; }
    v.play().then(() => setPaused(false)).catch(() => setPaused(true));
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) { v.play().then(() => setPaused(false)).catch(() => {}); } else { v.pause(); setPaused(true); }
  };

  return (
    <section className={`et-hero-video et-hero-video--focus-right${paused ? ' is-paused' : ''}`} data-theme="dark"
      style={{ backgroundImage: `url('${POSTER}')` }} aria-labelledby="hero-title">
      <div className="et-hero-video__media" aria-hidden="true">
        <video ref={video} muted loop playsInline preload="metadata" poster={POSTER}>
          <source src="/brand/video/hero-loop.webm" type="video/webm" />
          <source src="/brand/video/hero-loop.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="et-hero-video__scrim" aria-hidden="true" />
      <div className="et-container et-hero-video__body">
        <div className="et-hero-video__content">
          <h1 id="hero-title" className="display-xl et-fade-in">Transform your digital presence with Enlight Techz</h1>
          <p className="body-lg et-fade-in" style={{ '--et-i': 1 }}>
            Mobile apps, websites, AI agents, AR/VR and 3D, designed and built by Qualified Engineers in Karaikal and Puducherry.
          </p>
          <div className="et-hero-video__actions et-fade-in" style={{ '--et-i': 2 }}>
            <PrimaryCTA size="lg" />
            <TextLink to="/portfolio">See our work</TextLink>
          </div>
          <div className="et-fade-in" style={{ '--et-i': 3 }}><Assurance /></div>
        </div>
      </div>
      <div className="et-container et-hero-video__foot">
        <ul className="et-hero-video__strip et-glass" aria-label="What we build">
          {HERO_STRIP.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <button className="et-video-toggle et-glass" type="button" onClick={toggle} aria-pressed={paused}
          aria-label={paused ? 'Play background video' : 'Pause background video'}>
          <Pause /><Play />
        </button>
      </div>
    </section>
  );
}
