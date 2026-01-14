// src/data/experiences.ts

export type Link = { label: string; url: string };
export type Category = 'Data Science' | 'Full‑Stack' | 'Research' | 'Other';

export type Experience = {
  id: string;
  role: string;
  company: string;
  start: { year: number; month: number }; // 1-12
  end?: { year: number; month: number };  // undefined => Present
  duration?: string;                      // e.g. "2 days"
  location?: string;
  category: Category;
  skills: string[];
  highlights: string[];
  achievements?: string[];
  links?: Link[];

  // Detail-only fields (safe to be optional for list views)
  fullDescription?: string;
  responsibilities?: string[];
  technologies?: string[];
  impact?: string[];
  photos?: { url: string; caption?: string }[]; // 1-2 photos per experience
};

export const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;

export const formatPeriod = (start: Experience['start'], end?: Experience['end']) => {
  const startStr = `${monthNames[start.month - 1]} ${start.year}`;
  const endStr = end ? `${monthNames[end.month - 1]} ${end.year}` : 'Present';
  return `${startStr} — ${endStr}`;
};

export const diffMonths = (start: Experience['start'], end?: Experience['end']) => {
  const s = new Date(start.year, start.month - 1, 1);
  const e = end ? new Date(end.year, end.month - 1, 1) : new Date();
  // Inclusive month count for detail view use-cases
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
};

