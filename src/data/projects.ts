// src/data/projects.ts

export type ProjectCategory = 'Design' | 'Development' | 'Mobile' | 'UI Library' | 'Research';
export type MockupType = 'ui-ux' | 'web' | 'landing' | 'paper';

export type Project = {
  id: number;
  title: string;
  description: string;
  mockupType: MockupType;
  technologies: string[];
  category: ProjectCategory;
  slug: string;

  // Rich detail fields (used by ProjectDetail)
  fullDescription?: string;
  images?: string[];
  liveUrl?: string;
  githubUrl?: string;

  features: string[];
  challenges?: string[];
  outcomes?: string[];
};

export const projects: Project[] = [
  // {
  //   id: 1,
  //   title: 'UI/UX Design',
  //   description: 'Modern mobile app interface design with intuitive user experience',
  //   mockupType: 'ui-ux',
  //   technologies: ['Figma', 'Adobe XD', 'Principle'],
  //   category: 'Design',
  //   slug: 'ui-ux-design',
  //   fullDescription:
  //     'A comprehensive mobile app design project focusing on user-centered design principles and modern interface patterns. This project showcases the complete design process from user research to final prototype, emphasizing accessibility and usability across different devices and user contexts.',
  //   images: ['/project1-1.jpg', '/project1-2.jpg', '/project1-3.jpg'],
  //   liveUrl: '#',
  //   githubUrl: '#',
  //   features: ['Responsive Design', 'User Research', 'Prototyping', 'Usability Testing'],
  //   challenges: [
  //     'Creating intuitive navigation for complex user flows',
  //     'Balancing visual appeal with accessibility requirements',
  //     'Optimizing performance across different device capabilities'
  //   ],
  //   outcomes: ['40% increase in user engagement', '25% reduction in task completion time', '95% user satisfaction rating']
  // },
  // {
  //   id: 2,
  //   title: 'Web Design',
  //   description: 'Responsive web application with modern design principles',
  //   mockupType: 'web',
  //   technologies: ['React', 'TypeScript', 'Tailwind'],
  //   category: 'Development',
  //   slug: 'web-design',
  //   fullDescription:
  //     'A modern web application built with React and TypeScript, featuring responsive design and optimal performance. The project demonstrates advanced state management, component composition, and modern web development best practices.',
  //   images: ['/project2-1.jpg', '/project2-2.jpg', '/project2-3.jpg'],
  //   liveUrl: '#',
  //   githubUrl: '#',
  //   features: ['React Framework', 'TypeScript', 'Responsive Design', 'Performance Optimization'],
  //   challenges: [
  //     'Implementing complex state management across components',
  //     'Ensuring type safety throughout the application',
  //     'Optimizing bundle size and loading performance'
  //   ],
  //   outcomes: ['99.9% uptime reliability', '≈2s average page load time', '100% type coverage']
  // },
  // {
  //   id: 3,
  //   title: 'Landing Page',
  //   description: 'High-converting landing page with optimized user flow',
  //   mockupType: 'landing',
  //   technologies: ['Next.js', 'Framer Motion', 'CSS3'],
  //   category: 'Development',
  //   slug: 'landing-page',
  //   fullDescription:
  //     'A high-converting landing page designed to maximize user engagement and conversion rates. Features smooth animations, optimized loading performance, and data-driven design decisions based on user behavior analytics.',
  //   images: ['/project3-1.jpg', '/project3-2.jpg', '/project3-3.jpg'],
  //   liveUrl: '#',
  //   githubUrl: '#',
  //   features: ['Next.js Framework', 'Smooth Animations', 'SEO Optimized', 'Conversion Focused'],
  //   challenges: [
  //     'Balancing animation complexity with performance',
  //     'A/B testing different conversion strategies',
  //     'Implementing advanced SEO optimization'
  //   ],
  //   outcomes: ['150% increase in conversion rate', '95+ PageSpeed Insights score', '300% improvement in organic traffic']
  // },
  // {
  //   id: 4,
  //   title: 'Mobile App',
  //   description: 'Cross-platform mobile application with native performance',
  //   mockupType: 'ui-ux',
  //   technologies: ['React Native', 'Expo', 'Firebase'],
  //   category: 'Mobile',
  //   slug: 'mobile-app',
  //   fullDescription:
  //     'A cross-platform mobile application delivering native performance across iOS and Android platforms. Built with React Native and integrated with Firebase for real-time data synchronization and user authentication.',
  //   images: ['/project4-1.jpg', '/project4-2.jpg', '/project4-3.jpg'],
  //   liveUrl: '#',
  //   githubUrl: '#',
  //   features: ['Cross-platform', 'Native Performance', 'Real-time Data', 'Push Notifications'],
  //   challenges: [
  //     'Achieving native performance in cross-platform environment',
  //     'Implementing offline-first architecture',
  //     'Handling different platform-specific behaviors'
  //   ],
  //   outcomes: ['4.8/5 app store rating', '1M+ downloads', '92% user retention rate']
  // },
  // {
  //   id: 5,
  //   title: 'E-commerce',
  //   description: 'Full-featured e-commerce platform with payment integration',
  //   mockupType: 'web',
  //   technologies: ['Next.js', 'Stripe', 'MongoDB'],
  //   category: 'Development',
  //   slug: 'ecommerce-platform',
  //   fullDescription:
  //     'A complete e-commerce solution with secure payment processing and inventory management. Features include user authentication, product catalog, shopping cart, order management, and comprehensive admin dashboard.',
  //   images: ['/project5-1.jpg', '/project5-2.jpg', '/project5-3.jpg'],
  //   liveUrl: '#',
  //   githubUrl: '#',
  //   features: ['Payment Integration', 'Inventory Management', 'User Authentication', 'Admin Dashboard'],
  //   challenges: [
  //     'Implementing secure payment processing',
  //     'Building scalable inventory management system',
  //     'Creating intuitive admin interface'
  //   ],
  //   outcomes: ['$2M+ in processed transactions', '99.99% payment success rate', '50+ active merchants']
  // },
  {
    id: 6,
    title: 'Liquid Glass Design System',
    description: 'Advanced glassmorphism UI library with fluid animations and shader effects',
    mockupType: 'web',
    technologies: ['React', 'GLSL Shaders', 'WebGL', 'Framer Motion'],
    category: 'UI Library',
    slug: 'liquid-glass-design',
    fullDescription:
      'An innovative design system featuring advanced glassmorphism effects with real-time shader rendering. This project pushes the boundaries of web UI with liquid-like glass elements reacting to user interaction via physics-based animations and dynamic lighting.',
    images: ['/project6-1.jpg', '/project6-2.jpg', '/project6-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: [
      'Real-time Shader Effects',
      'Physics-based Animation',
      'Dynamic Lighting',
      'Responsive Design'
    ],
    challenges: [
      'Implementing complex GLSL shaders for web performance',
      'Creating smooth animations without impacting frame rate',
      'Ensuring cross-browser compatibility for WebGL effects',
      'Balancing visual quality with mobile device limitations',
      'Performance still needs improvement especially when rendering a large dimension'
    ],
    outcomes: ['>30fps performance', '≈98% browser compatibility']
  },
  {
    id: 7,
    title: 'LLM Privacy Violation Detection',
    description: 'End-to-end system to flag potential privacy violations in Stack Overflow posts using LLMs + heuristics',
    mockupType: 'paper',
    technologies: [
      'Python',
      'FastAPI',
      'scikit-learn',
      'TensorFlow',
      'spaCy',
      'Hugging Face',
      'SQLite',
      'Docker',
    ],
    category: 'Research',
    slug: 'software-engineering-project',
    fullDescription:
      'Research + production-minded pipeline that collects Stack Overflow posts (2020–2024), filters candidates with rule-based heuristics, and evaluates LLMs (GPT-4o, DeepSeek) across zero-shot, few-shot, and chain-of-thought prompts. Includes manual annotation, metrics, and a small API/dashboard for triage.',
    images: ['/se-project-1.jpg', '/se-project-2.jpg', '/se-project-3.jpg'],
    liveUrl: '#',
    githubUrl: 'https://github.com/FallenUns/Detecting-Privacy-Violation-using-LLM',
    features: [
      '1.5M+ post extraction into SQLite + CSV',
      'Heuristic filter (≈90+ privacy keywords) to build candidate set',
      'Manual annotation set (2,000 rows) for ground truth',
      'LLM eval: GPT-4o & DeepSeek with zero/few/CoT prompts',
      'Metrics pipeline (precision/recall/F1/accuracy) + confusion matrices',
      'Dashboard + API for reviewer triage'
    ],
    challenges: [
      'High class imbalance (~7.3% positive) impacts accuracy interpretation',
      'False positives from generic “privacy/security” language',
      'Distinguishing placeholders vs real secrets (e.g., keys, IPs, repos)',
      'NLI-based filtering produced excessive false positives → pivoted to rules',
      'Runtime/cost trade-offs across prompt types and providers'
    ],
    outcomes: [
      'Best F1: 32.7% (DeepSeek, few-shot); recall 46.6%',
      'GPT-4o CoT recall up to 45.9% with lower precision',
      'High overall accuracy (≥84%) but not meaningful due to imbalance',
      'Result: viable as human-in-the-loop prefilter; not ready for full automation'
    ]
  },
    {
    id: 8,
    title: 'Interactive Portfolio Website',
    description: 'A personal portfolio website featuring a dynamic, time-based background, a "liquid glass" UI, and an integrated AI assistant.',
    mockupType: 'web',
    technologies: [
      'React',
      'TypeScript',
      'Framer Motion',
      'Three.js',
      'GLSL Shaders',
      'Vite',
      'Tailwind CSS'
    ],
    category: 'Development',
    slug: 'interactive-portfolio',
    fullDescription:
      'This is a personal portfolio website designed to showcase my skills and projects in an engaging and interactive way. The site features a unique "liquid glass" aesthetic, a dynamic background that changes with the time of day, and a conversational AI assistant to help users navigate the site and learn more about my work. The entire project is built with a modern tech stack, focusing on performance and user experience.',
    images: ['/portfolio-1.png', '/portfolio-2.jpg', '/portfolio-3.jpg'],
    liveUrl: 'https://patrickadrianus.com',
    githubUrl: 'https://github.com/FallenUns/personal-website',
    features: [
      'Dynamic, time-of-day based background visuals',
      'Custom "Liquid Glass" UI components with shader effects',
      'Integrated AI assistant for conversational navigation and Q&A',
      'Responsive design for desktop and tablet devices',
      'Performance-optimized animations with Framer Motion and Three.js',
      'Component-based architecture with React and TypeScript'
    ],
    challenges: [
      'Optimizing WebGL and shader performance across different devices',
      'Creating a seamless and intuitive conversational UI for the AI assistant',
      'Ensuring a consistent and high-quality user experience with complex, overlapping animations',
      'Managing application state for the dynamic background and AI assistant'
    ],
    outcomes: [
      'A unique and memorable portfolio that effectively showcases my skills',
      'A reusable "Liquid Glass" component for future projects',
      'A deeper understanding of WebGL, GLSL shaders, and performance optimization techniques'
    ]
  },
  {
    id: 9,
    title: 'Cliniwatch – iOS Mental Health Companion App',
    description: 'A proactive monitoring system developed for the RMIT First Health iOS Hackathon to detect early signs of mental health deterioration before crisis point.',
    mockupType: 'ui-ux',
    technologies: [
      'Swift',
      'SwiftUI',
      'Core Data',
      'MapKit',
      'UserNotifications',
      'Natural Language Processing',
      'iOS Development',
      'Apple Health Integration (Future)',
      'Firebase'
    ],
    category: 'Mobile',
    slug: 'cliniwatch',
    fullDescription:
      'Cliniwatch was developed during the RMIT First Health iOS Hackathon in collaboration with Apple, Northern Health, and Bilue. The challenge was: "How might Northern Health create an early warning system that helps detect deteriorating mental health patients before it becomes a crisis — without depending solely on phone calls and clinical visits?" Our team created a comprehensive solution that bridges the gap between patients, carers, and clinical teams through proactive monitoring and early intervention.',
    images: ['/cliniwatch-1.jpg', '/cliniwatch-2.jpg', '/cliniwatch-3.jpg'],
    liveUrl: '#',
    githubUrl: 'https://github.com/FallenUns/IOS_Hackathon',
    features: [
      'Daily Check-In System with customizable questions, emojis, and affirmations',
      'Mood Calendar with emotional tracking and pattern recognition',
      'Nearby Support with MapKit integration to find mental health clinics and psychiatrists',
      'Community Hub connecting users with local mental health services',
      'Log Book with gamified Motivation Garden featuring gardening streaks',
      'Aura Points system for engagement rewards and milestone tracking',
      'Your Sanctuary - personalized progress tracking dashboard',
      'Built-in Contact List with closest contacts and recommended support contacts',
      'Carer Dashboard allowing carers to provide their perspective and observations',
      'Sleep & Energy Tracking for comprehensive wellness monitoring',
      'Symptom Tracker for logging changes over time',
      'Automated Alert System flagging concerning patterns to clinical teams',
      'Future: Journaling with NLP sentiment analysis',
      'Future: Apple Health integration for seamless data sharing'
    ],
    challenges: [
      'Addressing the complex challenge posed by Northern Health within hackathon timeframe',
      'Designing sensitive and accessible UI/UX for vulnerable mental health populations',
      'Creating meaningful early warning algorithms without false positives',
      'Balancing patient privacy with carer/clinical team visibility requirements',
      'Implementing MapKit integration for accurate mental health service locations',
      'Developing gamification that motivates without trivializing serious mental health issues',
      'Building dual-interface system for both patients and carers',
      'Ensuring HIPAA compliance and data security for health information',
      'Creating seamless user experience across check-ins, tracking, and support features'
    ],
    outcomes: [
      'Special mention at RMIT First Health iOS Hackathon (Apple, Northern Health, Bilue)',
      'Successful solution to Northern Health\'s early warning system challenge',
      'Comprehensive app addressing the gap between patient self-monitoring and clinical care',
      'Effective team collaboration delivering complex healthcare solution under time pressure',
      'Innovation in proactive mental health monitoring without relying solely on phone calls/visits',
      'Strong foundation for real-world deployment in healthcare settings',
      'Demonstrated ability to work with industry partners (Apple, Northern Health, Bilue)',
      'Potential to significantly improve mental health crisis prevention'
    ]
  }
];

// Convenience helpers
export const getProjectBySlug = (slug: string) => projects.find(p => p.slug === slug);
export const getVisibleProjectSlice = (page: number, visible: number) =>
  projects.slice(page * visible, page * visible + visible);