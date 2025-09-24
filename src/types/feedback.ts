export interface FeedbackData {
  id?: string;
  name: string;
  email: string;
  rating: number; // 1-5 stars
  category: 'design' | 'content' | 'functionality' | 'performance' | 'general';
  message: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

export interface FeedbackFormData {
  name: string;
  email: string;
  rating: number;
  category: FeedbackData['category'];
  message: string;
}

export interface FeedbackSubmissionResponse {
  success: boolean;
  message: string;
  id?: string;
}