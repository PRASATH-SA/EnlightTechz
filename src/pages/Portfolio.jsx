import { CTABand, Chips, ClientMarquee, PageHead, PrimaryCTA, SectionHeader } from '../components/ui';
import { usePageTitle } from '../hooks/useApi';
import { INDUSTRIES, WORK } from '../data/site';

export default function Portfolio() {
  usePageTitle('Our work', 'Projects Enlight Techz has delivered for Chola Taxi, Favoflex and Ansha Accessories.');

  return (
    <>
      <PageHead title="Our work"
        lead="Websites, search visibility and digital products we have delivered, in our clients' own words.">
        <PrimaryCTA />
      </PageHead>

      <section className="et-section et-stage et-parallax-scene" aria-labelledby="work-title">
        <div className="et-dots" data-parallax="far" aria-hidden="true" />
        <div className="et-container">
          <h2 id="work-title" className="sr-only">Projects</h2>
          <div className="grid-3">
            {WORK.map((w, i) => (
              <div className="et-reveal" style={{ '--et-i': i }} key={w.client}>
                <article className="work-card et-glass et-tilt">
                  <div className="work-card__media"><img src={w.image} alt={w.imageAlt} loading="lazy" width="1200" height="750" /></div>
                  <div className="work-card__body">
                    <span className="fact">{w.client} · {w.service}</span>
                    <h3>{w.title}</h3>
                    <blockquote>“{w.testimonial.quote}”</blockquote>
                    <cite className="fact">{w.testimonial.name}, {w.testimonial.role}</cite>
                  </div>
                </article>
              </div>
            ))}
          </div>
          <p className="caption muted" style={{ marginTop: 'var(--space-6)' }}>
            Images are Enlight Techz service illustrations. Project screenshots are shared on request during a consultation.
          </p>
        </div>
      </section>

      <section className="et-section" data-theme="dark" aria-labelledby="clients-title">
        <div className="et-container">
          <SectionHeader id="clients-title" title="We've worked with" center />
        </div>
        <ClientMarquee />
      </section>

      <section className="et-section et-section--alt" aria-labelledby="industries-title">
        <div className="et-container">
          <SectionHeader id="industries-title" title="Industries we work with"
            lead="We build for businesses of every size across these sectors." />
          <div className="et-reveal"><Chips items={INDUSTRIES} /></div>
          <CTABand title="Have a project in mind?" text="Tell us about it. You will get a plan and a quote after a free, no-obligation consultation."
            link={{ to: '/services', label: 'Browse services' }} />
        </div>
      </section>
    </>
  );
}
