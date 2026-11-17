import { useEffect, useRef } from 'react';

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => 1 - (1 - t) ** 3;
// Scramble only with letters from the word itself (no other characters).
const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];

/**
 * Background wordmark driven by page scroll. The first word slides in from the right, the second from
 * the left; they cross and merge into place while the letters unscramble. Movement is eased toward the
 * scroll position every frame, so it stays smooth on any wheel or trackpad.
 * Decorative only (aria-hidden). Reduced-motion visitors see the finished word.
 */
export default function ScrambleWord({ word = 'ENLIGHT TECHZ' }) {
  const layerRef = useRef(null);
  const [first, ...rest] = word.split(' ');
  const second = rest.join(' ');

  useEffect(() => {
    const layer = layerRef.current;
    const row = layer?.querySelector('.scramble__word');
    if (!layer || !row) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      layer.classList.add('is-static');
      return undefined;
    }

    // dir +1 = enters from the right, -1 = from the left. lead = 0 for the letter at the leading edge.
    const letters = [...layer.querySelectorAll('.scramble__char')].map((el) => {
      const group = el.closest('.scramble__group');
      const dir = Number(group.dataset.dir);
      const chars = [...group.querySelectorAll('.scramble__char')];
      const idx = chars.indexOf(el);
      const lead = dir > 0 ? idx : chars.length - 1 - idx;
      return { el, dir, lead, count: chars.length };
    });

    const pool = [...new Set(word.replace(/\s/g, ''))];

    let shown = 0; // eased progress actually drawn
    let target = 0; // progress from the scroll position
    let frame = 0;
    let lastShuffle = 0;

    const readTarget = () => {
      const r = row.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the word's row enters at the bottom of the screen, 1 once it is ~45% up the screen.
      target = clamp((vh - r.top) / (vh * 0.55));
    };

    const draw = (now) => {
      frame = 0;
      readTarget(); // layout can shift (images, fonts) without a scroll event
      shown += (target - shown) * 0.12;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      const w = layer.clientWidth;
      const shuffle = now - lastShuffle > 70;
      if (shuffle) lastShuffle = now;

      for (const l of letters) {
        // Leading letters travel first; trailing ones follow, so each word stretches out and closes up.
        const lag = (l.lead / l.count) * 0.18;
        const t = clamp((shown - lag) / 0.82);
        const k = 1 - ease(t);
        const dx = l.dir * (w * 0.55 + l.lead * w * 0.045) * k;
        l.el.style.transform = `translate3d(${dx.toFixed(1)}px, 0, 0)`;
        l.el.style.opacity = (0.25 + 0.75 * clamp(t * 1.6)).toFixed(3);
        const set = t > 0.72; // eased position is ~98% home by now
        l.el.classList.toggle('is-set', set);
        if (set) { if (l.el.textContent !== l.el.dataset.char) l.el.textContent = l.el.dataset.char; }
        else if (shuffle) l.el.textContent = pick(pool);
      }
      if (shown !== target) frame = requestAnimationFrame(draw);
    };

    const kick = () => { readTarget(); if (!frame) frame = requestAnimationFrame(draw); };
    readTarget();
    shown = target;
    draw(performance.now());
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    const ro = new ResizeObserver(kick);
    ro.observe(layer);
    ro.observe(document.body); // content above can change height (images, fonts) and move the word
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
    };
  }, [word]);

  const group = (text, dir) => (
    <span className="scramble__group" data-dir={dir}>
      {[...text].map((c, i) => <span className="scramble__char" data-char={c} key={i}>{c}</span>)}
    </span>
  );

  return (
    <div className="scramble" ref={layerRef} aria-hidden="true">
      <div className="scramble__word">
        {group(first, 1)}
        {second && <span className="scramble__space" />}
        {second && group(second, -1)}
      </div>
    </div>
  );
}
