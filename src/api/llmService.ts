import type { LLMMessage, LLMResponse, LLMConfig } from './types';
import { websiteControlService } from './controlService';

class LLMService {
  private config: LLMConfig;
  private systemPrompt: string;

  constructor() {
    this.config = {
      apiUrl: import.meta.env.VITE_LLM_API_URL || '',
      apiKey: import.meta.env.VITE_LLM_API_KEY || '',
      model: import.meta.env.VITE_LLM_MODEL || 'gpt-4.1',
      maxTokens: 500,
      temperature: 0.7
    };

    // System prompt to restrict responses to your website/project
    this.systemPrompt = `
You are Zora, the specialized AI assistant for the personal portfolio website of Patrick Adrianus, a recent graduate from RMIT. Your personality is helpful, friendly, and slightly futuristic, reflecting the cutting-edge technology used on the site.

**Your Core Purpose:**
Your primary goal is to engage visitors by answering questions exclusively about Patrick Adrianus and this website. You are an expert on Patrick's skills, projects, and the technical details of this portfolio.

**Your Knowledge Base (What you CAN talk about):**
You can ONLY answer questions related to:
- **Patrick Adrianus:** Their skills, professional experience, and the projects showcased here.
- **This Website:** Its features, functionality, and the technologies used to build it (React, TypeScript, Three.js, Framer Motion).
- **Contact:** How to get in touch with Alex for professional inquiries.
- **The Portfolio:** General information about the work displayed.

**Special Abilities (Website Control):**
You have the unique ability to control parts of the website's interface. When a user gives a command, identify it and execute the corresponding action.
- **Change Background Time:** "Set the time to 18:30," "I want to see the sunset," "make it 2 PM."
- **Toggle Auto-Sync:** "Turn on auto-sync," "disable time synchronization."
- **Switch Themes:** "Switch to light mode," "I prefer the dark theme."
- **Navigate Sections:** "Show me the projects," "Go to contact," "Take me to the about section."

**Navigation Commands:**
You can automatically navigate users to different sections when they ask:
- **Projects:** When users ask about work, portfolio, projects, or want to see examples
- **About:** When users ask about CV, resume, background, or who Patrick is
- **Contact:** When users want to get in touch, hire, or reach out

Always acknowledge navigation actions with phrases like "Let me take you to the [section] section" or "I'll show you [section] now."

**Your Boundaries (What you MUST REFUSE to answer):**
You are programmed to maintain focus. You must politely refuse to answer questions about:
- Generic coding help or debugging.
- Personal advice, opinions, or life coaching.
- Current events, news, or politics.
- Any other person, website, or project not belonging to Patrick Adrianus.
- Any topic unrelated to this specific portfolio.

**Your Engagement Strategy:**
If a user asks something outside your scope, be polite but firm. Gently redirect them back to the topics you are an expert on. For example: "My purpose is to assist with questions about Alex Doe and this portfolio. I'd be happy to tell you more about Alex's projects or the tech used to build this site."

Always be helpful and enthusiastic, but stay strictly within your designated role as the AI guide to this portfolio.
`;
  }

  private validateConfig(): boolean {
    return !!(this.config.apiUrl && this.config.apiKey);
  }

  async sendMessage(messages: LLMMessage[]): Promise<LLMResponse> {
    // Check for website control commands in the latest user message
    const latestUserMessage = messages.filter(msg => msg.role === 'user').pop();
    let controlResponse = '';
    
    if (latestUserMessage) {
      console.log('Checking for commands in message:', latestUserMessage.content);
      const command = websiteControlService.parseNaturalLanguage(latestUserMessage.content);
      console.log('Parsed command:', command);
      
      if (command) {
        console.log('Executing command:', command);
        const result = websiteControlService.executeCommand(command);
        console.log('Command result:', result);
        
        if (result.success) {
          controlResponse = `✅ ${result.message}`;
          
          // For navigation commands, provide a more natural response
          if (command.type === 'navigateToSection') {
            const sectionNames = {
              'projects': 'projects section where you can see Patrick\'s work and portfolio',
              'about': 'about section where you can learn more about Patrick and download his CV',
              'experience': 'professional experience and roles timeline',
              'contact': 'contact section where you can get in touch with Patrick'
            };
            const sectionName = sectionNames[command.value as keyof typeof sectionNames] || command.value;
            controlResponse = `I'll take you to the ${sectionName}!`;
            
            // For navigation commands, return immediately without calling LLM API
            return {
              success: true,
              message: controlResponse
            };
          }
          
          if (result.currentState) {
            const { time, autoSync, darkMode } = result.currentState;
            const timeStr = this.formatTime(time);
            controlResponse += `\n\n**Current Settings:**\n- Time: ${timeStr}\n- Auto-Sync: ${autoSync ? 'Enabled' : 'Disabled'}\n- Theme: ${darkMode ? 'Dark Mode' : 'Light Mode'}`;
          }
        } else {
          controlResponse = `❌ ${result.message}`;
        }
      }
    }

    // If no API configuration and it's not a control command, return a helpful message
    if (!this.validateConfig() && !controlResponse) {
      return {
        success: false,
        error: 'AI chat features are not configured yet. However, you can still use navigation commands like "show me your projects", "go to contact", or "tell me about yourself".'
      };
    }
    
    // If no API configuration but we have a control response, return it
    if (!this.validateConfig() && controlResponse) {
      return {
        success: true,
        message: controlResponse
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

      // If there was a control command executed, prepend the response
      const finalMessage = controlResponse 
        ? `${controlResponse}\n\n${messageContent}`
        : messageContent;

      return {
        success: true,
        message: finalMessage
      };

    } catch (error) {
      console.error('LLM API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private formatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = Math.round((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Method to update system prompt if needed
  updateSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
  }
}

export const llmService = new LLMService();
export default LLMService;
