import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from './Icons';
import { Assurance, Notice } from './ui';
import { postJSON, useApiData } from '../hooks/useApi';
import { DEFAULT_SERVICES } from '../data/site';
import { track, trackFormResult } from '../lib/analytics';

const EMPTY = { name: '', email: '', phone: '', service: '', message: '' };

export default function ContactForm({ title = 'Tell us about your project' }) {
  const services = useApiData('/api/services', DEFAULT_SERVICES);
  const [params] = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ sending: false, ok: null, message: '' });

  useEffect(() => {
    const s = params.get('service');
    if (s) setForm((f) => ({ ...f, service: s.slice(0, 160) }));
  }, [params]);

  const options = services.map((s) => s.title);
  if (form.service && !options.includes(form.service)) options.unshift(form.service);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, ok: null, message: '' });
    const res = await postJSON('/api/contact', form);
    setState({ sending: false, ok: res.ok, message: res.message || (res.ok ? 'Thanks. We will reply within one working day.' : 'Something went wrong. Please try again.') });
    trackFormResult('contact', res.ok, { service: form.service || 'not_sure' });
    if (res.ok) {
      // GA4 recommended conversion event — mark generate_lead as a key event in GA.
      track('generate_lead', { form_name: 'contact', service: form.service || 'not_sure', has_phone: Boolean(form.phone) });
      setForm(EMPTY);
    }
  };

  return (
    <form className="form" data-track-form="contact" onSubmit={submit} noValidate={false} aria-describedby="contact-status">
      <h3 className="full">{title}</h3>
      <div className="et-field">
        <label htmlFor="c-name">Name</label>
        <input id="c-name" className="et-input" name="name" value={form.name} onChange={set} required maxLength={120} autoComplete="name" placeholder="Your name" />
      </div>
      <div className="et-field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" className="et-input" type="email" name="email" value={form.email} onChange={set} required maxLength={200} autoComplete="email" placeholder="you@company.com" />
      </div>
      <div className="et-field">
        <label htmlFor="c-phone">Phone <span className="req">(optional)</span></label>
        <input id="c-phone" className="et-input" type="tel" name="phone" value={form.phone} onChange={set} maxLength={40} autoComplete="tel" placeholder="+91" />
      </div>
      <div className="et-field">
        <label htmlFor="c-service">Service</label>
        <select id="c-service" className="et-input" name="service" value={form.service} onChange={set}>
          <option value="">Not sure yet</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="et-field full">
        <label htmlFor="c-message">Project</label>
        <textarea id="c-message" className="et-input" name="message" value={form.message} onChange={set} required maxLength={5000} rows={5}
          placeholder="What do you want to build, and who is it for?" />
        <span className="et-field__hint">Include your timeline and budget if you have them.</span>
      </div>
      <div className="form__submit full">
        <Assurance items={['Free consultation', 'No obligation']} />
        <button className="et-btn et-btn--primary et-btn--lg et-magnetic" type="submit" disabled={state.sending}>
          {state.sending ? 'Sending…' : 'Book my free consultation'} {!state.sending && <ArrowRight />}
        </button>
        <div id="contact-status" aria-live="polite">
          <Notice type={state.ok ? 'success' : 'error'}>{state.ok === null ? '' : state.message}</Notice>
        </div>
      </div>
    </form>
  );
}
