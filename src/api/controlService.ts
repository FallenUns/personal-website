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

    // Priority 7: Feedback patterns - Let users know about feedback feature
    const feedbackKeywords = [
      'feedback', 'review', 'comment', 'suggest', 'suggestion',
      'improve', 'improvement', 'opinion', 'thoughts', 'rate',
      'rating', 'experience', 'what do you think', 'tell you',
      'share thoughts', 'give feedback', 'leave feedback'
    ];
    
    for (const keyword of feedbackKeywords) {
      if (lowerInput.includes(keyword)) {
        // Don't return a command, just let the AI know they mentioned feedback
        break;
      }
    }

    // Priority 8: ROBUST Navigation patterns - Very aggressive matching
    
    // Check for ANY mention of section keywords anywhere in the input
    // This is very broad and will catch almost any mention
    
    // Projects - catch ANY mention of project-related words
    const projectKeywords = [
      'project', 'projects', 'portfolio', 'work', 'built', 'created', 'developed',
      'applications', 'apps', 'showcase', 'demos', 'examples', 'liquid glass',
      'llm privacy', 'cliniwatch', 'github', 'repositories', 'code samples',
      'what have you made', 'what did you build', 'show me what', 'things you',
      'your work', 'patrick built', 'patrick created', 'patrick made'
    ];
    
    // Experience - catch ANY mention of experience-related words
    const experienceKeywords = [
      'experience', 'experiences', 'job', 'jobs', 'career', 'work history',
      'employment', 'positions', 'roles', 'worked', 'working', 'professional',
      'timeline', 'internship', 'hackathon', 'apple foundation', 'urban waste', 'rmit',
      'where did', 'where have', 'companies', 'organizations',
      'patrick worked', 'patrick experience', 'tell me about experience'
    ];
    
    // About - catch ANY mention of about-related words
    const aboutKeywords = [
      'about', 'who', 'introduction', 'intro', 'overview', 'summary',
      'tell me about you', 'who are you', 'who is patrick', 'about patrick',
      'background', 'profile', 'bio', 'biography', 'yourself', 'describe',
      'download cv', 'download resume', 'get cv', 'get resume', 'curriculum',
      'resume', 'cv', 'skills', 'expertise', 'history',
      'meet patrick', 'learn about', 'get to know', 'introduce yourself'
    ];
    
    // Contact - catch ANY mention of contact-related words
    const contactKeywords = [
      'contact', 'contacts', 'email', 'reach', 'touch', 'connect', 'message',
      'hire', 'hiring', 'work with', 'collaborate', 'get in touch', 'reach out',
      'talk', 'speak', 'communicate', 'phone', 'linkedin', 'social', 'find you',
      'how can i', 'how to reach', 'how to contact', 'get hold', 'available',
      'freelance', 'contractor', 'opportunity', 'opportunities', 'interested',
      'patrick email', 'patrick contact'
    ];

    // First check for direct navigation commands
    const directNavPatterns = [
      /^(go to|navigate to|show me|take me to|show|open|view|see|visit)\s+(projects?|about|experiences?|contacts?)$/i,
      /^(projects?|about|experiences?|contacts?)(\s+section)?$/i
    ];

    for (const pattern of directNavPatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        let section = match[2] || match[1];
        section = section.toLowerCase();
        if (section === 'projects' || section === 'project') {
          return { type: 'navigateToSection', value: 'projects' };
        } else if (section === 'experiences' || section === 'experience') {
          return { type: 'navigateToSection', value: 'experience' };
        } else if (section === 'contacts' || section === 'contact') {
          return { type: 'navigateToSection', value: 'contact' };
        } else if (section === 'about') {
          return { type: 'navigateToSection', value: 'about' };
        }
      }
    }

    // Now check for ANY keyword match with scoring system
    let scores = {
      projects: 0,
      experience: 0,
      about: 0,
      contact: 0
    };

    // Count keyword matches for each section
    projectKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) scores.projects++;
    });
    
    experienceKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) scores.experience++;
    });
    
    aboutKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) scores.about++;
    });
    
    contactKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) scores.contact++;
    });

    // Find the section with the highest score
    let maxScore = 0;
    let targetSection = null;
    
    for (const [section, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        targetSection = section;
      }
    }

    // If we found any matches, navigate to the highest scoring section
    if (targetSection && maxScore > 0) {
      return { type: 'navigateToSection', value: targetSection };
    }

    // Fallback: Check for question patterns that imply navigation
    const questionPatterns = [
      { pattern: /what.*(project|built|made|created|developed)/i, section: 'projects' },
      { pattern: /show.*(project|work|portfolio)/i, section: 'projects' },
      { pattern: /tell.*(project|work|built)/i, section: 'projects' },
      { pattern: /what.*(experience|worked|job)/i, section: 'experience' },
      { pattern: /where.*(work|worked|experience)/i, section: 'experience' },
      { pattern: /tell.*(experience|background|career)/i, section: 'experience' },
      { pattern: /who.*(patrick|you|is)/i, section: 'about' },
      { pattern: /tell.*(about|yourself|patrick)/i, section: 'about' },
      { pattern: /download.*(cv|resume)/i, section: 'about' },
      { pattern: /how.*(contact|reach|hire|email)/i, section: 'contact' },
      { pattern: /want.*(hire|contact|reach|work)/i, section: 'contact' },
      { pattern: /interested.*(working|hiring|contact)/i, section: 'contact' }
    ];

    for (const { pattern, section } of questionPatterns) {
      if (pattern.test(lowerInput)) {
        return { type: 'navigateToSection', value: section };
      }
    }

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