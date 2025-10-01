// LLMService.ts
import type { LLMMessage, LLMResponse, LLMConfig } from './types';
import { websiteControlService } from './controlService';
import { knowledgeBaseService } from './knowledgeBase';

class LLMService {
  private config: LLMConfig;
  private systemPrompt: string;

  constructor() {
    this.config = {
      apiUrl: '/api/llm/chat', // Use backend endpoint instead of direct LLM API
      apiKey: '', // Not needed - backend handles authentication
      model: import.meta.env.VITE_LLM_MODEL || 'openai/gpt-4.1-mini',
      maxTokens: 300,
      temperature: 0.5
    };
    this.systemPrompt = `
You are Zora, Patrick Adrianus's portfolio AI assistant. Be helpful, friendly, and CONCISE.

**Core Purpose:** Answer questions about Patrick's experience, projects, and skills using the knowledge base.

**Topics:** Patrick's work (iOS hackathon, Apple Foundation Program, Urban Waste), projects (Liquid Glass, LLM Privacy Research), skills, website features, contact info.

**Controls:** Navigate sections, change time/theme, toggle auto-sync.

**Feedback:** Guide users to the blue feedback button (bottom-left) for rating/comments.

**Response Style:**
- Keep responses SHORT (1-3 sentences max)
- Be specific and enthusiastic
- Use occasional emojis
- For detailed requests, provide key points only
- Redirect off-topic questions to Patrick's experience
`;
  }

  private validateConfig(): boolean {
    return !!(this.config.apiUrl && this.config.model);
  }

