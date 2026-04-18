// Knowledge Base Service for AI Assistant
import { experiences, type Experience, formatPeriod } from '../data/experiences';
import { projects, type Project } from '../data/projects';

export class KnowledgeBaseService {
  // Convert experiences to AI-friendly context
  formatExperiencesContext(): string {
    let context = "**Patrick's Professional Experience:**\n\n";
    
    experiences.forEach((exp, index) => {
      context += `${index + 1}. **${exp.role}** at ${exp.company}\n`;
      context += `   📅 ${formatPeriod(exp.start, exp.end)}${exp.duration ? ` (${exp.duration})` : ''}\n`;
      if (exp.location) context += `   📍 ${exp.location}\n`;
      context += `   🏷️ Category: ${exp.category}\n`;
      
      if (exp.highlights?.length) {
        context += `   ✨ Key Highlights:\n`;
        exp.highlights.forEach(highlight => {
          context += `      • ${highlight}\n`;
        });
      }
      
      if (exp.skills?.length) {
        context += `   🛠️ Skills: ${exp.skills.join(', ')}\n`;
      }
      
      if (exp.achievements?.length) {
        context += `   🏆 Achievements:\n`;
        exp.achievements.forEach(achievement => {
          context += `      • ${achievement}\n`;
        });
      }
      
      if (exp.fullDescription) {
        context += `   📝 Description: ${exp.fullDescription}\n`;
      }
      
      if (exp.technologies?.length) {
        context += `   💻 Technologies: ${exp.technologies.join(', ')}\n`;
      }
      
      context += "\n";
    });
    
    return context;
  }

  // Convert projects to AI-friendly context
  formatProjectsContext(): string {
    let context = "**Patrick's Projects Portfolio:**\n\n";
    
    projects.forEach((project, index) => {
      context += `${index + 1}. **${project.title}**\n`;
      context += `   📄 ${project.description}\n`;
      context += `   🏷️ Category: ${project.category}\n`;
      context += `   🛠️ Technologies: ${project.technologies.join(', ')}\n`;
      
      if (project.features?.length) {
        context += `   ✨ Key Features:\n`;
        project.features.forEach(feature => {
          context += `      • ${feature}\n`;
        });
      }
      
      if (project.challenges?.length) {
        context += `   🧩 Challenges Overcome:\n`;
        project.challenges.forEach(challenge => {
          context += `      • ${challenge}\n`;
        });
      }
      
      if (project.outcomes?.length) {
        context += `   🎯 Outcomes:\n`;
        project.outcomes.forEach(outcome => {
          context += `      • ${outcome}\n`;
        });
      }
      
      if (project.fullDescription) {
        context += `   📝 Full Description: ${project.fullDescription}\n`;
      }
      
      if (project.liveUrl && project.liveUrl !== '#') {
        context += `   🌐 Live URL: ${project.liveUrl}\n`;
      }
      
      if (project.githubUrl && project.githubUrl !== '#') {
        context += `   💾 GitHub: ${project.githubUrl}\n`;
      }
      
      context += "\n";
    });
    
    return context;
  }

  // Search for relevant experiences based on keywords
  searchExperiences(keywords: string[]): Experience[] {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    return experiences.filter(exp => {
      const searchableText = [
        exp.role,
        exp.company,
        exp.category,
        ...(exp.skills || []),
        ...(exp.highlights || []),
        ...(exp.achievements || []),
        ...(exp.technologies || []),
        exp.fullDescription || '',
        ...(exp.responsibilities || []),
        ...(exp.impact || [])
      ].join(' ').toLowerCase();
      
      return lowerKeywords.some(keyword => 
        searchableText.includes(keyword)
      );
    });
  }

  // Search for relevant projects based on keywords
  searchProjects(keywords: string[]): Project[] {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    return projects.filter(project => {
      const searchableText = [
        project.title,
        project.description,
        project.category,
        ...(project.technologies || []),
        ...(project.features || []),
        ...(project.challenges || []),
        ...(project.outcomes || []),
        project.fullDescription || ''
      ].join(' ').toLowerCase();
      
      return lowerKeywords.some(keyword => 
        searchableText.includes(keyword)
      );
    });
  }

