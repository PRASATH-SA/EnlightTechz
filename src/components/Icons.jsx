// Line icons in the Lucide style: 24px grid, round caps and joins, currentColor.
const Line = ({ children, size = 18, stroke = 1.75, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
    {children}
  </svg>
);

export const ArrowRight = (p) => <Line {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Line>;
export const Check = (p) => <Line stroke={2.25} {...p}><path d="M20 6 9 17l-5-5" /></Line>;
export const AlertCircle = (p) => <Line {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Line>;
export const Menu = (p) => <Line {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Line>;
export const Close = (p) => <Line {...p}><path d="M6 6l12 12M18 6 6 18" /></Line>;
export const MapPin = (p) => <Line {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Line>;
export const Mail = (p) => <Line {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></Line>;
export const Clock = (p) => <Line {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Line>;
export const Chat = (p) => <Line {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></Line>;
export const Send = (p) => <Line {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></Line>;
export const Logout = (p) => <Line {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Line>;

export const Pause = () => (
  <svg className="et-ico-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
  </svg>
);
export const Play = () => (
  <svg className="et-ico-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 5v14l12-7z" />
  </svg>
);

// Solid social glyphs (footer). Greyscale via currentColor.
export const Instagram = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
  </svg>
);
export const Facebook = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <mask id="et-m-fb"><rect width="24" height="24" fill="#fff" /><path d="M13.6 23v-8.6h2.6l.4-3h-3V9.5c0-.9.3-1.5 1.5-1.5h1.6V5.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V23z" fill="#000" /></mask>
    <circle cx="12" cy="12" r="10.5" fill="currentColor" mask="url(#et-m-fb)" />
  </svg>
);
export const YouTube = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <mask id="et-m-yt"><rect width="24" height="24" fill="#fff" /><path d="M10 8.8v6.4l5.4-3.2z" fill="#000" /></mask>
    <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="currentColor" mask="url(#et-m-yt)" />
  </svg>
);
export const LinkedIn = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <mask id="et-m-li"><rect width="24" height="24" fill="#fff" /><rect x="6" y="9.8" width="2.7" height="8" fill="#000" /><circle cx="7.35" cy="6.9" r="1.55" fill="#000" /><path d="M10.6 9.8h2.6v1.2c.4-.7 1.3-1.4 2.7-1.4 2.4 0 3 1.6 3 3.7v4.5h-2.7v-4c0-1-.2-1.9-1.3-1.9s-1.6.9-1.6 1.9v4h-2.7z" fill="#000" /></mask>
    <rect x="2.5" y="2.5" width="19" height="19" rx="2.5" fill="currentColor" mask="url(#et-m-li)" />
  </svg>
);
