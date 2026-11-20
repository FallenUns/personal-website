export interface FeedbackFormData {
  name: string;
  email: string;
  rating: number; // 1-5
  category: 'design' | 'content' | 'functionality' | 'performance' | 'general';
  message: string;
}

/** A stored entry as the server returns it. */
export interface FeedbackData extends FeedbackFormData {
  id: string;
  timestamp: string; // ISO date
}

export interface FeedbackSubmissionResponse {
  success: boolean;
  message: string;
}
