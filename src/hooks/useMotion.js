import { useEffect } from 'react';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tok(name, fallback) {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--${name}`));
  return Number.isNaN(v) ? fallback : v;
}

/**
 * Wires the design system's motion once for the whole app, so it also covers
 * content that renders later (route changes, API data):
 * - scroll reveal (.et-reveal -> .is-visible)
 * - tilt cards (.et-tilt), magnetic CTAs (.et-magnetic)
 * - scroll parallax ([data-parallax]) and pointer depth (.et-parallax-scene)
 * All of it is off under prefers-reduced-motion.
 */
export function useMotion() {
  useEffect(() => {
    // 1. Scroll reveal, watching for elements added after mount.
    const reveal = (el) => el.classList.add('is-visible');
    let io = null;
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.et-reveal').forEach(reveal);
    } else {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    const scan = (root) => {
      const els = root.querySelectorAll ? root.querySelectorAll('.et-reveal:not(.is-visible)') : [];
      els.forEach((el) => (io ? io.observe(el) : reveal(el)));
    };
    scan(document);
    const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.classList.contains('et-reveal')) (io ? io.observe(n) : reveal(n));
      scan(n);
    })));
    mo.observe(document.body, { childList: true, subtree: true });

    if (reduceMotion()) return () => { mo.disconnect(); io && io.disconnect(); };

    const tilt = tok('tilt-max', 6);
    const pull = tok('magnet-pull', 0.25);
    let tiltEl = null;
    let magEl = null;
    let sceneEl = null;
    const fine = window.matchMedia('(pointer: fine)').matches;

    const resetTilt = (el) => { el.style.setProperty('--et-rx', '0deg'); el.style.setProperty('--et-ry', '0deg'); };
    const resetMag = (el) => { el.style.setProperty('--et-bx', '0px'); el.style.setProperty('--et-by', '0px'); };
    const resetScene = (el) => { el.style.setProperty('--et-nx', 0); el.style.setProperty('--et-ny', 0); };

    const onMove = (e) => {
      if (!fine) return;
      const t = e.target instanceof Element ? e.target : null;

      const tEl = t && t.closest('.et-tilt');
      if (tiltEl && tiltEl !== tEl) resetTilt(tiltEl);
      tiltEl = tEl;
      if (tEl) {
        const r = tEl.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        tEl.style.setProperty('--et-ry', `${((x - 0.5) * 2 * tilt).toFixed(2)}deg`);
        tEl.style.setProperty('--et-rx', `${((0.5 - y) * 2 * tilt).toFixed(2)}deg`);
        tEl.style.setProperty('--et-mx', `${(x * 100).toFixed(1)}%`);
        tEl.style.setProperty('--et-my', `${(y * 100).toFixed(1)}%`);
      }

      const mEl = t && t.closest('.et-magnetic');
      if (magEl && magEl !== mEl) resetMag(magEl);
      magEl = mEl;
      if (mEl) {
        const r = mEl.getBoundingClientRect();
        mEl.style.setProperty('--et-bx', `${((e.clientX - r.left - r.width / 2) * pull).toFixed(1)}px`);
        mEl.style.setProperty('--et-by', `${((e.clientY - r.top - r.height / 2) * pull).toFixed(1)}px`);
      }

      const sEl = t && t.closest('.et-parallax-scene');
      if (sceneEl && sceneEl !== sEl) resetScene(sceneEl);
      sceneEl = sEl;
      if (sEl) {
        const r = sEl.getBoundingClientRect();
        sEl.style.setProperty('--et-nx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        sEl.style.setProperty('--et-ny', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      }
    };
    const onLeave = () => {
      if (tiltEl) resetTilt(tiltEl);
      if (magEl) resetMag(magEl);
      if (sceneEl) resetScene(sceneEl);
      tiltEl = magEl = sceneEl = null;
    };

    // Scroll parallax.
    const speeds = { far: tok('parallax-far', 0.35), mid: tok('parallax-mid', 0.18), near: tok('parallax-near', -0.12) };
    let ticking = false;
    const update = () => {
      const mid = window.innerHeight / 2;
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const v = el.dataset.parallax;
        const speed = Number.isNaN(parseFloat(v)) ? speeds[v] || 0 : parseFloat(v);
        const r = (el.closest('.et-parallax-scene') || el.parentElement).getBoundingClientRect();
        el.style.setProperty('--et-py', `${(-(r.top + r.height / 2 - mid) * speed).toFixed(1)}px`);
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      mo.disconnect();
      io && io.disconnect();
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
