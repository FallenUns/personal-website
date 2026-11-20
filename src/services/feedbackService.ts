import type { FeedbackData, FeedbackFormData, FeedbackSubmissionResponse } from '../types/feedback';

const API = '/api/feedback';
const admin = (key: string) => ({ 'x-admin-api-key': key });

/** Sends feedback. Nothing is kept in the browser: a failure is reported, not hidden. */
export async function submitFeedback(form: FeedbackFormData): Promise<FeedbackSubmissionResponse> {
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.email ? form : { ...form, email: undefined }),
    });
    const body = await response.json().catch(() => null);
    if (response.ok && body?.success) return { success: true, message: body.message };
    return { success: false, message: body?.message ?? 'Your feedback could not be sent. Please try again later.' };
  } catch {
    return { success: false, message: 'The server could not be reached. Your feedback was not sent.' };
  }
}

export type AdminResult<T> = { ok: true; data: T } | { ok: false; rejected: boolean };

/** `rejected` is true when the server refused the key (401). */
async function adminFetch(key: string, path = '', init: RequestInit = {}): Promise<AdminResult<Response>> {
  try {
    const response = await fetch(API + path, { ...init, headers: { ...init.headers, ...admin(key) } });
    return response.ok ? { ok: true, data: response } : { ok: false, rejected: response.status === 401 };
  } catch {
    return { ok: false, rejected: false };
  }
}

export async function listFeedback(key: string): Promise<AdminResult<FeedbackData[]>> {
  const result = await adminFetch(key);
  if (!result.ok) return result;
  const body = await result.data.json().catch(() => null);
  return Array.isArray(body?.data) ? { ok: true, data: body.data } : { ok: false, rejected: false };
}

/** Downloads the server's CSV. A 404 from the server means there is nothing to export. */
export async function exportFeedbackCsv(key: string): Promise<boolean> {
  const result = await adminFetch(key, '/export-csv');
  if (!result.ok) return false;
  const url = URL.createObjectURL(await result.data.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = result.data.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'feedback.csv';
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function clearFeedback(key: string): Promise<boolean> {
  const result = await adminFetch(key, '', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: 'DELETE_ALL_FEEDBACK' }),
  });
  return result.ok;
}
