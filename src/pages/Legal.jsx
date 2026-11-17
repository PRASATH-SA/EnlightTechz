import { PageHead } from '../components/ui';
import { usePageTitle } from '../hooks/useApi';
import { COMPANY } from '../data/site';

const PAGES = {
  privacy: {
    title: 'Privacy policy',
    lead: 'How we collect, use and protect your information.',
    sections: [
      ['Data collection', 'We collect the information you give us directly: when you fill in the contact form, talk to the assistant on this site, or apply for a role.'],
      ['Use of information', 'We use your information to provide our services, prepare proposals, process payments, and talk to you about your projects and support requests.'],
      ['Data security', 'We use industry-standard security measures, including SSL encryption and secure hosting, to keep your personal information safe.'],
      ['Cookies', 'We may use cookies and browser storage to remember your preferences and improve navigation. The assistant stores a session ID in your browser so it can keep the conversation going.']
    ]
  },
  payment: {
    title: 'Payment policy',
    lead: 'Billing and payment information for Enlight Techz projects.',
    sections: [
      ['Pricing', 'Pricing is project-based or package-based, and is set out in full in each project proposal and agreement.'],
      ['Payment terms', 'We usually ask for a percentage of the project cost upfront. The balance is due at agreed milestones or on delivery.'],
      ['Refund policy', 'Refunds are handled case by case under the terms of each service agreement. Work completed up to the point of cancellation is billable.'],
      ['Secure payments', 'All payments go through authorised banking and digital payment gateways.']
    ]
  },
  terms: {
    title: 'Terms & conditions',
    lead: 'The terms for using this website.',
    sections: [
      ['Introduction', `By using this website you agree to these terms. ${COMPANY.name} is a business IT and AI solutions provider based in ${COMPANY.location}.`],
      ['Services', 'We provide mobile app development, web development, SEO, AI agent solutions and digital marketing. The scope, deliverables and timeline of each project are defined in its service contract.'],
      ['Intellectual property', `Unless stated otherwise, ${COMPANY.name} and its licensors own the intellectual property rights for all material on this website. All rights are reserved.`],
      ['User responsibilities', 'You must not use this website in any way that damages it, affects other people’s access to it, or transmits unauthorised material.']
    ]
  }
};

export default function Legal({ page }) {
  const { title, lead, sections } = PAGES[page];
  usePageTitle(title, lead);
  return (
    <>
      <PageHead title={title} lead={lead} />
      <section className="et-section">
        <div className="et-container">
          <div className="prose">
            {sections.map(([h, p]) => (
              <div key={h}><h2>{h}</h2><p>{p}</p></div>
            ))}
            <h2>Questions</h2>
            <p>Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we will answer.</p>
          </div>
        </div>
      </section>
    </>
  );
}
