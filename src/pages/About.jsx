import { Assurance, CTABand, Chips, PageHead, PrimaryCTA, SectionHeader, Testimonials, TextLink } from '../components/ui';
import { usePageTitle } from '../hooks/useApi';
import { COMPANY, INDUSTRIES, PROCESS, TESTIMONIALS } from '../data/site';

export default function About() {
  usePageTitle('About us', 'Enlight Techz is an IT company in Karaikal and Puducherry, building apps, websites, AI agents and more.');

  return (
    <>
      <PageHead title="About Enlight Techz"
        lead="We are an IT company in Karaikal and Puducherry. We build mobile apps, websites, AI agents, AR/VR and 3D work, and run SEO, AEO and digital marketing, so a business can bring its whole digital presence.">
        <PrimaryCTA />
        <TextLink to="/portfolio">See our work</TextLink>
      </PageHead>

      <section className="et-section" aria-labelledby="focus-title">
        <div className="et-container grid-2">
          <SectionHeader id="focus-title" title="What we focus on" />
          <div className="et-reveal" style={{ display: 'grid', gap: 'var(--space-6)' }}>
            <p className="body-lg">
              We care about quality, performance and a good experience for the people who use what we build, across web, mobile and AI.
            </p>
            <p className="muted">
              Design, development, search and marketing sit in the same team, so a website is built to rank, an app is built to be found,
              and a campaign has somewhere fast to send people. Pricing is shaped around your requirements, and every project starts with a free consultation.
            </p>
            <Assurance />
          </div>
        </div>
      </section>

      <section className="et-section et-section--alt" aria-labelledby="process-title">
        <div className="et-container">
          <SectionHeader id="process-title" title="How we work" lead="Three steps, so you always know what happens next." />
          <ol className="steps">
            {PROCESS.map((p, i) => (
              <li className="et-reveal" style={{ '--et-i': i }} key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="et-section et-stage" data-theme="dark" aria-labelledby="say-title">
        <div className="et-container">
          <SectionHeader id="say-title" title="What our clients say" />
          <Testimonials items={TESTIMONIALS} />
        </div>
      </section>

      <section className="et-section" aria-labelledby="where-title">
        <div className="et-container grid-2">
          <div className="et-reveal">
            <h2 id="where-title" className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Where we are</h2>
            <p className="fact muted">{COMPANY.location}</p>
            <p className="muted" style={{ marginTop: 'var(--space-4)' }}>
              Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> for business and project enquiries.
            </p>
          </div>
          <div className="et-reveal" style={{ '--et-i': 1 }}>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Who we work with</h2>
            <Chips items={INDUSTRIES} />
          </div>
        </div>
        <div className="et-container">
          <CTABand title="Ready to talk?" text="A free consultation is the first step. No obligation, and you leave with a clear plan."
            link={{ to: '/career', label: 'Join the team' }} />
        </div>
      </section>
    </>
  );
}
