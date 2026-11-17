import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Space left above anchor targets for the fixed navbar.
export const HEADER_OFFSET = -104;

let lenis = null;

/** Start momentum ("butter") scrolling. Skipped for visitors who prefer reduced motion. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return lenis;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.09, // lower = smoother, longer glide
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false, // keep native momentum on phones
    anchors: { offset: HEADER_OFFSET },
    // Inner scroll areas (chat log, menus, wide tables) scroll natively.
    prevent: (node) => Boolean(node.closest?.('[data-lenis-prevent], .chat-log, .table-wrap, select, textarea'))
  });
  return lenis;
}

export function stopSmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

/** Scroll to a position or element, gliding when smooth scrolling is on. */
export function scrollToTarget(target, { immediate = false, offset = 0 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset, force: true });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
  }
}
