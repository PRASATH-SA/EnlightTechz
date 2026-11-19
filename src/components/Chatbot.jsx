import { Fragment, useEffect, useRef, useState } from 'react';
import { apiUrl } from '../lib/api';
import { track } from '../lib/analytics';
import { Chat, Close, Send } from './Icons';

const GREETING = { role: 'bot', text: "Hello. I'm the Enlight Techz assistant. Ask me about our services, timelines or how to get started." };

function sessionId() {
  const make = () => `s_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
  try {
    let id = localStorage.getItem('et-chat-session');
    if (!id) { id = make(); localStorage.setItem('et-chat-session', id); }
    return id;
  } catch {
    return make();
  }
}

// Renders **bold** and line breaks as React nodes (no innerHTML).
function Rich({ text }) {
  return text.split('\n').map((line, i, all) => (
    <Fragment key={i}>
      {line.replace(/^\s*[*-]\s+/, '• ').split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}
      {i < all.length - 1 && '\n'}
    </Fragment>
  ));
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const log = useRef(null);
  const field = useRef(null);
  const launcher = useRef(null);
  const sid = useRef(null);

  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, busy]);
  useEffect(() => { if (open) field.current?.focus(); }, [open]);

  const close = () => {
    track('chat_close', { messages_sent: messages.filter((m) => m.role === 'user').length });
    setOpen(false);
    launcher.current?.focus();
  };
  const openChat = () => { track('chat_open', { page_path: window.location.pathname }); setOpen(true); };

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    if (!sid.current) sid.current = sessionId();
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    // Message count only — chat text is never sent to analytics.
    track('chat_message_sent', { message_number: messages.filter((m) => m.role === 'user').length + 1, page_path: window.location.pathname });
    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sid.current })
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) track('chat_error', { reason: 'api', status: res.status });
      setMessages((m) => [...m, { role: 'bot', text: data.success ? data.response : data.message || 'I could not answer that just now. Please try again.' }]);
    } catch {
      track('chat_error', { reason: 'network' });
      setMessages((m) => [...m, { role: 'bot', text: 'I could not reach the server. Please email info@enlighttechz.in.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <section className="chat-panel et-glass" data-theme="light" role="dialog" aria-label="Enlight Techz assistant"
          onKeyDown={(e) => e.key === 'Escape' && close()}>
          <div className="chat-panel__head">
            <div>
              <h2>Enlight Techz assistant</h2>
              <p>Answers about our services. For a quote, book a consultation.</p>
            </div>
            <button className="chat-close" type="button" onClick={close} aria-label="Close assistant"><Close /></button>
          </div>
          <div className="chat-log" ref={log} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role}`}><Rich text={m.text} /></div>
            ))}
            {busy && <div className="chat-msg chat-msg--bot chat-msg--typing">Typing…</div>}
          </div>
          <form className="chat-form" data-track-ignore onSubmit={send}>
            <label htmlFor="chat-input" className="sr-only">Your message</label>
            <input id="chat-input" ref={field} className="et-input" value={input} onChange={(e) => setInput(e.target.value)}
              maxLength={1000} placeholder="Ask about a service" autoComplete="off" />
            <button className="et-btn et-btn--primary" type="submit" disabled={busy || !input.trim()} aria-label="Send message"><Send /></button>
          </form>
        </section>
      )}
      <button ref={launcher} className="chat-launch" type="button" onClick={() => (open ? close() : openChat())}
        aria-expanded={open} aria-label={open ? 'Close assistant' : 'Ask the Enlight Techz assistant'}>
        {open ? <Close /> : <Chat />}
      </button>
    </>
  );
}
