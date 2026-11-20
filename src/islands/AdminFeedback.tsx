import { useState, type FormEvent } from 'react';
import { clearFeedback, exportFeedbackCsv, listFeedback } from '../services/feedbackService';
import type { FeedbackData } from '../types/feedback';
import { mountIsland } from './mount';
import './forms.css';

/** The key is typed, held in this component's memory and never stored. */
function AdminFeedback() {
  const [key, setKey] = useState('');
  const [items, setItems] = useState<FeedbackData[] | null>(null);
  const [status, setStatus] = useState('');

  const load = async (e?: FormEvent) => {
    e?.preventDefault();
    setStatus('Loading…');
    const result = await listFeedback(key);
    if (result.ok) {
      setItems([...result.data].reverse());
      setStatus('');
    } else {
      setItems(null);
      setStatus(result.rejected ? 'Key rejected' : 'The server could not be reached.');
    }
  };

  const clear = async () => {
    if (!confirm('Delete all feedback on the server? This cannot be undone.')) return;
    if (await clearFeedback(key)) {
      setItems([]);
      setStatus('All feedback deleted.');
    } else setStatus('Delete failed.');
  };

  if (!items) {
    return (
      <form className="form" onSubmit={load}>
        <label>
          Admin key
          <input type="password" required autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        <p className="actions">
          <button type="submit" className="btn btn-solid">
            Show feedback
          </button>
        </p>
        <p role="status" className={status === 'Key rejected' ? 'form-error' : undefined}>
          {status}
        </p>
      </form>
    );
  }

  const average = items.length ? (items.reduce((sum, f) => sum + f.rating, 0) / items.length).toFixed(1) : '0';
  return (
    <div className="admin">
      <p>
        {items.length} {items.length === 1 ? "entry" : "entries"} · average rating {average} of 5
      </p>
      <p className="actions">
        <button type="button" className="btn" onClick={() => load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn"
          disabled={!items.length}
          onClick={async () => setStatus((await exportFeedbackCsv(key)) ? '' : 'Export failed.')}
        >
          Export CSV
        </button>
        <button type="button" className="btn" disabled={!items.length} onClick={clear}>
          Delete all
        </button>
      </p>
      <p role="status">{status}</p>
      <ul className="admin-list">
        {items.map((f) => (
          <li key={f.id}>
            <p className="eyebrow">
              {f.category} · {f.rating} of 5 · <time dateTime={f.timestamp}>{new Date(f.timestamp).toLocaleString()}</time>
            </p>
            <p>
              <strong>{decode(f.name)}</strong>
              {f.email && <> · {f.email}</>}
            </p>
            {/* The server stores text HTML-escaped; the browser decodes it here as text, never as markup. */}
            <p>{decode(f.message)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const decode = (s: string) => new DOMParser().parseFromString(s, 'text/html').documentElement.textContent ?? s;

export function mount(el: HTMLElement) {
  mountIsland(el, <AdminFeedback />);
}