  // Extract keywords from user query
  extractKeywords(query: string): string[] {
    // Common stop words to filter out
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'tell', 'about', 'patrick', 'projects', 'experience', 'work'];
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter(Boolean);
  }

  // Get relevant context based on user query
  getRelevantContext(userQuery: string): string {
    const keywords = this.extractKeywords(userQuery);
    
    if (keywords.length === 0) {
      // If no specific keywords, return basic info
      return this.getBasicContext();
    }

    const relevantExperiences = this.searchExperiences(keywords);
    const relevantProjects = this.searchProjects(keywords);
    
    let context = '';
    
    if (relevantExperiences.length > 0) {
      context += "**Relevant Experience:**\n";
      relevantExperiences.forEach((exp, index) => {
        context += `${index + 1}. **${exp.role}** at ${exp.company} (${formatPeriod(exp.start, exp.end)})\n`;
        if (exp.highlights?.length) {
          context += `   Key highlights: ${exp.highlights.slice(0, 2).join('; ')}\n`;
        }
        if (exp.skills?.length) {
          context += `   Skills: ${exp.skills.join(', ')}\n`;
        }
        context += '\n';
      });
    }
    
    if (relevantProjects.length > 0) {
      context += "**Relevant Projects:**\n";
      relevantProjects.forEach((project, index) => {
        context += `${index + 1}. **${project.title}** (${project.category})\n`;
        context += `   ${project.description}\n`;
        context += `   Technologies: ${project.technologies.join(', ')}\n`;
        if (project.features?.length) {
          context += `   Key features: ${project.features.slice(0, 2).join('; ')}\n`;
        }
        context += '\n';
      });
    }
    
    return context || this.getBasicContext();
  }

  // Get basic context when no specific matches
  getBasicContext(): string {
    return `**About Patrick Adrianus:**
Patrick is a recent graduate from RMIT with experience in:
- **iOS Development**: Participated in RMIT First Health iOS Hackathon with industry partners (Apple, Northern Health, Bilue), Apple Foundation Program
- **Full-Stack Development**: ERP systems, web applications, interactive portfolio
- **Research**: LLM privacy violation detection systems, NLP sentiment analysis
- **UI/UX**: Advanced glassmorphism effects, interactive designs, healthcare app UX

**Key Skills:**
- Programming: Python, Swift, JavaScript/TypeScript, React, R
- Data Science: Data Visualization, Interactive Dashboards, Statistical Computing, Data Wrangling, ETL, Spatial Data Analysis
- Mobile: iOS development, SwiftUI, Xcode, MapKit, Core Data, Firebase
- Web: React, Next.js, Three.js, WebGL, GLSL Shaders, Shiny (R)
- Research: Machine Learning, LLMs, Privacy Analysis, Natural Language Processing, Environmental Data Analysis
- Design: UI/UX, Glassmorphism, Interactive Design, Accessibility, Healthcare UX
- Collaboration: Team projects, hackathon development, industry partnerships

**Notable Projects:**
- **Blipy**: iOS reminder app that understand context and natural language, built with SwiftUI, Core Data, and Firebase. Features include smart scheduling, location-based reminders, and intuitive UI
- **Cliniwatch**: iOS mental health companion app built with team during RMIT First Health iOS Hackathon in collaboration with Apple, Northern Health, and Bilue. Addresses early warning system challenge for mental health crisis prevention
- **Interactive CO₂ & GDP Explorer**: R Shiny dashboard (Jun 2023) for data visualization coursework. Interactive world map comparing countries' CO₂ emissions and GDP from 1960-2020. Features year slider, multi-country selection (up to 20), synchronized time-series and bar charts. Includes 7+ academic citations and built-in guidance. Demonstrates data science, spatial visualization, and R programming skills
- **Liquid Glass Design System**: Advanced glassmorphism UI library with GLSL shaders and physics-based animations
- **LLM Privacy Detection**: Research system analyzing Stack Overflow posts for privacy violations using GPT-4o and DeepSeek
- **Interactive Portfolio**: This website featuring dynamic backgrounds, AI assistant, and advanced web technologies

**Achievements:**
- Special mention at RMIT First Health iOS Hackathon with team for "Cliniwatch" solution addressing Northern Health's challenge
- Completed Apple Foundation Program
- Successfully collaborated with industry partners (Apple, Northern Health, Bilue) on healthcare innovation
- Conducted academic research on LLM privacy detection with published results
- Certificate of Recognition from RMIT for contributions to student community
- Certificate of Recognition from RMIT for achieving 3.8 GPA in semester 1 and semester 2 of 2023

**Website Features:**
- Interactive portfolio with dynamic time-of-day backgrounds
- AI assistant for navigation and information
- **Feedback System**: Visitors can share feedback using the floating feedback button (bottom-right corner)
- Responsive design with mobile optimization
- Advanced animations and visual effects`;
  }

  // Get complete knowledge base context
  getFullContext(): string {
    return this.getBasicContext() + '\n\n' + 
           this.formatExperiencesContext() + '\n' + 
           this.formatProjectsContext();
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();