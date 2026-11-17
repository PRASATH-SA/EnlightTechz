import { PrimaryCTA, TextLink } from '../components/ui';
import { usePageTitle } from '../hooks/useApi';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <section className="et-section et-stage not-found">
      <div className="et-container">
        <div className="page-head__inner">
          <p className="fact muted">404</p>
          <h1 className="display">We could not find that page</h1>
          <p className="body-lg muted">The link may be old, or the page may have moved.</p>
          <div className="page-head__actions">
            <PrimaryCTA />
            <TextLink to="/">Go to the home page</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
