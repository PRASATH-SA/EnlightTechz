import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../lib/api';
import { ArrowRight, Logout } from '../components/Icons';
import { Notice } from '../components/ui';
import { usePageTitle } from '../hooks/useApi';

const STATUSES = ['Pending', 'In progress', 'Completed', 'Rejected'];
const TOKEN_KEY = 'et-admin-token';

const store = {
  get() { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } },
  set(v) { try { v ? sessionStorage.setItem(TOKEN_KEY, v) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ } }
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

function Login({ onToken }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await fetch(apiUrl('/api/admin/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) onToken(data.token);
      else setError(data.message || 'Sign-in failed.');
    } catch {
      setError('Could not reach the server.');
    } finally { setBusy(false); }
  };
  return (
    <section className="admin et-stage">
      <div className="et-container">
        <form className="admin-login et-glass" onSubmit={submit}>
          <h1>Admin sign-in</h1>
          <div className="et-field">
            <label htmlFor="admin-pw">Password</label>
            <input id="admin-pw" className="et-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" autoFocus />
          </div>
          <button className="et-btn et-btn--primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight /></button>
          <Notice type="error">{error}</Notice>
        </form>
      </div>
    </section>
  );
}

function StatusSelect({ value, onChange, label }) {
  return (
    <select className="et-input" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}

function SubmissionsTable({ rows, kind, onStatus, onDelete }) {
  if (!rows.length) return <div className="table-wrap"><p className="empty">Nothing here yet.</p></div>;
  const isCareer = kind === 'careers';
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th><th>Name</th><th>Contact</th><th>{isCareer ? 'Role' : 'Service'}</th><th>Message</th><th>Status</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
              <td><strong>{r.name}</strong></td>
              <td><a href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <><br /><span className="muted">{r.phone}</span></>}</td>
              <td>
                {isCareer ? <>{r.position}<br /><span className="fact muted">{r.type}</span></> : r.service || <span className="muted">Not specified</span>}
                {isCareer && r.portfolio && <><br /><a href={r.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></>}
              </td>
              <td className="msg">{r.message}</td>
              <td><StatusSelect value={r.status} onChange={(s) => onStatus(r._id, s)} label={`Status for ${r.name}`} /></td>
              <td><button className="btn-text btn-text--danger" type="button" onClick={() => onDelete(r._id, r.name)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SERVICE_FIELDS = [
  ['title', 'Title'], ['slug', 'Slug (used in links, e.g. mobile-apps)'], ['summary', 'Card summary'],
  ['description', 'Description', 'textarea'], ['points', 'Key points (one per line)', 'lines'],
  ['image', 'Image URL'], ['imageAlt', 'Image description'], ['order', 'Order', 'number']
];
const PACKAGE_FIELDS = [
  ['category', 'Category (e.g. Static website)'], ['name', 'Name'], ['price', 'Price (leave blank for "Custom quote")'],
  ['features', 'Features (one per line)', 'lines'], ['isPremium', 'Highlight as premium', 'checkbox'], ['order', 'Order', 'number']
];

function toForm(item, fields) {
  return Object.fromEntries(fields.map(([k, , t]) => {
    const v = item?.[k];
    if (t === 'lines') return [k, (v || []).join('\n')];
    if (t === 'checkbox') return [k, Boolean(v)];
    return [k, v ?? ''];
  }));
}
function fromForm(form, fields) {
  return Object.fromEntries(fields.map(([k, , t]) => {
    const v = form[k];
    if (t === 'lines') return [k, String(v).split('\n').map((s) => s.trim()).filter(Boolean)];
    if (t === 'number') return [k, Number(v) || 0];
    return [k, v];
  }));
}

function ContentEditor({ fields, item, onSave, onCancel }) {
  const [form, setForm] = useState(() => toForm(item, fields));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => { e.preventDefault(); setBusy(true); await onSave(fromForm(form, fields)); setBusy(false); };
  return (
    <form className="admin-editor form" onSubmit={submit}>
      <h3 className="full">{item?._id ? 'Edit' : 'Add new'}</h3>
      {fields.map(([k, label, t]) => (
        <div className={`et-field${t === 'textarea' || t === 'lines' ? ' full' : ''}`} key={k}>
          {t === 'checkbox' ? (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} /> {label}
            </label>
          ) : (
            <>
              <label htmlFor={`f-${k}`}>{label}</label>
              {t === 'textarea' || t === 'lines'
                ? <textarea id={`f-${k}`} className="et-input" rows={4} value={form[k]} onChange={(e) => set(k, e.target.value)} />
                : <input id={`f-${k}`} className="et-input" type={t === 'number' ? 'number' : 'text'} value={form[k]} onChange={(e) => set(k, e.target.value)}
                    required={['title', 'slug', 'category', 'name'].includes(k)} />}
            </>
          )}
        </div>
      ))}
      <div className="full row-actions">
        <button className="et-btn et-btn--primary et-btn--sm" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="et-btn et-btn--glass et-btn--sm" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ContentTable({ rows, columns, onEdit, onDelete }) {
  if (!rows.length) return <div className="table-wrap"><p className="empty">Nothing here yet. The site shows its default content until you add some.</p></div>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr>{columns.map(([, h]) => <th key={h}>{h}</th>)}<th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              {columns.map(([k, h, fmt]) => <td key={h}>{fmt ? fmt(r[k], r) : r[k]}</td>)}
              <td>
                <div className="row-actions">
                  <button className="btn-text" type="button" onClick={() => onEdit(r)}>Edit</button>
                  <button className="btn-text btn-text--danger" type="button" onClick={() => onDelete(r._id, r.title || r.name)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [['contacts', 'Enquiries'], ['careers', 'Applications'], ['services', 'Services'], ['packages', 'Packages']];

export default function Admin() {
  usePageTitle('Admin');
  const [token, setToken] = useState(store.get);
  const [tab, setTab] = useState('contacts');
  const [data, setData] = useState({ contacts: [], careers: [], services: [], packages: [] });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const logout = useCallback(() => { store.set(''); setToken(''); }, []);

  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(apiUrl(`/api/admin/${path}`), {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) { logout(); throw new Error('Your session expired. Please sign in again.'); }
    if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
    return json;
  }, [token, logout]);

  const load = useCallback(async () => {
    setError('');
    try {
      const [contacts, careers, services, packages] = await Promise.all(TABS.map(([k]) => api(k)));
      setData({ contacts, careers, services, packages });
    } catch (err) { setError(err.message); }
  }, [api]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const run = async (fn) => { setError(''); try { await fn(); await load(); } catch (err) { setError(err.message); } };
  const updateStatus = (kind) => (id, status) => run(() => api(`${kind}/${id}`, { method: 'PATCH', body: { status } }));
  const remove = (kind) => (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) run(() => api(`${kind}/${id}`, { method: 'DELETE' }));
  };
  const save = (kind) => (body) => run(async () => {
    await (editing?._id ? api(`${kind}/${editing._id}`, { method: 'PUT', body }) : api(kind, { method: 'POST', body }));
    setEditing(null);
  });

  if (!token) return <Login onToken={(t) => { store.set(t); setToken(t); }} />;

  const pending = (rows) => rows.filter((r) => r.status === 'Pending').length;

  return (
    <section className="admin et-section--alt">
      <div className="et-container">
        <div className="admin__bar">
          <h1>Dashboard</h1>
          <div className="row-actions">
            <button className="et-btn et-btn--glass et-btn--sm" type="button" onClick={load}>Refresh</button>
            <button className="et-btn et-btn--glass et-btn--sm" type="button" onClick={logout}><Logout /> Sign out</button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat"><strong>{pending(data.contacts)}</strong><span>New enquiries</span></div>
          <div className="admin-stat"><strong>{pending(data.careers)}</strong><span>New applications</span></div>
          <div className="admin-stat"><strong>{data.services.length}</strong><span>Services listed</span></div>
          <div className="admin-stat"><strong>{data.packages.length}</strong><span>Packages listed</span></div>
        </div>

        <div className="tabs" role="tablist" aria-label="Sections">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setEditing(null); }}>
              {label} ({data[k].length})
            </button>
          ))}
        </div>

        {error && <div style={{ marginBottom: 'var(--space-6)' }}><Notice type="error">{error}</Notice></div>}

        {(tab === 'contacts' || tab === 'careers') && (
          <SubmissionsTable rows={data[tab]} kind={tab} onStatus={updateStatus(tab)} onDelete={remove(tab)} />
        )}

        {(tab === 'services' || tab === 'packages') && (
          <>
            {editing ? (
              <ContentEditor key={editing._id || 'new'} item={editing} fields={tab === 'services' ? SERVICE_FIELDS : PACKAGE_FIELDS}
                onSave={save(tab)} onCancel={() => setEditing(null)} />
            ) : (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <button className="et-btn et-btn--primary et-btn--sm" type="button" onClick={() => setEditing({})}>
                  Add {tab === 'services' ? 'service' : 'package'}
                </button>
              </div>
            )}
            <ContentTable rows={data[tab]} onEdit={setEditing} onDelete={remove(tab)}
              columns={tab === 'services'
                ? [['order', 'Order'], ['title', 'Title'], ['slug', 'Slug'], ['summary', 'Summary']]
                : [['order', 'Order'], ['category', 'Category'], ['name', 'Name'], ['price', 'Price', (v) => v || 'Custom quote'],
                   ['features', 'Features', (v) => (v || []).join(', ')]]} />
          </>
        )}
      </div>
    </section>
  );
}
