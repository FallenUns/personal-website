// src/data/projects.ts

export type ProjectCategory = 'Design' | 'Development' | 'Mobile' | 'UI Library';
export type MockupType = 'ui-ux' | 'web' | 'landing';

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
  {
    id: 1,
    title: 'UI/UX Design',
    description: 'Modern mobile app interface design with intuitive user experience',
    mockupType: 'ui-ux',
    technologies: ['Figma', 'Adobe XD', 'Principle'],
    category: 'Design',
    slug: 'ui-ux-design',
    fullDescription:
      'A comprehensive mobile app design project focusing on user-centered design principles and modern interface patterns. This project showcases the complete design process from user research to final prototype, emphasizing accessibility and usability across different devices and user contexts.',
    images: ['/project1-1.jpg', '/project1-2.jpg', '/project1-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Responsive Design', 'User Research', 'Prototyping', 'Usability Testing'],
    challenges: [
      'Creating intuitive navigation for complex user flows',
      'Balancing visual appeal with accessibility requirements',
      'Optimizing performance across different device capabilities'
    ],
    outcomes: ['40% increase in user engagement', '25% reduction in task completion time', '95% user satisfaction rating']
  },
  {
    id: 2,
    title: 'Web Design',
    description: 'Responsive web application with modern design principles',
    mockupType: 'web',
    technologies: ['React', 'TypeScript', 'Tailwind'],
    category: 'Development',
    slug: 'web-design',
    fullDescription:
      'A modern web application built with React and TypeScript, featuring responsive design and optimal performance. The project demonstrates advanced state management, component composition, and modern web development best practices.',
    images: ['/project2-1.jpg', '/project2-2.jpg', '/project2-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['React Framework', 'TypeScript', 'Responsive Design', 'Performance Optimization'],
    challenges: [
      'Implementing complex state management across components',
      'Ensuring type safety throughout the application',
      'Optimizing bundle size and loading performance'
    ],
    outcomes: ['99.9% uptime reliability', '≈2s average page load time', '100% type coverage']
  },
  {
    id: 3,
    title: 'Landing Page',
    description: 'High-converting landing page with optimized user flow',
    mockupType: 'landing',
    technologies: ['Next.js', 'Framer Motion', 'CSS3'],
    category: 'Development',
    slug: 'landing-page',
    fullDescription:
      'A high-converting landing page designed to maximize user engagement and conversion rates. Features smooth animations, optimized loading performance, and data-driven design decisions based on user behavior analytics.',
    images: ['/project3-1.jpg', '/project3-2.jpg', '/project3-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Next.js Framework', 'Smooth Animations', 'SEO Optimized', 'Conversion Focused'],
    challenges: [
      'Balancing animation complexity with performance',
      'A/B testing different conversion strategies',
      'Implementing advanced SEO optimization'
    ],
    outcomes: ['150% increase in conversion rate', '95+ PageSpeed Insights score', '300% improvement in organic traffic']
  },
  {
    id: 4,
    title: 'Mobile App',
    description: 'Cross-platform mobile application with native performance',
    mockupType: 'ui-ux',
    technologies: ['React Native', 'Expo', 'Firebase'],
    category: 'Mobile',
    slug: 'mobile-app',
    fullDescription:
      'A cross-platform mobile application delivering native performance across iOS and Android platforms. Built with React Native and integrated with Firebase for real-time data synchronization and user authentication.',
    images: ['/project4-1.jpg', '/project4-2.jpg', '/project4-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Cross-platform', 'Native Performance', 'Real-time Data', 'Push Notifications'],
    challenges: [
      'Achieving native performance in cross-platform environment',
      'Implementing offline-first architecture',
      'Handling different platform-specific behaviors'
    ],
    outcomes: ['4.8/5 app store rating', '1M+ downloads', '92% user retention rate']
  },
  {
    id: 5,
    title: 'E-commerce',
    description: 'Full-featured e-commerce platform with payment integration',
    mockupType: 'web',
    technologies: ['Next.js', 'Stripe', 'MongoDB'],
    category: 'Development',
    slug: 'ecommerce-platform',
    fullDescription:
      'A complete e-commerce solution with secure payment processing and inventory management. Features include user authentication, product catalog, shopping cart, order management, and comprehensive admin dashboard.',
    images: ['/project5-1.jpg', '/project5-2.jpg', '/project5-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Payment Integration', 'Inventory Management', 'User Authentication', 'Admin Dashboard'],
    challenges: [
      'Implementing secure payment processing',
      'Building scalable inventory management system',
      'Creating intuitive admin interface'
    ],
    outcomes: ['$2M+ in processed transactions', '99.99% payment success rate', '50+ active merchants']
  },
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
  }
];

// Convenience helpers
export const getProjectBySlug = (slug: string) => projects.find(p => p.slug === slug);
export const getVisibleProjectSlice = (page: number, visible: number) =>
  projects.slice(page * visible, page * visible + visible);