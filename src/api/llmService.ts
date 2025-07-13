import type { LLMMessage, LLMResponse, LLMConfig } from './types';

class LLMService {
  private config: LLMConfig;
  private systemPrompt: string;

  constructor() {
    this.config = {
      apiUrl: import.meta.env.VITE_LLM_API_URL || '',
      apiKey: import.meta.env.VITE_LLM_API_KEY || '',
      model: import.meta.env.VITE_LLM_MODEL || 'gpt-3.5-turbo',
      maxTokens: 500,
      temperature: 0.7
    };

    // System prompt to restrict responses to your website/project
    this.systemPrompt = `You are an AI assistant named Zora for a personal portfolio website. You can ONLY answer questions related to:

1. The website owner's skills, experience, and projects
2. Technical details about the website itself (built with React, TypeScript, Three.js, Framer Motion)
3. The website's features and functionality
4. Contact information or how to get in touch
5. General information about the portfolio or work displayed

You must REFUSE to answer questions about:
- General programming help unrelated to this website
- Personal advice
- Current events or news
- Other websites or projects not shown in this portfolio
- Anything not directly related to this personal website

If asked about something outside your scope, politely redirect the conversation back to the website and its contents. Always be helpful but stay focused on the website's purpose as a personal portfolio.

Current website features include:
- Interactive 3D animations and backgrounds
- Modern UI with liquid glass effects
- Responsive design
- Project showcase sections
- Contact functionality
- Smooth animations with Framer Motion`;
  }

  private validateConfig(): boolean {
    return !!(this.config.apiUrl && this.config.apiKey);
  }

  async sendMessage(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.validateConfig()) {
      return {
        success: false,
        error: 'API configuration is incomplete. Please check your environment variables.'
      };
    }

    try {
      // Add system prompt as the first message
      const messagesWithSystem: LLMMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...messages
      ];

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          // GitHub Models specific headers
          ...(this.config.apiUrl.includes('models.inference.ai.azure.com') && {
            'Extra-Parameters': 'pass-through'
          })
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messagesWithSystem,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          // GitHub Models compatibility
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different API response formats (OpenAI, Anthropic, etc.)
      let messageContent = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        // OpenAI format
        messageContent = data.choices[0].message.content;
      } else if (data.content && data.content[0] && data.content[0].text) {
        // Anthropic format
        messageContent = data.content[0].text;
      } else if (data.message) {
        // Generic format
        messageContent = data.message;
      } else {
        throw new Error('Unexpected API response format');
      }

      return {
        success: true,
        message: messageContent
      };

    } catch (error) {
      console.error('LLM API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Method to update system prompt if needed
  updateSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
  }
}

export const llmService = new LLMService();
export default LLMService;
