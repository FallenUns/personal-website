import type { WebsiteControls, LLMCommand, LLMCommandResponse } from './controlTypes';

class WebsiteControlService {
  private controls: WebsiteControls | null = null;
  private maxNavigationAttempts = 3;

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
          
          if (!validSections.includes(sectionId)) {
            return {
              success: false,
              message: `Invalid section "${command.value}". Available sections: About, Projects, Experience, Contact.`
            };
          }
          
          // Use delayed navigation with retry logic
          this.executeNavigation(sectionId);
          
          return {
            success: true,
            message: `Navigating to ${this.formatSectionName(sectionId)} section.`,
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

  // Improved navigation with retry logic
  private executeNavigation(sectionId: string, attempt: number = 1): void {
    // Add a small delay to ensure DOM is ready and any animations have started
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      
      if (!element) {
        console.error(`Navigation failed: Element with id '${sectionId}' not found`);
        return;
      }

      // Store current position for verification
      const beforeScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      // Method 1: Try direct navigation if controls are available
      if (this.controls?.navigateToSection) {
        this.controls.navigateToSection(sectionId);
      }
      
      // Method 2: Also try direct scrollIntoView as backup
      setTimeout(() => {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
          // Calculate the target position accounting for any fixed headers
          const headerOffset = 80; // Adjust based on your header height
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          // Use window.scrollTo with smooth behavior
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Verify scroll worked after animation completes
          setTimeout(() => {
            const afterScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if (Math.abs(afterScroll - beforeScroll) < 10 && attempt < this.maxNavigationAttempts) {
              console.log(`Navigation attempt ${attempt} failed, retrying...`);
              this.executeNavigation(sectionId, attempt + 1);
            } else if (attempt >= this.maxNavigationAttempts) {
              console.error(`Navigation to ${sectionId} failed after ${attempt} attempts`);
              // Try one final forced scroll
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              console.log(`Successfully navigated to ${sectionId}`);
            }
          }, 500); // Wait for scroll animation
        }
      }, 100); // Small delay to ensure controls have processed
    }, attempt === 1 ? 200 : 500); // Longer delay on retries
  }

  // Parse natural language commands into structured commands
  parseNaturalLanguage(input: string): LLMCommand | null {
    const lowerInput = input.toLowerCase().trim();

    // Priority 1: Exact single-word navigation commands (highest priority)
    const exactMatches = {
      'projects': 'projects',
      'project': 'projects', 
      'about': 'about',
      'experience': 'experience',
      'experiences': 'experience',
      'contact': 'contact',
      'contacts': 'contact'
    };

    if (exactMatches[lowerInput as keyof typeof exactMatches]) {
      return { type: 'navigateToSection', value: exactMatches[lowerInput as keyof typeof exactMatches] };
    }

    // Priority 2: Time setting patterns - Enhanced to handle more formats
    const timePatterns = [
      // "set time to 14:30" or "set time to 14.5"
      /set time to (\d+)[:.](\d+)/,
      /set time to (\d+(?:\.\d+)?)/,
      // "change time to 14:30" 
      /change time to (\d+)[:.](\d+)/,
      /change time to (\d+(?:\.\d+)?)/,
      // "make it 14:30"
      /make it (\d+)[:.](\d+)/,
      /make it (\d+(?:\.\d+)?)/,
      // Direct time formats "14:30" or "14.5"
      /^(\d+)[:.](\d+)$/,
      /^(\d+(?:\.\d+)?)$/,
      // "time 14" or "time 14:30"
      /time (\d+)[:.](\d+)/,
      /time (\d+(?:\.\d+)?)/,
      // "14 o'clock"
      /(\d+(?:\.\d+)?) o'?clock/,
      /(\d+(?:\.\d+)?) hours?/
    ];

    for (const pattern of timePatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        let time: number;
        
        // Handle HH:MM format (two capture groups)
        if (match[2] !== undefined) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          time = hours + (minutes / 60);
        } else {
          // Handle decimal format (one capture group)
          time = parseFloat(match[1]);
        }
        
        if (time >= 0 && time <= 23.99) {
          return { type: 'setTime', value: time };
        }
      }
    }

    // Priority 3: Special time keywords
    const timeKeywords = {
      'sunrise': 6.0, 'morning': 6.0,
      'noon': 12.0, 'midday': 12.0,
      'sunset': 18.0, 'evening': 18.0,
      'midnight': 0.0, 'night': 0.0
    };

    for (const [keyword, time] of Object.entries(timeKeywords)) {
      if (lowerInput.includes(keyword)) {
        return { type: 'setTime', value: time };
      }
    }

    // Priority 4: Auto-sync patterns
    if (lowerInput.includes('toggle auto') || lowerInput.includes('switch auto') ||
        lowerInput.includes('auto sync toggle') || lowerInput.includes('toggle sync')) {
      return { type: 'toggleAutoSync' };
    }
    if (lowerInput.includes('enable auto') || lowerInput.includes('turn on auto') ||
        lowerInput.includes('auto sync on') || lowerInput.includes('start auto sync') ||
        lowerInput.includes('activate auto sync')) {
      return { type: 'setAutoSync', value: true };
    }
    if (lowerInput.includes('disable auto') || lowerInput.includes('turn off auto') ||
        lowerInput.includes('auto sync off') || lowerInput.includes('stop auto sync') ||
        lowerInput.includes('deactivate auto sync')) {
      return { type: 'setAutoSync', value: false };
    }

    // Priority 5: Dark mode patterns
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

    // Priority 6: Status patterns
    if (lowerInput.includes('status') || lowerInput.includes('current settings') || 
        lowerInput.includes('what time') || lowerInput.includes('current time')) {
      return { type: 'getStatus' };
    }

    // Priority 7: NAVIGATION COMMANDS (both explicit navigation and information requests)
    const navigationPatterns = [
      // Direct navigation commands
      /^(go to|navigate to|take me to|show me the|open the|visit the)\s+(projects?|about|experiences?|contacts?)\s*(section|page)?$/i,
      /^(show|open|visit)\s+(projects?|about|experiences?|contacts?)\s*(section|page)?$/i,
      
      // "Tell me more about [section]" patterns - specific to sections navigation
      /^tell me more about (the\s+)?(contact|contacting|reaching out)$/i,
      /^tell me more about (the\s+)?(projects?|portfolio|work)$/i,
      /^tell me more about (the\s+)?(experience|background|career|work history)$/i,
      /^tell me more about (the\s+)?(about|bio|profile)(?!\w)/i,


      // Contact intent (explicit hiring/contact requests)
      /^(how do i|how can i|how to)\s+(hire|contact|reach|get in touch|email)\s*(him|patrick|you)?$/i,
      /^i (want to|need to|would like to)\s+(hire|contact|reach|work with)\s*(him|patrick|you)$/i,
      /^(let's|lets)\s+(work together|collaborate)$/i,
      /^(are you|is patrick|is he)\s+available for\s+(work|hire|projects)$/i,
      
      // Project viewing and information requests
      /^(show me|let me see|i want to see)\s+(your|patrick's|his)?\s*(projects?|portfolio|work)$/i,
      /^(view|see)\s+(projects?|portfolio)$/i,
      /(tell me|explain|describe|what about|more about|details about|information about)\s+(your|patrick's|his)?\s*(projects?|portfolio|work)/i,
      /(tell me more about|more details about|elaborate on)\s+(the\s+)?(projects?|portfolio|work)/i,
      /what\s+(projects?|work)\s+(has he|did he|have you)\s+(done|worked on|built|created)/i,
      /can you (tell me about|show me)\s+(the\s+)?(projects?|portfolio|work)/i,
      
      // Experience viewing and information requests  
      /^(show me|let me see|i want to see)\s+(your|patrick's|his)?\s*(experience|background|work history|career)$/i,
      /^(view|see)\s+(experience|background|work history|career)$/i,
      /(tell me|explain|describe|what about|more about|details about|information about)\s+(your|patrick's|his)?\s*(experience|background|work history|career)/i,
      /(tell me more about|more details about|elaborate on)\s+(the\s+)?(experience|background|work history|career)/i,
      /what\s+(experience|background|work)\s+(does he|do you)\s+have/i,
      /can you (tell me about|show me)\s+(the\s+)?(experience|background|work history|career)/i,
      
      // About page requests and information
      /^(show me|let me see|i want to see)\s+(your|patrick's|his)?\s*(about|bio|profile|resume|cv)$/i,
      /^(download|get)\s+(resume|cv)$/i,
      /(tell me|explain|describe|what about|more about|details about|information about)\s+(patrick|him|you|yourself)/i,
      /(tell me more about|more details about|elaborate on)\s+(patrick|him|you|yourself)/i,
      /who (is|are)\s+(patrick|you)/i,
      /can you (tell me about|introduce)\s+(patrick|yourself)/i,
      
      // Contact information requests
      /(tell me|explain|describe|what about|more about|details about|information about)\s+(contact|contacting|reaching|hiring)/i,
      /(tell me more about|more details about|elaborate on)\s+(the\s+)?(contact|hiring)/i,
      /how can i\s+(contact|reach|hire)\s+(patrick|him|you)/i,
      /what's\s+(patrick's|his|your)\s+(email|contact)/i
    ];

    for (const pattern of navigationPatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        const fullMatch = match[0];
        
        // Determine target section based on keywords in the match
        if (/contact|contacting|reaching out/i.test(fullMatch)) {
          return { type: 'navigateToSection', value: 'contact' };
        } else if (/projects?|portfolio|work(?!\s+(history|experience))/i.test(fullMatch)) {
          return { type: 'navigateToSection', value: 'projects' };
        } else if (/experience|background|work history|career/i.test(fullMatch)) {
          return { type: 'navigateToSection', value: 'experience' };
        } else if (/about|bio|profile|resume|cv|patrick|who.*patrick|introduce.*patrick/i.test(fullMatch)) {
          return { type: 'navigateToSection', value: 'about' };
        } else if (/|hire|reach|email|work with|collaborate|available/i.test(fullMatch)) {
          return { type: 'navigateToSection', value: 'contact' };
        }
      }
    }

    // No navigation command found
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