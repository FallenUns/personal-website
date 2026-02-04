// src/data/projects.ts

export type ProjectCategory = 'Design' | 'Development' | 'Mobile' | 'UI Library' | 'Research' | 'Data Science' | 'Machine Learning';
export type MockupType = 'ui-ux' | 'web' | 'landing' | 'paper';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export type ChartDataPoint = {
  [key: string]: string | number;
};

export type ChartConfig = {
  type: ChartType;
  title: string;
  description?: string;
  data: ChartDataPoint[];
  xAxisKey: string;
  yAxisKeys: string[];
  colors?: string[];
  width?: number;
  height?: number;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  mockupType: MockupType;
  technologies: string[];
  category: ProjectCategory;
  slug: string;
  comingSoon?: boolean; // Flag for coming soon projects

  // Rich detail fields (used by ProjectDetail)
  fullDescription?: string;
  images?: string[];
  imageCaptions?: string[]; // Optional captions for each image
  liveUrl?: string;
  githubUrl?: string;

  features: string[];
  challenges?: string[];
  outcomes?: string[];
  
  // Chart data for research projects
  charts?: ChartConfig[];
};

export const projects: Project[] = [
  {
    id: 0,
    title: 'New Project Coming Soon',
    description: 'Something exciting is in the works. Stay tuned for updates on this upcoming project.',
    mockupType: 'web',
    technologies: ['???', '???', '???'],
    category: 'Development',
    slug: 'coming-soon',
    comingSoon: true,
    features: [],
  },
  {
    id: 1,
    title: 'Liquid Glass Design System',
    description: 'Advanced glassmorphism UI library with fluid animations and shader effects',
    mockupType: 'web',
    technologies: ['React', 'GLSL Shaders', 'WebGL', 'Framer Motion'],
    category: 'UI Library',
    slug: 'liquid-glass-design',
    fullDescription:
      'An innovative design system featuring advanced glassmorphism effects with real-time shader rendering. This project pushes the boundaries of web UI with liquid-like glass elements reacting to user interaction via physics-based animations and dynamic lighting.',
    images: ['/logo.png'],
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
    id: 2,
    title: 'LLM Privacy Violation Detection',
    description: 'End-to-end system to flag potential privacy violations in Stack Overflow posts using LLMs + heuristics',
    mockupType: 'paper',
    technologies: [
      'Python',
      'FastAPI',
      'scikit-learn',
      'TensorFlow',
      'Hugging Face',
    ],
    category: 'Research',
    slug: 'software-engineering-project',
    fullDescription:
      'Research + production-minded pipeline that collects Stack Overflow posts (2020–2024), filters candidates with rule-based heuristics, and evaluates LLMs (GPT-4o, DeepSeek) across zero-shot, few-shot, and chain-of-thought prompts. Includes manual annotation, metrics, and a small API/dashboard for triage.',
    images: ['/Subject.png'],
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
    ],
    charts: [
      {
        type: 'bar',
        title: 'Correct vs Incorrect Labels of Privacy Violations',
        data: [
          {
            name: 'DeepSeek CoT',
            correct: 65,
            incorrect: 81
          },
          {
            name: 'DeepSeek Few Shot',
            correct: 68,
            incorrect: 78
          },
          {
            name: 'DeepSeek Zero Shot',
            correct: 54,
            incorrect: 92
          },
          {
            name: 'GPT CoT',
            correct: 67,
            incorrect: 79
          },
          {
            name: 'GPT Few Shot',
            correct: 65,
            incorrect: 81
          },
          {
            name: 'GPT Zero Shot',
            correct: 41,
            incorrect: 105
          }
        ],
        xAxisKey: 'name',
        yAxisKeys: ['correct', 'incorrect'],
        colors: ['#22c55e', '#ef4444'],
        width: 400,
        height: 250
      },
      {
        type: 'bar',
        title: 'Model Performance Metrics Comparison',
        data: [
          {
            name: 'GPT Zero Shot',
            precision: 24.40,
            recall: 28.10,
            f1Score: 26.10,
            accuracy: 88.40
          },
          {
            name: 'GPT Few Shot',
            precision: 24.90,
            recall: 44.50,
            f1Score: 31.90,
            accuracy: 86.20
          },
          {
            name: 'GPT CoT',
            precision: 22.20,
            recall: 45.90,
            f1Score: 29.90,
            accuracy: 84.30
          },
          {
            name: 'DS Zero Shot',
            precision: 25.10,
            recall: 37.00,
            f1Score: 29.90,
            accuracy: 87.40
          },
          {
            name: 'DS Few Shot',
            precision: 25.40,
            recall: 46.60,
            f1Score: 32.70,
            accuracy: 86.10
          },
          {
            name: 'DS CoT',
            precision: 24.90,
            recall: 44.50,
            f1Score: 31.90,
            accuracy: 86.20
          }
        ],
        xAxisKey: 'name',
        yAxisKeys: ['precision', 'recall', 'f1Score', 'accuracy'],
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
        width: 400,
        height: 250
      }
    ]
  },
  {
    id: 3,
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
    images: ['/portfolio-1.png', '/portfolio-2.png'],
    imageCaptions: ['Hero Section of the portfolio website showcasing the liquid glass design.', 'AI Assistant interface for conversational navigation.'],
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
    id: 4,
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
    ],
    category: 'Mobile',
    slug: 'cliniwatch',
    fullDescription:
      'Cliniwatch was developed during the RMIT First Health iOS Hackathon in collaboration with Apple, Northern Health, and Bilue. The challenge was: "How might Northern Health create an early warning system that helps detect deteriorating mental health patients before it becomes a crisis — without depending solely on phone calls and clinical visits?" Our team created a comprehensive solution that bridges the gap between patients, carers, and clinical teams through proactive monitoring and early intervention.',
    images: ['/cliniwatch-1.MP4', '/cliniwatch-2.png'],
    imageCaptions: ['Cliniwatch App Demo showcasing daily check-in and mood calendar features.', 'Nearby Support feature with MapKit integration to find local mental health services.'],
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
  },
  {
    id: 5,
    title: 'Interactive CO₂ & GDP Explorer',
    description: 'Built an interactive dashboard to compare countries on CO₂ emissions and GDP over time with world map, time-series, and bar charts.',
    mockupType: 'web',
    technologies: [
      'R',
      'Shiny',
      'Leaflet',
      'Plotly',
      'tidyverse',
      'sf (Spatial Data)',
      'rnaturalearth',
      'Data Visualization',
    ],
    category: 'Development',
    slug: 'co2-gdp-explorer',
    fullDescription:
      'An interactive R Shiny dashboard developed for data visualization coursework to explore the relationship between economic development (GDP) and environmental impact (CO₂ emissions) across countries and time periods. The application combines spatial visualization with temporal analysis, allowing users to compare up to 20 countries simultaneously and observe how their emissions and economic indicators evolve from 1960 to 2020. The project demonstrates expertise in data wrangling, interactive visualization, and creating user-friendly interfaces for complex datasets.',
    images: ['/gdpco2-1.png'],
    imageCaptions: ['Interactive dashboard showcasing CO₂ emissions and GDP visualizations with world map and charts.'],
    liveUrl: 'https://ryfaeg-patrick-adrianus.shinyapps.io/Assignment_3/',
    githubUrl: '#',
    features: [
      'Interactive World Map with color-coded CO₂ emissions by country',
      'Year Slider (1960-2020) for temporal exploration',
      'Multi-country Selection (up to 20 countries) for comparative analysis',
      'Time-series Line Chart showing CO₂ emission trends over time',
      'GDP Bar Chart comparing economic indicators by year',
      'Synchronized Visualizations with year slider affecting all charts',
      'Hover Tooltips with detailed country-specific data',
      'Auto-zoom Map Feature focusing on selected countries',
      'Comprehensive References section citing 7+ academic sources',
      'Built-in User Guidance with "How to Interact" instructions',
      'Data Cleaning Pipeline handling missing values and data inconsistencies',
      'Responsive Layout with organized panels for easy navigation'
    ],
    challenges: [
      'Data Integration: Merging CO₂ dataset (starting 1750) with GDP dataset (starting 1960) with different country codes',
      'Missing Data Management: Handling gaps in GDP values for certain countries/years',
      'Performance Optimization: Rendering large spatial datasets efficiently in Leaflet',
      'Color Scale Design: Creating meaningful color gradients for wide-ranging CO₂ values',
      'User Experience: Balancing feature richness with interface simplicity',
      'Country Code Standardization: Mapping between different country naming conventions (ISO codes)',
      'Data Filtering: Excluding aggregate regions (WLD, HIC, etc.) from country-level analysis'
    ],
    outcomes: [
      'Successfully visualized 60+ years of global CO₂ and GDP data',
      'Enabled comparative analysis of economic vs environmental trends',
      'Demonstrated correlation between industrialization and emissions',
      'Created reusable Shiny framework for temporal-spatial data exploration',
      'Delivered transparent analysis with proper academic citations',
      'Achieved smooth performance with 2,000+ data points per visualization',
      'Provided self-serve analysis tool requiring no coding knowledge',
      'Met academic requirements for Data Visualisation coursework (Jun 2023)'
    ]
  },
  {
    id: 6,
    title: 'Job Ads Data Parsing & Integration',
    description: 'End-to-end data cleaning and integration pipeline for heterogeneous job advertisement datasets with schema alignment and salary normalisation.',
    mockupType: 'paper',
    technologies: [
      'Python',
      'pandas',
      'NumPy',
      'Regex',
      'Data Cleaning',
      'ETL Pipeline',
      'Data Integration',
    ],
    category: 'Data Science',
    slug: 'job-ads-data-parsing',
    fullDescription:
      'This project focused on parsing, cleaning, and integrating two heterogeneous job advertisement datasets into a single, consistent table suitable for analysis and modelling. The work addressed real-world data quality issues including inconsistent schemas, mixed salary units, missing values, duplicates, and noisy text fields. The final output was a clean, unified job-ads dataset with standardised attributes and validation checks, enabling reliable downstream analytics such as categorisation and labour-market insights.',
    images: [],
    liveUrl: '#',
    githubUrl: '#',
    features: [
      'Schema alignment mapping source-specific columns to unified structure',
      'Salary parsing with regex extraction and unit conversion (hourly/weekly/annual)',
      'Annualised salary normalisation for cross-dataset comparability',
      'Outlier capping for extreme salary values',
      'Date parsing into standard datetime format',
      'Location string normalisation reducing state/city variants',
      'Contract type standardisation (full-time, part-time, contract)',
      'Multi-field deduplication using title, company, location, and posting date',
      'Missing value recovery with logical defaults',
      'Reproducible Jupyter notebooks for full pipeline'
    ],
    challenges: [
      'Multiple sources using different schemas and naming conventions',
      'Salary fields appearing in inconsistent units (hourly, weekly, annual)',
      'Dates, locations, and contract types inconsistently formatted',
      'Duplicates and partial records common across datasets',
      'Salary parsing relied on heuristic rules rather than employer-verified values',
      'Location normalisation complexity without geocoding',
      'Balancing data recovery vs dropping unreliable records'
    ],
    outcomes: [
      'Successfully integrated 2 raw datasets into unified schema',
      'All salary units standardised to annualised metric',
      'Duplicate records identified and removed',
      'Extreme salary values capped for analysis reliability',
      'Final dataset clean and analysis-ready',
      'Reproducible pipeline suitable for future data ingestion'
    ],
    charts: [
      {
        type: 'bar',
        title: 'Data Cleaning Pipeline Results',
        data: [
          { stage: 'Raw Datasets', count: 2 },
          { stage: 'Schema Aligned', count: 2 },
          { stage: 'Duplicates Removed', count: 1 },
          { stage: 'Final Unified', count: 1 }
        ],
        xAxisKey: 'stage',
        yAxisKeys: ['count'],
        colors: ['#3b82f6'],
        width: 400,
        height: 250
      }
    ]
  },
  {
    id: 7,
    title: 'Life Expectancy Prediction',
    description: 'Regression modelling to predict national life expectancy using multivariate public-health data with regularisation and feature selection.',
    mockupType: 'paper',
    technologies: [
      'Python',
      'pandas',
      'NumPy',
      'scikit-learn',
      'matplotlib',
      'Polynomial Regression',
      'Lasso Regularisation',
      'Ridge Regularisation',
    ],
    category: 'Machine Learning',
    slug: 'life-expectancy-prediction',
    fullDescription:
      'This project built and evaluated regression models to predict national life expectancy using a multivariate public-health dataset. The work covered the full ML workflow: EDA, normalisation, baseline modelling, regularisation, feature selection, cross-validation, and prediction. Multiple linear and polynomial models were compared, with regularisation used to control overfitting. The final model—Polynomial Regression with Lasso regularisation—achieved strong generalisation performance and provided interpretable insights into the primary drivers of life expectancy across countries and years.',
    images: [],
    liveUrl: '#',
    githubUrl: '#',
    features: [
      'Comprehensive EDA with skewness and outlier analysis',
      'Power transformation for variance stabilisation',
      'Min-Max scaling for feature normalisation',
      'One-hot encoding for categorical variables',
      'Linear and polynomial regression baselines',
      'Ridge and Lasso regularisation comparison',
      'K-Fold cross-validation for robust evaluation',
      'Learning curve analysis for generalisation assessment',
      'Residual analysis for model diagnostics',
      'Feature importance interpretation for health insights'
    ],
    challenges: [
      'Heavy skewness and outliers in GDP, HIV/AIDS, population',
      'Mixed feature scales requiring normalisation',
      'Multicollinearity among mortality indicators',
      'Overfitting risk with polynomial features',
      'Balancing model complexity with interpretability',
      'Linear models may miss non-linear interactions',
      'Country-level temporal effects not explicitly modelled'
    ],
    outcomes: [
      'Best model: Polynomial Regression + Lasso',
      'Test R² ≈ 0.86',
      'Test MSE ≈ 11.3',
      'CV average R² ≈ 0.87',
      'Key drivers identified: Adult mortality, schooling, income resources',
      'Full feature set outperformed reduced sets',
      'Strong generalisation confirmed via learning curves'
    ],
    charts: [
      {
        type: 'scatter',
        title: 'Predicted vs Actual Life Expectancy (Regression Plot)',
        data: [
          { actual: 45, predicted: 46.2 },
          { actual: 48, predicted: 47.8 },
          { actual: 52, predicted: 51.5 },
          { actual: 55, predicted: 56.1 },
          { actual: 58, predicted: 57.3 },
          { actual: 60, predicted: 60.8 },
          { actual: 62, predicted: 61.9 },
          { actual: 65, predicted: 64.6 },
          { actual: 68, predicted: 67.4 },
          { actual: 70, predicted: 69.8 },
          { actual: 72, predicted: 71.5 },
          { actual: 74, predicted: 73.8 },
          { actual: 76, predicted: 75.2 },
          { actual: 78, predicted: 77.6 },
          { actual: 80, predicted: 79.9 },
          { actual: 82, predicted: 81.7 },
          { actual: 84, predicted: 83.4 },
          { actual: 46, predicted: 47.1 },
          { actual: 50, predicted: 49.3 },
          { actual: 54, predicted: 55.2 },
          { actual: 56, predicted: 57.8 },
          { actual: 59, predicted: 58.9 },
          { actual: 61, predicted: 61.3 },
          { actual: 63, predicted: 62.7 },
          { actual: 66, predicted: 65.9 },
          { actual: 69, predicted: 68.2 },
          { actual: 71, predicted: 70.4 },
          { actual: 73, predicted: 72.1 },
          { actual: 75, predicted: 74.6 },
          { actual: 77, predicted: 76.3 },
          { actual: 79, predicted: 78.5 },
          { actual: 81, predicted: 80.8 }
        ],
        xAxisKey: 'actual',
        yAxisKeys: ['predicted'],
        colors: ['#10b981'],
        width: 400,
        height: 250
      },
      {
        type: 'bar',
        title: 'Model Performance Comparison (Test R²)',
        data: [
          { model: 'Linear Regression', r2: 0.75 },
          { model: 'Polynomial', r2: 0.86 },
          { model: 'Poly + Ridge', r2: 0.85 },
          { model: 'Poly + Lasso', r2: 0.86 }
        ],
        xAxisKey: 'model',
        yAxisKeys: ['r2'],
        colors: ['#10b981'],
        width: 400,
        height: 250
      },
      {
        type: 'bar',
        title: 'Test MSE by Model',
        data: [
          { model: 'Linear Regression', mse: 20.5 },
          { model: 'Polynomial', mse: 11.1 },
          { model: 'Poly + Ridge', mse: 11.5 },
          { model: 'Poly + Lasso', mse: 11.3 }
        ],
        xAxisKey: 'model',
        yAxisKeys: ['mse'],
        colors: ['#ef4444'],
        width: 400,
        height: 250
      }
    ]
  },
  {
    id: 8,
    title: 'Persuasion Detection in Memes',
    description: 'Multimodal deep learning system for detecting propaganda techniques in memes using BERT + Xception fusion with multi-task learning.',
    mockupType: 'paper',
    technologies: [
      'Python',
      'TensorFlow',
      'Keras',
      'BERT',
      'Xception',
      'BiLSTM',
      'Hugging Face Transformers',
      'keras-tuner',
      'Multi-task Learning',
      'Deep Learning',
    ],
    category: 'Machine Learning',
    slug: 'persuasion-detection-memes',
    fullDescription:
      'This project built a multimodal meme understanding system that detects persuasion/propaganda techniques using both multi-label classification (which of 22 techniques appear in a meme) and token-level span tagging (which parts of the text correspond to each technique). The pipeline fused BERT (text) and Xception (image) features, trained with class imbalance handling, and optimised using a custom validation objective that balances performance across both tasks.',
    images: [],
    liveUrl: '#',
    githubUrl: '#',
    features: [
      'Multimodal fusion of BERT text embeddings + Xception image features',
      'Multi-label classification for 22 propaganda techniques',
      'Token-level span tagging with BiLSTM sequence modelling',
      'Character-to-token span alignment using BertTokenizerFast',
      'Class imbalance handling via oversampling and weighted loss',
      'Custom multi-task loss weighting (0.6 main + 0.4 enhancement)',
      'Custom validation metric: balanced F1 across both tasks',
      'Image augmentation (flips, brightness, contrast, rotation, cropping)',
      'Hyperparameter tuning with keras_tuner RandomSearch',
      'Fine-tuning with unfrozen BERT/Xception layers',
      'Per-class confusion matrices and classification reports'
    ],
    challenges: [
      'Meaning split across text and visuals in memes',
      'Heavy class imbalance with rare propaganda techniques',
      'Dense and noisy span tagging with token alignment issues',
      'Small dataset size (687 train samples) increasing overfitting risk',
      'Token-level multi-label tagging sensitivity to thresholding',
      'Balancing multi-task learning without one task dominating',
      'Aligning character-level span labels to tokenised text'
    ],
    outcomes: [
      'Successfully trained multimodal model (text + image)',
      'Multi-task predictions for technique labels and token spans',
      'Effective class imbalance mitigation via oversampling + weighting',
      'Custom training callbacks for early stopping and LR scheduling',
      'Reproducible preprocessing and structured evaluation pipeline',
      'Demonstrated multimodal deep learning and NLP fusion skills'
    ],
    charts: [
      {
        type: 'bar',
        title: 'Neural Network Architecture Layers',
        data: [
          { layer: 'Input\n(Text+Image)', nodes: 2, fill: '#3b82f6' },
          { layer: 'Hidden', nodes: 3, fill: '#8b5cf6' },
          { layer: 'Output', nodes: 1, fill: '#10b981' }
        ],
        xAxisKey: 'layer',
        yAxisKeys: ['nodes'],
        colors: ['#8b5cf6'],
        width: 400,
        height: 250
      },
      {
        type: 'bar',
        title: 'Dataset Distribution',
        data: [
          { split: 'Train', samples: 687 },
          { split: 'Validation', samples: 63 },
          { split: 'Test', samples: 200 }
        ],
        xAxisKey: 'split',
        yAxisKeys: ['samples'],
        colors: ['#8b5cf6'],
        width: 400,
        height: 250
      },
      {
        type: 'bar',
        title: 'Top Propaganda Techniques (Training Set)',
        data: [
          { technique: 'Smears', count: 450 },
          { technique: 'Loaded Language', count: 360 },
          { technique: 'Name Calling', count: 252 },
          { technique: 'Appeal to Fear', count: 180 },
          { technique: 'Exaggeration', count: 150 }
        ],
        xAxisKey: 'technique',
        yAxisKeys: ['count'],
        colors: ['#f59e0b'],
        width: 400,
        height: 250
      }
    ]
  },
];

// Convenience helpers
export const getProjectBySlug = (slug: string) => projects.find(p => p.slug === slug);
export const getVisibleProjectSlice = (page: number, visible: number) =>
  projects.slice(page * visible, page * visible + visible);