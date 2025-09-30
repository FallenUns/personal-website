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

    // Priority 1.5: Enhanced context-aware question analysis
    const contextualResult = this.analyzeQuestionContext(lowerInput);
    if (contextualResult) {
      return contextualResult;
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

    // Priority 8: Enhanced Navigation with Project-Specific Detection
    
    // FIRST: Check for specific project mentions (highest priority)
    const specificProjectPatterns = [
      /liquid\s*glass/i,
      /llm\s*privacy/i,
      /cliniwatch/i,
      /github\s*(projects?|repositories)/i,
      /portfolio\s*(projects?|items?)/i,
      /code\s*(samples?|examples?)/i,
      /(what|show|tell).*liquid\s*glass/i,
      /(what|show|tell).*(projects?|portfolio|built|created|developed|made)/i,
      /(show\s+me\s+your|what)\s+work(?!\s+(experience|history|background))/i, // "show me your work" but not "work experience"
      /what\s+work\s+have\s+you\s+done/i,
      /showcase/i,
      /demos?/i
    ];

    for (const pattern of specificProjectPatterns) {
      if (pattern.test(lowerInput)) {
        return { type: 'navigateToSection', value: 'projects' };
      }
    }

    // SECOND: Check for specific experience mentions
    const specificExperiencePatterns = [
      /(tell\s+me\s+about|about)\s+(your\s+)?(work\s+)?experience/i,
      /(your\s+)?(professional|work)\s+(background|experience|history)/i,
      /(where\s+(did|have)\s+you|patrick)\s+(work|worked)/i,
      /describe\s+your\s+work(?!\s+(on|with))/i, // "describe your work" but not "describe your work on projects"
      /apple\s+foundation/i,
      /urban\s+waste/i,
      /rmit/i,
      /(job|employment|position)s?\s+(history|experience)/i,
      /(companies|organizations)\s+(worked|you)/i,
      /internship/i,
      /hackathon/i,
      /career\s+(path|history|timeline)/i
    ];

    for (const pattern of specificExperiencePatterns) {
      if (pattern.test(lowerInput)) {
        return { type: 'navigateToSection', value: 'experience' };
      }
    }

    // THIRD: Refined keyword scoring with less overlap
    // Projects - More specific project-related terms
    const projectKeywords = [
      'portfolio', 'repositories', 'code samples', 'applications', 'apps',
      'what have you made', 'what did you build', 'show me what', 'things you',
      'patrick built', 'patrick created', 'patrick made', 'github projects'
    ];
    
    // Experience - Work history specific terms
    const experienceKeywords = [
      'professional', 'employment', 'positions', 'roles', 'timeline',
      'companies', 'organizations'
    ];
    
    // About - Personal information specific terms  
    const aboutKeywords = [
      'who', 'introduction', 'intro', 'overview', 'summary',
      'who are you', 'who is patrick', 'about patrick',
      'profile', 'bio', 'biography', 'yourself', 'describe',
      'download cv', 'download resume', 'get cv', 'get resume', 'curriculum',
      'resume', 'cv', 'skills', 'expertise',
      'meet patrick', 'get to know', 'introduce yourself'
    ];
    
    // Contact - Communication specific terms
    const contactKeywords = [
      'contact', 'contacts', 'email', 'reach', 'touch', 'connect', 'message',
      'get in touch', 'reach out', 'talk', 'speak', 'communicate', 'phone', 
      'linkedin', 'social', 'find you', 'how can i', 'how to reach', 
      'how to contact', 'get hold', 'available', 'freelance', 'contractor', 
      'opportunity', 'opportunities', 'patrick email', 'patrick contact',
      'let me know', 'send message', 'drop a line', 'write to'
    ];

    // Context-aware hiring keywords - only match when it's clearly about contacting
    const contactHiringKeywords = [
      'i want to hire', 'i would like to hire', 'i need to hire',
      'looking to hire', 'interested in hiring', 'want to work with',
      'would like to work with', "let's work together", 'collaborate with'
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

    // Enhanced scoring with refined keywords and less overlap
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
    
    // Enhanced contact scoring with context awareness
    contactKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) scores.contact++;
    });

    // Add context-aware hiring keywords with higher weight
    contactHiringKeywords.forEach(phrase => {
      if (lowerInput.includes(phrase)) scores.contact += 2; // Higher weight for clear contact intent
    });

    // Special handling for ambiguous terms
    // "about" context analysis
    if (lowerInput.includes('about')) {
      if (lowerInput.includes('tell me about you') || 
          lowerInput.includes('tell me about yourself') ||
          lowerInput.includes('about patrick')) {
        scores.about += 2; // Strong boost for personal questions
      } else if (lowerInput.includes('about your experience') || 
                 lowerInput.includes('about your work') ||
                 lowerInput.includes('about your professional')) {
        scores.experience += 2; // Route experience questions correctly
        scores.about -= 1; // Reduce about score for experience questions
      }
    }

    // "work" context analysis  
    if (lowerInput.includes('work')) {
      if (lowerInput.includes('work experience') || 
          lowerInput.includes('work history') ||
          lowerInput.includes('work background')) {
        scores.experience += 2;
      } else if (lowerInput.includes('work with') || 
                 lowerInput.includes('work together')) {
        scores.contact += 1;
      }
    }

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
      // Only include contact patterns for clear contact intent (not qualification questions)
      { pattern: /how\s+(do\s+i\s+|can\s+i\s+|to\s+)?(contact|reach|get\s+in\s+touch|email)/i, section: 'contact' },
      { pattern: /i\s+want\s+to\s+(contact|reach|hire|work\s+with)/i, section: 'contact' },
      { pattern: /i\s+(need|would\s+like)\s+to\s+(contact|reach|hire|work\s+with)/i, section: 'contact' }
    ];

    for (const { pattern, section } of questionPatterns) {
      if (pattern.test(lowerInput)) {
        return { type: 'navigateToSection', value: section };
      }
    }

    return null;
  }

  // Enhanced context-aware question analysis
  private analyzeQuestionContext(lowerInput: string): LLMCommand | null {
    // Questions ABOUT Patrick's qualifications/skills (should go to about/experience)
    const qualificationQuestions = [
      /why\s+(should\s+i\s+|would\s+i\s+|do\s+you\s+)?hire\s+(him|patrick|you)/i,
      /what\s+(makes\s+)?(him|patrick|you)\s+(good|qualified|suitable|worth)/i,
      /why\s+(is\s+)?(he|patrick|you)\s+(good|qualified|suitable|worth)/i,
      /should\s+i\s+hire\s+(him|patrick|you)/i,
      /is\s+(he|patrick|you)\s+(good|qualified|suitable|worth)/i,
      /what\s+(skills|experience|qualifications)\s+(does\s+(he|patrick|you)\s+have|do\s+you\s+have)/i,
      /what\s+(are\s+(his|patrick's|your)|his|patrick's|your)\s+(skills|qualifications|abilities|strengths)/i,
      /tell\s+me\s+about\s+(his|patrick's|your)\s+(skills|qualifications|background)/i,
      /what\s+(can|could)\s+(he|patrick|you)\s+(do|offer|bring)/i,
      /why\s+(choose|pick|select)\s+(him|patrick|you)/i,
      /is\s+(he|patrick|you)\s+good\s+(for|at)/i,
      /what\s+(can|could)\s+(patrick|he|you)\s+(do|offer|bring|provide)/i,
      /why\s+(choose|pick|select)\s+(him|patrick|you)(?!\s+a)/i // Avoid "why choose him a" constructions
    ];

    // Questions FOR hiring/contacting (should go to contact)
    const contactIntentQuestions = [
      /how\s+(do\s+i\s+|can\s+i\s+|to\s+)?hire\s+(him|patrick|you)/i,
      /where\s+(do\s+i\s+|can\s+i\s+|to\s+)?hire\s+(him|patrick|you)/i,
      /how\s+(do\s+i\s+|can\s+i\s+|to\s+)?(contact|reach|get\s+in\s+touch)/i,
      /i\s+want\s+to\s+hire\s+(him|patrick|you)/i,
      /i\s+would\s+like\s+to\s+hire\s+(him|patrick|you)/i,
      /i\s+need\s+to\s+(contact|reach|hire)\s+(him|patrick|you)/i,
      /let's\s+(work\s+together|collaborate)/i,
      /available\s+for\s+(work|hire|projects)/i,
      /how\s+much\s+(do\s+you\s+charge|does\s+(he|patrick)\s+charge)/i,
      /(what's|what\s+is)\s+(his|patrick's|your)\s+(rate|price|cost)/i,
      /i\s+need\s+to\s+hire\s+(someone|a\s+developer)/i
    ];

    // Check qualification questions first (these should NOT go to contact)
    for (const pattern of qualificationQuestions) {
      if (pattern.test(lowerInput)) {
        // Route to about for general qualifications or experience for work history
        if (lowerInput.includes('experience') || lowerInput.includes('worked') || lowerInput.includes('background')) {
          return { type: 'navigateToSection', value: 'experience' };
        }
        return { type: 'navigateToSection', value: 'about' };
      }
    }

    // Check contact intent questions (these should go to contact)
    for (const pattern of contactIntentQuestions) {
      if (pattern.test(lowerInput)) {
        return { type: 'navigateToSection', value: 'contact' };
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