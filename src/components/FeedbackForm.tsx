import { useState, type FormEvent } from 'react';
import { submitFeedback } from '../services/feedbackService';
import type { FeedbackFormData } from '../types/feedback';

const EMPTY: FeedbackFormData = { name: '', email: '', rating: 5, category: 'general', message: '' };

export function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const set = <K extends keyof FeedbackFormData>(key: K, value: FeedbackFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(await submitFeedback(form));
    setSending(false);
  };

  if (result?.success) {
    return (
      <div className="form">
        <h2>Thank you</h2>
        <p role="status">{result.message}</p>
        <p className="actions">
          <button type="button" className="btn btn-solid" onClick={onClose}>
            Close
          </button>
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>Share your feedback</h2>
      <label>
        Name
        <input required maxLength={100} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label>
        Email (optional)
        <input type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      <fieldset>
        <legend>Overall rating</legend>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className={star <= form.rating ? 'star on' : 'star'}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={form.rating === star}
                onChange={() => set('rating', star)}
                aria-label={`${star} out of 5`}
              />
              <span aria-hidden="true">★</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Category
        <select value={form.category} onChange={(e) => set('category', e.target.value as FeedbackFormData['category'])}>
          <option value="general">General</option>
          <option value="design">Design and visuals</option>
          <option value="content">Content and information</option>
          <option value="functionality">Functionality and features</option>
          <option value="performance">Performance and speed</option>
        </select>
      </label>
      <label>
        Message
        <textarea
          required
          rows={4}
          minLength={10}
          maxLength={1000}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
        />
      </label>
      {result && (
        <p className="form-error" role="alert">
          {result.message}
        </p>
      )}
      <p className="actions">
        <button type="submit" className="btn btn-solid" disabled={sending}>
          {sending ? 'Sending…' : 'Send feedback'}
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
      </p>
    </form>
  );
}
