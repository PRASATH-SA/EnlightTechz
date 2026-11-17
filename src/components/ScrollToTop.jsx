import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HEADER_OFFSET, scrollToTarget } from '../lib/smoothScroll';

/** Jump to the top on page change, or glide to the #hash target once it has rendered. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { scrollToTarget(0, { immediate: true }); return undefined; }
    let tries = 0;
    let frame;
    const go = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) scrollToTarget(el, { offset: HEADER_OFFSET });
      else if (tries++ < 30) frame = requestAnimationFrame(go);
    };
    frame = requestAnimationFrame(go);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}
