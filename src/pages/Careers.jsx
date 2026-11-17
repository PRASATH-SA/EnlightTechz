import { useState } from 'react';
import { ArrowRight } from '../components/Icons';
import { Notice, PageHead, SectionHeader } from '../components/ui';
import { postJSON, usePageTitle } from '../hooks/useApi';
import { HEADER_OFFSET, scrollToTarget } from '../lib/smoothScroll';
import { COMPANY, JOBS } from '../data/site';

const OPEN_APPLICATION = 'Open application';
const EMPTY = { name: '', email: '', phone: '', position: JOBS[0]?.title || OPEN_APPLICATION, type: 'Job', portfolio: '', message: '' };

export default function Careers() {
  usePageTitle('Careers', 'Jobs and internships at Enlight Techz in Karaikal and Puducherry.');
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ sending: false, ok: null, message: '' });

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const apply = (position) => {
    setForm((f) => ({ ...f, position }));
    const target = document.getElementById('apply');
    if (target) scrollToTarget(target, { offset: HEADER_OFFSET });
    setTimeout(() => document.getElementById('a-name')?.focus({ preventScroll: true }), 900);
  };

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, ok: null, message: '' });
    const res = await postJSON('/api/career', form);
    setState({ sending: false, ok: res.ok, message: res.message || (res.ok ? 'Application received.' : 'Something went wrong. Please try again.') });
    if (res.ok) setForm(EMPTY);
  };

  return (
    <>
      <PageHead title="Work with us"
        lead="We build apps, websites and AI products for businesses from Karaikal and Puducherry. Apply for an open role or an internship below." />

      <section className="et-section" aria-labelledby="roles-title">
        <div className="et-container">
          <SectionHeader id="roles-title" title="Open roles" />
          <div className="jobs">
            {JOBS.map((j, i) => (
              <article className="job et-glass et-glass-card et-reveal" style={{ '--et-i': i }} key={j.title}>
                <div>
                  <h3>{j.title}</h3>
                  <span className="fact">{j.meta}</span>
                  <p>{j.text}</p>
                </div>
                <button className="et-btn et-btn--soft et-btn--sm" type="button" onClick={() => apply(j.title)} aria-label={`Apply for ${j.title}`}>
                  Apply now <ArrowRight />
                </button>
              </article>
            ))}
            <article className="job et-glass et-glass-card et-reveal" style={{ '--et-i': JOBS.length }}>
              <div>
                <h3>Internships and open applications</h3>
                <p>Students and early-career developers, designers and marketers are welcome to apply even when no role is listed.</p>
              </div>
              <button className="et-btn et-btn--soft et-btn--sm" type="button"
                onClick={() => { setForm((f) => ({ ...f, type: 'Internship' })); apply(OPEN_APPLICATION); }}>
                Apply now <ArrowRight />
              </button>
            </article>
          </div>
        </div>
      </section>

      <section className="et-section et-section--alt dots" id="apply" aria-labelledby="apply-title">
        <div className="et-container grid-2">
          <SectionHeader id="apply-title" title="Apply"
            lead={`Tell us about yourself and share a link to your work. Prefer email? Send your resume to ${COMPANY.email}.`} />
          <form className="form et-glass et-glass-card et-reveal" onSubmit={submit}>
            <div className="et-field">
              <label htmlFor="a-name">Name</label>
              <input id="a-name" className="et-input" name="name" value={form.name} onChange={set} required maxLength={120} autoComplete="name" />
            </div>
            <div className="et-field">
              <label htmlFor="a-email">Email</label>
              <input id="a-email" className="et-input" type="email" name="email" value={form.email} onChange={set} required maxLength={200} autoComplete="email" />
            </div>
            <div className="et-field">
              <label htmlFor="a-phone">Phone</label>
              <input id="a-phone" className="et-input" type="tel" name="phone" value={form.phone} onChange={set} maxLength={40} autoComplete="tel" />
            </div>
            <div className="et-field">
              <label htmlFor="a-type">Type</label>
              <select id="a-type" className="et-input" name="type" value={form.type} onChange={set}>
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="et-field full">
              <label htmlFor="a-position">Role</label>
              <select id="a-position" className="et-input" name="position" value={form.position} onChange={set}>
                {JOBS.map((j) => <option key={j.title} value={j.title}>{j.title}</option>)}
                <option value={OPEN_APPLICATION}>{OPEN_APPLICATION}</option>
              </select>
            </div>
            <div className="et-field full">
              <label htmlFor="a-portfolio">Portfolio, GitHub or resume link <span className="req">(optional)</span></label>
              <input id="a-portfolio" className="et-input" type="url" name="portfolio" value={form.portfolio} onChange={set} maxLength={500} placeholder="https://" />
            </div>
            <div className="et-field full">
              <label htmlFor="a-message">About you</label>
              <textarea id="a-message" className="et-input" name="message" value={form.message} onChange={set} maxLength={5000} rows={5}
                placeholder="Your experience, what you want to work on, and when you can start." />
            </div>
            <div className="form__submit full">
              <button className="et-btn et-btn--primary et-magnetic" type="submit" disabled={state.sending}>
                {state.sending ? 'Sending…' : 'Send application'} {!state.sending && <ArrowRight />}
              </button>
              <div aria-live="polite">
                <Notice type={state.ok ? 'success' : 'error'}>{state.ok === null ? '' : state.message}</Notice>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
