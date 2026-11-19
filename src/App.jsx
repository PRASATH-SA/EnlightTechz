import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import { useMotion } from './hooks/useMotion';
import { trackPageView } from './lib/analytics';

import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Legal from './pages/Legal';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  useMotion();
  const { pathname, search } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // Butter scroll on the public site; the admin dashboard keeps native scrolling for its tables.
  useEffect(() => {
    if (isAdmin) { stopSmoothScroll(); return undefined; }
    startSmoothScroll();
    return undefined;
  }, [isAdmin]);
  useEffect(() => () => stopSmoothScroll(), []);

  // GA4 page view per route. Runs after the page's own effects, so document.title is already set.
  useEffect(() => { trackPageView(pathname); }, [pathname, search]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<Careers />} />
          <Route path="/privacy-policy" element={<Legal page="privacy" />} />
          <Route path="/payment-policy" element={<Legal page="payment" />} />
          <Route path="/terms-and-conditions" element={<Legal page="terms" />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {!isAdmin && <Chatbot />}
    </>
  );
}
