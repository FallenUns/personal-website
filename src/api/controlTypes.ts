// Interface for website controls that the LLM can manage
export interface WebsiteControls {
  // Background time control (0-23.99 hours)
  setTime: (time: number) => void;
  getTime: () => number;
  
  // Auto-sync control
  toggleAutoSync: () => void;
  setAutoSync: (enabled: boolean) => void;
  getAutoSync: () => boolean;
  
  // Dark mode control
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  getDarkMode: () => boolean;
}

// Available LLM commands for website control
export interface LLMCommand {
  type: 'setTime' | 'toggleAutoSync' | 'setAutoSync' | 'toggleDarkMode' | 'setDarkMode' | 'getStatus';
  value?: number | boolean;
}

// Response from LLM command execution
export interface LLMCommandResponse {
  success: boolean;
  message: string;
  currentState?: {
    time: number;
    autoSync: boolean;
    darkMode: boolean;
  };
}
