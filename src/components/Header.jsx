import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo, PrimaryCTA } from './ui';
import { Menu, Close } from './Icons';
import { NAV } from '../data/site';

export default function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(pathname === '/' || pathname === '/contact');

  // When a page opens on a navy section (home video hero, contact), the navbar uses the dark theme until that section scrolls away.
  useEffect(() => {
    const check = () => {
      const hero = document.querySelector('main > [data-theme="dark"]:first-child');
      setOverHero(Boolean(hero) && hero.getBoundingClientRect().bottom > 80);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [pathname]);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header" data-theme={overHero && !open ? 'dark' : 'light'}>
      <nav className="et-nav et-glass" aria-label="Main">
        <Logo height={36} />
        <ul className="et-nav__links">
          {NAV.map((n) => (
            <li key={n.to}><NavLink to={n.to}>{n.label}</NavLink></li>
          ))}
        </ul>
        <div className="nav-actions">
          <PrimaryCTA size="sm" magnetic={false} arrow={false} />
          <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="nav-menu et-glass" id="mobile-menu" data-lenis-prevent>
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            {NAV.map((n) => <li key={n.to}><NavLink to={n.to}>{n.label}</NavLink></li>)}
          </ul>
          <PrimaryCTA magnetic={false} />
        </div>
      )}
    </header>
  );
}
