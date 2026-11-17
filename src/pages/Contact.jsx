import ContactForm from '../components/ContactForm';
import { FAQ, SectionHeader } from '../components/ui';
import { Clock, Mail, MapPin } from '../components/Icons';
import { usePageTitle } from '../hooks/useApi';
import { COMPANY, FAQS } from '../data/site';

export default function Contact() {
  usePageTitle('Contact', 'Book a free consultation with Enlight Techz. Email info@enlighttechz.in. Karaikal and Puducherry.');

  return (
    <>
      <section className="et-section et-stage page-contact" data-theme="dark" id="consultation" aria-labelledby="contact-title"
        style={{ paddingTop: 184 }}>
        <div className="et-container contact-grid">
          <div className="contact-info">
            <h1 id="contact-title" className="display-xl et-fade-in">Book a free consultation</h1>
            <p className="et-fade-in" style={{ '--et-i': 1 }}>
              Tell us what you want to build. We reply within one working day with next steps and, once we understand the scope, a detailed quote.
            </p>
            <ul className="facts et-fade-in" style={{ '--et-i': 2 }}>
              <li><Mail /><div><span className="fact">Email</span><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></div></li>
              <li><MapPin /><div><span className="fact">Location</span>{COMPANY.location}</div></li>
              <li><Clock /><div><span className="fact">Support</span>24/7 for live projects, by phone, email and remote assistance</div></li>
            </ul>
          </div>
          <div className="et-neon et-fade-in" style={{ '--et-i': 2 }}>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="et-section et-section--alt" aria-labelledby="faq-title">
        <div className="et-container grid-2">
          <SectionHeader id="faq-title" title="Before you get in touch" lead="Answers to the questions we hear most." />
          <FAQ items={FAQS} />
        </div>
      </section>
    </>
  );
}