  async sendMessage(messages: LLMMessage[]): Promise<LLMResponse> {
    // 1) Try website control first (your existing logic)
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    let controlResponse = '';

    if (latestUserMessage) {
      const command = websiteControlService.parseNaturalLanguage(latestUserMessage.content);
      
      if (command) {
        const result = websiteControlService.executeCommand(command);

        if (result.success) {
          // Special phrasing for navigation - make it dynamic based on user input
          if (command.type === 'navigateToSection') {
            const userInput = latestUserMessage.content.toLowerCase();
            const section = String(command.value);
            
            // Generate contextual response based on what the user actually said
            let response = '';
            
            // Check for specific phrases in user input to personalize the response
            if (userInput.includes('show') || userInput.includes('see') || userInput.includes('view')) {
              response = `Absolutely! Let me show you the ${section} section. `;
            } else if (userInput.includes('go') || userInput.includes('navigate') || userInput.includes('take me')) {
              response = `Taking you to the ${section} section right now! `;
            } else if (userInput.includes('tell me about') || userInput.includes('what about') || userInput.includes('learn about')) {
              response = `Great question! I'm taking you to the ${section} section where you can learn all about it. `;
            } else if (userInput.includes('interested') || userInput.includes('want to know') || userInput.includes('curious')) {
              response = `I can see you're interested in learning more! Let me take you to the ${section} section. `;
            } else if (userInput.includes('hire') || userInput.includes('contact') || userInput.includes('work with')) {
              response = `Looking to get in touch? Perfect! I'm taking you to the ${section} section. `;
            } else if (userInput.includes('download') || userInput.includes('cv') || userInput.includes('resume')) {
              response = `You can find Patrick's resume in the ${section} section! Taking you there now. `;
            } else if (userInput.includes('project') || userInput.includes('work') || userInput.includes('built')) {
              response = `Excited to see what Patrick has built? Great! I'm taking you to the ${section} section. `;
            } else if (userInput.includes('experience') || userInput.includes('background') || userInput.includes('career')) {
              response = `Want to learn about Patrick's professional journey? I'm taking you to the ${section} section. `;
            } else {
              // Generic fallback that still acknowledges their specific request
              response = `Perfect! I'll take you to the ${section} section. `;
            }
            
            // Add section-specific details
            const sectionDescriptions: Record<string, string> = {
              projects: "🚀 You'll find details about Patrick's Liquid Glass Design System, LLM Privacy Research, and other exciting projects!",
              about: "📄 Here you can learn more about Patrick's background, skills, and download his CV/Resume!",
              experience: "💼 You can explore Patrick's professional journey from the iOS hackathon to Apple Foundation Program and Urban Waste internship!",
              contact: "📬 Here you can find all the ways to get in touch with Patrick for collaboration or opportunities!"
            };
            
            const description = sectionDescriptions[section] || `Here you'll find everything about ${section}!`;
            return { success: true, message: response + description };
          }

          controlResponse = `✅ ${result.message}`;
          if (result.currentState) {
            const { time, autoSync, darkMode } = result.currentState;
            controlResponse += `\n\n**Current Settings:**\n- Time: ${this.formatTime(time)}\n- Auto-Sync: ${autoSync ? 'Enabled' : 'Disabled'}\n- Theme: ${darkMode ? 'Dark Mode' : 'Light Mode'}`;
          }
        } else {
          controlResponse = `❌ ${result.message}`;
        }
      }
      
      // Check if user is asking about feedback or wants to give feedback
      const userInput = latestUserMessage.content.toLowerCase();
      
      // More specific feedback detection patterns
      const feedbackPatterns = [
        /give\s+(you\s+)?feedback/i,
        /leave\s+(you\s+)?feedback/i,
        /share\s+(my\s+)?feedback/i,
        /provide\s+(some\s+)?feedback/i,
        /i\s+(want\s+to\s+|would\s+like\s+to\s+|need\s+to\s+)?(give|leave|share|provide)\s+(you\s+)?feedback/i,
        /feedback\s+(on|about)\s+(this|the)\s+(website|portfolio|site)/i,
        /i\s+(want\s+to\s+|would\s+like\s+to\s+)?(rate|review)\s+(this|the)\s+(website|portfolio|site)/i,
        /how\s+(can\s+i\s+|do\s+i\s+)?(give|leave|share)\s+(you\s+)?feedback/i,
        /where\s+(can\s+i\s+|do\s+i\s+)?(give|leave|share)\s+(you\s+)?feedback/i,
        /suggestions?\s+(for|about)\s+(this|the)\s+(website|portfolio|site)/i,
        /i\s+have\s+(some\s+)?(feedback|suggestions?|thoughts\s+about\s+the\s+site)/i,
        /can\s+i\s+(give|leave|share)\s+(you\s+)?feedback/i
      ];
      
      const isFeedbackRequest = feedbackPatterns.some(pattern => pattern.test(userInput));
      
      if (isFeedbackRequest && !command) {
        // User is interested in giving feedback but didn't trigger a navigation command
        return {
          success: true,
          message: `I'd love to hear your thoughts! 💭 You can share your feedback using the floating feedback button in the bottom-left corner of the page. It's the blue/purple button with a chat icon. \n\nYou can rate different aspects of the portfolio, choose a category (design, content, functionality, etc.), and leave detailed comments. Your feedback will be saved locally and helps make this portfolio even better! ✨`
        };
      }
    }

    if (!this.validateConfig()) {
      // Still return control feedback if we had it
      if (controlResponse) {
        return { success: true, message: controlResponse };
      }
      
      // Check if this was a navigation command that should have worked
      if (latestUserMessage) {
        const command = websiteControlService.parseNaturalLanguage(latestUserMessage.content);
        if (command && command.type === 'navigateToSection') {
          return {
            success: false,
            error: 'Navigation is not available yet. Please wait a moment for the page to fully load, then try again.'
          };
        }
      }
      
      return {
        success: false,
        error:
          'AI chat is not configured. You can still say things like "show projects", "go to contact", or "switch to dark mode".'
      };
    }

    try {
      // 2) Get relevant context based on user query - use full context for detailed requests
      let relevantContext = '';
      if (latestUserMessage) {
        const isDetailedRequest = this.isDetailedInformationRequest(latestUserMessage.content);
        relevantContext = isDetailedRequest 
          ? knowledgeBaseService.getFullContext()
          : knowledgeBaseService.getRelevantContext(latestUserMessage.content);
      } else {
        relevantContext = knowledgeBaseService.getBasicContext();
      }

      // 3) Build enhanced system prompt with context
      const enhancedSystemPrompt = `${this.systemPrompt}

**KNOWLEDGE BASE - Use this information to answer questions about Patrick:**

${relevantContext}

**Response Guidelines:**
- ALWAYS keep responses SHORT (2-4 sentences max)
- Focus on key highlights only
- Even for detailed requests, provide concise summaries with main points
- Be enthusiastic but brief
- Use bullet points for multiple items

Remember: Prioritize brevity while staying informative and engaging.`;

      const messagesWithSystem: LLMMessage[] = [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages
      ];

      // 4) Send to backend API (which handles LLM authentication)
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesWithSystem,
          model: this.config.model
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Backend API request failed ${response.status} ${response.statusText}: ${text}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Backend API error');
      }

      const data = result.data;

      // 5) Extract content from LLM response
      let messageContent = '';
      if (data?.choices?.[0]?.message?.content) {
        messageContent = data.choices[0].message.content;
      } else if (data?.content?.[0]?.text) {
        messageContent = data.content[0].text;
      } else if (typeof data?.message === 'string') {
        messageContent = data.message;
      } else {
        messageContent = JSON.stringify(data);
      }

      const finalMessage = controlResponse
        ? `${controlResponse}\n\n${messageContent}`
        : messageContent;

      return { success: true, message: finalMessage };
    } catch (error) {
      console.error('Backend API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private formatTime(time: number): string {
    const h = Math.floor(time);
    const m = Math.round((time % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private isDetailedInformationRequest(message: string): boolean {
    const detailedRequestPatterns = [
      /tell me more/i,
      /more information/i,
      /more details/i,
      /elaborate/i,
      /explain more/i,
      /go into detail/i,
      /comprehensive/i,
      /in depth/i,
      /detailed/i,
      /specifics/i,
      /everything about/i,
      /all about/i,
      /complete information/i,
      /full details/i,
      /can you expand/i,
      /expand on/i,
      /deeper dive/i,
      /more about/i
    ];

    return detailedRequestPatterns.some(pattern => pattern.test(message));
  }

  updateSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
  }
}

export const llmService = new LLMService();
export default LLMService;