export const experiences: Experience[] = [
  {
    id: 'ios-hackathon-2025',
    role: 'Hackathon Participant – App Prototype "Cliniwatch"',
    company: 'RMIT iOS Hackathon (with Northern Health & Bilue)',
    start: { year: 2025, month: 7 },
    end: { year: 2025, month: 7 },
    duration: '2 days',
    location: 'Melbourne, Victoria, Australia · Onsite',
    category: 'Other',
    skills: [
      'Swift',
      'Xcode',
      'UI/UX Design',
      'Rapid Prototyping',
      'Interdisciplinary Collaboration',
      'Mental Health Technology',
      'Healthcare Solutions'
    ],
    highlights: [
      'Collaborated with teammates Hanan Bsaiso and Yuki Gunawardena to design "Cliniwatch", a mental health support app prototype',
      'Prototyped core app functionality in just two days using Swift/Xcode',
      'Worked with peers across STEM disciplines, guided by mentors from RMIT, Northern Health, and Bilue',
      'Presented the solution to industry judges, earning a special mention for innovation and impact'
    ],
    achievements: [
      'Delivered a functional and polished prototype in 48 hours',
      'Strengthened collaborative problem-solving under pressure',
      'Recognized with a special mention for potential in supporting mental health management'
    ],
    fullDescription:
      'An incredible 2-day experience participating in RMIT\'s iOS Hackathon in collaboration with Northern Health and Bilue. Working alongside brilliant teammates Hanan Bsaiso and Yuki Gunawardena, we developed "Cliniwatch" - an innovative mental health support app prototype that earned special recognition for its potential impact in addressing mental health challenges before they become crises.',
    responsibilities: [
      'Collaborated in a cross-disciplinary team to conceptualize and develop the "Cliniwatch" app prototype',
      'Applied Swift and Xcode development skills to build functional iOS application features in 48 hours',
      'Participated in rapid prototyping sessions focusing on mental health crisis prevention solutions',
      'Engaged with industry mentors from RMIT, Northern Health, and Bilue for guidance and feedback',
      'Contributed to team presentations and demo sessions showcasing our healthcare technology solution'
    ],
    technologies: [
      'Swift Programming Language',
      'Xcode IDE',
      'iOS SDK',
      'UI/UX Design Principles',
      'Healthcare Technology Integration',
      'Rapid Prototyping Methodologies',
      'Mental Health App Development'
    ],
    impact: [
      'Developed a prototype with real potential for mental health crisis prevention and management',
      'Gained recognition from industry professionals for innovation and potential impact',
      'Enhanced technical skills in iOS development and healthcare technology in just 2 days',
      'Built valuable professional networks across STEM disciplines and industry partners',
      'Demonstrated ability to deliver functional solutions under extreme time pressure'
    ],
    links: [
      { label: 'RMIT News', url: 'https://www.linkedin.com/posts/rmit-stem-college_apple-xcode-mentalhealth-activity-7354012465384337410-tD-9?utm_source=share&utm_medium=member_desktop&rcm=ACoAADz4CCgB3KyOkm0vPcSkqD_dPmmdWftzLHQ' }
    ],
    photos: [
      { url: '/experiences/ios-hackathon-1.jpg', caption: 'Team collaboration during the RMIT iOS Hackathon with Northern Health & Bilue' },
      { url: '/experiences/ios-hackathon-2.jpg', caption: 'Presenting Cliniwatch - Mental health support app prototype' }
    ]
  },
  {
    id: 'apple-foundation-1',
    role: 'Participant – Apple Foundation Program',
    company: 'Apple & RMIT University',
    start: { year: 2024, month: 2 },
    end: { year: 2024, month: 2 },
    location: 'Melbourne, Victoria, Australia · Onsite',
    category: 'Other',
    skills: [
      'SwiftUI',
      'Xcode',
      'UI/UX Design',
      'Prototyping',
      'Team Collaboration',
      'iOS Development',
      'Mobile App Design'
    ],
    highlights: [
      'Completed a 3-week intensive program focused on iOS app development and design thinking',
      'Built "Chemica", a prototype app to identify chemical hazard signs using image recognition',
      'Worked closely with mentors including Steph Worladge, Beck Storer, and John Gallaugher',
      'Learned the importance of teamwork, innovation, and presenting technical ideas to stakeholders'
    ],
    achievements: [
      'Delivered a working SwiftUI app prototype in a collaborative setting',
      'Sharpened iOS development skills while applying user-centred design principles',
      'Recognized for creativity and problem-solving in tackling real-world challenges'
    ],
    fullDescription:
      'A transformative 4-week journey through the Apple Foundation Program at RMIT University, where I gained hands-on experience with cutting-edge Apple technology while solving real-world problems. Under the expert mentorship of Steph Worladge, Beck Storer, and John Gallaugher, I developed "Chemica" - a comprehensive iOS app prototype that showcased my growing expertise in SwiftUI and mobile development.',
    responsibilities: [
      'Designed and developed "Chemica" iOS app prototype from initial concept to final implementation',
      'Participated in comprehensive SwiftUI and Xcode training sessions throughout the 4-week program',
      'Collaborated with industry mentors to refine mobile app development skills and best practices',
      'Engaged in peer review sessions and collaborative problem-solving exercises with fellow participants',
      'Presented app prototype to mentors and fellow participants for feedback and evaluation',
      'Applied design thinking principles to identify and solve real-world problems through mobile technology'
    ],
    technologies: [
      'Swift Programming Language',
      'SwiftUI Framework',
      'Xcode Development Environment',
      'iOS App Architecture',
      'User Interface Design',
      'Mobile App Prototyping Tools',
      'Image Recognition APIs',
      'Core ML Framework'
    ],
    impact: [
      'Gained comprehensive foundation in Apple iOS development ecosystem and best practices',
      'Built lasting mentorship relationships with industry professionals from Apple and RMIT',
      'Developed both technical expertise and essential soft skills in teamwork and innovation',
      'Created a portfolio-worthy app prototype demonstrating end-to-end development capabilities',
      'Enhanced understanding of user-centered design and its application in mobile app development'
    ],
    links: [
      { label: 'Apple Foundation Program', url: 'https://www.rmit.edu.au/study-with-us/apple-foundation-program' }
    ],
    photos: [
      { url: '/experiences/apple-foundation-1.jpg', caption: 'Apple Foundation Program at RMIT - Learning SwiftUI development' },
      { url: '/experiences/apple-foundation-2.jpg', caption: 'Presenting our App Chemica in the final showcase' }
    ]
  },
  {
    id: 'urban-waste-1',
    role: 'Summer Intern',
    company: 'Urban Waste',
    start: { year: 2022, month: 12 },
    end:   { year: 2023, month: 2 },
    location: 'Melbourne, Victoria, Australia · Hybrid',
    category: 'Full‑Stack',
    skills: [
      'Python',
      'XML',
      'ERP System Management',
      'Data Integration',
      'Problem Solving',
      'Cross-Functional Collaboration'
    ],
    highlights: [
      'Collaborated with IT, finance, and operations to identify ERP requirements and challenges',
      'Researched best practices in ERP system management to improve efficiency and compliance',
      'Assisted in designing internal system architecture with focus on data integration and UX',
      'Developed and tested ERP system modules to align with business processes',
      'Created documentation, user manuals, and training materials for smooth adoption',
      'Monitored and optimized the system post-implementation based on user feedback'
    ],
    achievements: [
      'Contributed to successful development and rollout of an internal ERP management system',
      'Improved cross-departmental communication and workflow efficiency',
      'Gained hands-on experience in ERP system design, testing, and optimization'
    ],
    fullDescription:
      'During my summer internship at Urban Waste, I had the opportunity to work on a comprehensive ERP system project that would transform how the company managed its operations. This role provided invaluable experience in enterprise software development and cross-functional collaboration in a real-world business environment.',
    responsibilities: [
      'Analyzed current business processes and identified areas for ERP integration',
      'Collaborated with stakeholders across IT, finance, and operations departments',
      'Designed system architecture focusing on data integration and user experience',
      'Developed and rigorously tested ERP modules using Python and related technologies',
      'Created comprehensive documentation and training materials for end users',
      'Provided ongoing support and optimization based on user feedback and system performance'
    ],
    technologies: [
      'Python for backend development and data processing',
      'ERP frameworks and integration tools',
      'Database design and management',
      'API development for system integration',
      'Documentation tools and user training platforms'
    ],
    impact: [
      'Successfully contributed to the development and deployment of a company-wide ERP system',
      'Improved operational efficiency by streamlining cross-departmental workflows',
      'Enhanced data integrity and reporting capabilities across the organization',
      'Reduced manual processes and increased automation in daily operations',
      'Established foundation for future system scalability and improvements'
    ],
    links: [
      { label: 'Company Website', url: 'https://urbanwaste.com.au' }
    ],
    photos: [
      { url: '/experiences/urban-waste-1.jpg', caption: 'Receiving certificate from the Australian Chamber of Commerce and Industry with Urban Waste and Professor Andy Song' }
    ]
  }
];
