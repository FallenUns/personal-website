import type { WebsiteControls, LLMCommand, LLMCommandResponse } from './controlTypes';

class WebsiteControlService {
  private controls: WebsiteControls | null = null;

  // Set the website controls from the main app
  setControls(controls: WebsiteControls): void {
    this.controls = controls;
  }

  // Register the controls interface from the main app
  registerControls(controls: WebsiteControls): void {
    this.controls = controls;
  }

  // Execute a command from the LLM
  executeCommand(command: LLMCommand): LLMCommandResponse {
    if (!this.controls) {
      return {
        success: false,
        message: 'Website controls are not available. Please try again in a moment.'
      };
    }

    try {
      switch (command.type) {
        case 'setTime':
          if (typeof command.value !== 'number' || command.value < 0 || command.value > 23.99) {
            return {
              success: false,
              message: 'Invalid time value. Please provide a time between 0 and 23.99 hours.'
            };
          }
          this.controls.setTime(command.value);
          return {
            success: true,
            message: `Time set to ${this.formatTime(command.value)}.`,
            currentState: this.getCurrentState()
          };

        case 'toggleAutoSync':
          this.controls.toggleAutoSync();
          const autoSyncStatus = this.controls.getAutoSync();
          return {
            success: true,
            message: `Auto-sync ${autoSyncStatus ? 'enabled' : 'disabled'}.`,
            currentState: this.getCurrentState()
          };

        case 'setAutoSync':
          if (typeof command.value !== 'boolean') {
            return {
              success: false,
              message: 'Invalid auto-sync value. Please provide true or false.'
            };
          }
          this.controls.setAutoSync(command.value);
          return {
            success: true,
            message: `Auto-sync ${command.value ? 'enabled' : 'disabled'}.`,
            currentState: this.getCurrentState()
          };

        case 'toggleDarkMode':
          this.controls.toggleDarkMode();
          const darkModeStatus = this.controls.getDarkMode();
          return {
            success: true,
            message: `${darkModeStatus ? 'Dark' : 'Light'} mode activated.`,
            currentState: this.getCurrentState()
          };

        case 'setDarkMode':
          if (typeof command.value !== 'boolean') {
            return {
              success: false,
              message: 'Invalid dark mode value. Please provide true or false.'
            };
          }
          this.controls.setDarkMode(command.value);
          return {
            success: true,
            message: `${command.value ? 'Dark' : 'Light'} mode activated.`,
            currentState: this.getCurrentState()
          };

        case 'getStatus':
          return {
            success: true,
            message: 'Current website settings:',
            currentState: this.getCurrentState()
          };

        case 'navigateToSection':
          if (typeof command.value !== 'string') {
            return {
              success: false,
              message: 'Invalid section name. Please provide a valid section.'
            };
          }
          
          const validSections = ['about', 'projects', 'experience', 'contact'];
          const sectionId = command.value.toLowerCase();
          
          console.log('Navigation command - section:', sectionId);
          
          if (!validSections.includes(sectionId)) {
            return {
              success: false,
              message: `Invalid section "${command.value}". Available sections: About, Projects, Experience, Contact.`
            };
          }
          
          console.log('Executing navigation to:', sectionId);
          this.controls.navigateToSection(sectionId);
          console.log('Navigation executed successfully');
          
          return {
            success: true,
            message: `Navigated to ${this.formatSectionName(sectionId)} section.`,
            currentState: this.getCurrentState()
          };

        default:
          return {
            success: false,
            message: 'Unknown command. Available commands: setTime, toggleAutoSync, toggleDarkMode, navigateToSection, getStatus.'
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Parse natural language commands into structured commands
  parseNaturalLanguage(input: string): LLMCommand | null {
    const lowerInput = input.toLowerCase();
    console.log('Parsing input for commands:', lowerInput);

    // Time setting patterns
    const timePatterns = [
      /set time to (\d+(?:\.\d+)?)/,
      /change time to (\d+(?:\.\d+)?)/,
      /time (\d+(?:\.\d+)?)/,
      /(\d+(?:\.\d+)?) o'?clock/,
      /(\d+(?:\.\d+)?) hours?/
    ];

    for (const pattern of timePatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        const time = parseFloat(match[1]);
        if (time >= 0 && time <= 23.99) {
          return { type: 'setTime', value: time };
        }
      }
    }

    // Auto-sync patterns
    if (lowerInput.includes('toggle auto') || lowerInput.includes('switch auto')) {
      return { type: 'toggleAutoSync' };
    }
    if (lowerInput.includes('enable auto') || lowerInput.includes('turn on auto')) {
      return { type: 'setAutoSync', value: true };
    }
    if (lowerInput.includes('disable auto') || lowerInput.includes('turn off auto')) {
      return { type: 'setAutoSync', value: false };
    }

    // Dark mode patterns
    if (lowerInput.includes('toggle dark') || lowerInput.includes('switch mode') || 
        lowerInput.includes('toggle light') || lowerInput.includes('change theme')) {
      return { type: 'toggleDarkMode' };
    }
    if (lowerInput.includes('dark mode') || lowerInput.includes('enable dark') || 
        lowerInput.includes('turn on dark')) {
      return { type: 'setDarkMode', value: true };
    }
    if (lowerInput.includes('light mode') || lowerInput.includes('enable light') || 
        lowerInput.includes('turn on light')) {
      return { type: 'setDarkMode', value: false };
    }

    // Status patterns
    if (lowerInput.includes('status') || lowerInput.includes('current settings') || 
        lowerInput.includes('what time') || lowerInput.includes('current time')) {
      return { type: 'getStatus' };
    }

    // Navigation patterns
    // Projects section patterns
    if ((lowerInput.includes('show') && (lowerInput.includes('project') || lowerInput.includes('work'))) ||
        lowerInput.includes('go to project') || lowerInput.includes('navigate to project') ||
        lowerInput.includes('view project') || lowerInput.includes('see project') ||
        lowerInput.includes('projects section') || lowerInput.includes('my work') ||
        lowerInput.includes('portfolio') || lowerInput.includes('what projects') ||
        lowerInput.includes('show me your work') || lowerInput.includes('examples of work') ||
        lowerInput.includes('what have you built') || lowerInput.includes('see your projects')) {
      console.log('🎯 Detected projects navigation command');
      return { type: 'navigateToSection', value: 'projects' };
    }
    
    // Experience section patterns
    if (lowerInput.includes('experience section') || lowerInput.includes('go to experience') || lowerInput.includes('navigate to experience') ||
        (lowerInput.includes('show') && lowerInput.includes('experience')) ||
        lowerInput.startsWith('experience')) {
      console.log('🎯 Detected experience navigation command');
      return { type: 'navigateToSection', value: 'experience' };
    }

    // About section patterns
    if ((lowerInput.includes('show') && (lowerInput.includes('cv') || lowerInput.includes('resume'))) ||
        lowerInput.includes('go to about') || lowerInput.includes('navigate to about') ||
        lowerInput.includes('about section') || lowerInput.includes('about me') ||
        lowerInput.includes('who are you') || lowerInput.includes('tell me about') ||
        lowerInput.includes('background') ||
        lowerInput.includes('skills') || lowerInput.includes('download cv') ||
        lowerInput.includes('download resume') || lowerInput.includes('learn more about')) {
      console.log('🎯 Detected about navigation command');
      return { type: 'navigateToSection', value: 'about' };
    }
    
    // Contact section patterns
    if (lowerInput.includes('contact') || lowerInput.includes('reach out') ||
        lowerInput.includes('get in touch') || lowerInput.includes('email') ||
        lowerInput.includes('message') || lowerInput.includes('hire') ||
        lowerInput.includes('work together') || lowerInput.includes('contact section') ||
        lowerInput.includes('how to contact') || lowerInput.includes('talk to you') ||
        lowerInput.includes('send message') || lowerInput.includes('collaboration') ||
        lowerInput.includes('linkedin') || lowerInput.includes('connect with')) {
      console.log('🎯 Detected contact navigation command');
      return { type: 'navigateToSection', value: 'contact' };
    }

    console.log('❌ No navigation command detected');
    return null;
  }

  private getCurrentState() {
    if (!this.controls) return undefined;
    
    return {
      time: this.controls.getTime(),
      autoSync: this.controls.getAutoSync(),
      darkMode: this.controls.getDarkMode()
    };
  }

  private formatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = Math.round((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private formatSectionName(sectionId: string): string {
    const sectionNames: { [key: string]: string } = {
      'about': 'About',
      'projects': 'Projects',
      'experience': 'Experience',
      'contact': 'Contact'
    };
    return sectionNames[sectionId] || sectionId;
  }

  // Check if a message contains a control command
  containsCommand(message: string): boolean {
    return this.parseNaturalLanguage(message) !== null;
  }
}

export const websiteControlService = new WebsiteControlService();
export default WebsiteControlService;
