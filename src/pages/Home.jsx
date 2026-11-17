import HeroVideo from '../components/HeroVideo';
import ContactForm from '../components/ContactForm';
import ScrambleWord from '../components/ScrambleWord';
import { CTABand, ChipMarquee, ClientMarquee, FAQ, SectionHeader, ServiceCard, Testimonials } from '../components/ui';
import { MapPin, Mail, Clock } from '../components/Icons';
import { useApiData, usePageTitle } from '../hooks/useApi';
import { COMPANY, DEFAULT_SERVICES, FAQS, INDUSTRIES, TESTIMONIALS } from '../data/site';

export default function Home() {
  usePageTitle(null, 'Enlight Techz builds mobile apps, websites, AI agents, AR/VR and 3D work, and runs SEO, AEO and digital marketing. Based in Karaikal and Puducherry.');
  const services = useApiData('/api/services', DEFAULT_SERVICES);

  return (
    <>
      <HeroVideo />

      {/* Services: white, dot grid for the glass cards */}
      <section className="et-section et-stage et-parallax-scene scramble-host" id="services" aria-labelledby="services-title">
        <div className="et-dots" data-parallax="far" aria-hidden="true" />
        <ScrambleWord />
        <div className="et-container">
          <SectionHeader id="services-title" title="Services we provide"
            lead="Mobile apps, websites, AI agents, AR/VR and 3D, designed and built by Qualified Engineers." />
          <div className="et-services">
            {services.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} />)}
          </div>
          <CTABand title="Not sure which service fits?"
            text="Tell us what you want to achieve. We will recommend the right mix in a free, no-obligation consultation."
            link={{ to: '/services', label: 'Compare services' }} />
        </div>
      </section>

      {/* Proof: navy */}
      <section className="et-section et-stage et-parallax-scene" data-theme="dark" id="clients" aria-labelledby="clients-title">
        <div className="et-container">
          <SectionHeader id="clients-title" title="We've worked with" center />
        </div>
        <ClientMarquee />
        <div className="et-container" style={{ marginTop: 'var(--space-16)' }}>
          <Testimonials items={TESTIMONIALS} />
          <CTABand title="Want results like these?" text="Start with a free consultation. You get a clear plan and a quote, with no obligation."
            link={{ to: '/portfolio', label: 'See our work' }} />
        </div>
      </section>

      {/* Buying questions: tinted */}
      <section className="et-section et-section--alt" id="faq" aria-labelledby="faq-title">
        <div className="et-container">
          <div className="grid-2">
            <div>
              <SectionHeader id="faq-title" title="Frequently asked questions"
                lead="Plain answers about services, timelines, support and pricing." />
              <div className="et-reveal">
                <h3 className="title" style={{ marginBottom: 'var(--space-4)' }}>Industries we work with</h3>
                <ChipMarquee items={INDUSTRIES} />
              </div>
            </div>
            <FAQ items={FAQS} />
          </div>
        </div>
      </section>

      {/* Contact: navy */}
      <section className="et-section et-stage" data-theme="dark" id="contact" aria-labelledby="contact-title">
        <div className="et-container contact-grid">
          <div className="contact-info et-reveal">
            <h2 id="contact-title">Book a free consultation</h2>
            <p>Tell us what you want to build. We reply within one working day with next steps.</p>
            <ul className="facts">
              <li><Mail /><div><span className="fact">Email</span><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></div></li>
              <li><MapPin /><div><span className="fact">Location</span>{COMPANY.location}</div></li>
              <li><Clock /><div><span className="fact">Support</span>24/7 for live projects</div></li>
            </ul>
          </div>
          <div className="et-neon et-reveal" style={{ '--et-i': 1 }}>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
