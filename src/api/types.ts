// API types for LLM integration
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}
