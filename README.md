# Personal Website 🚀

A high-performance, interactive personal portfolio website featuring immersive 3D graphics, AI-powered chat assistant, and dynamic time-based theming. Built with modern web technologies for optimal user experience.

## ✨ Features

### 🎨 Interactive 3D Graphics
- **Three.js Integration**: Stunning 3D background with React Three Fiber
- **Dynamic Particle System**: Tech-themed particle sphere with dynamic animations
- **Post-Processing Effects**: Advanced visual effects using @react-three/postprocessing
- **Time-Based Theming**: Dynamic color schemes that change based on time of day (Dawn, Day, Dusk, Night)

### 🤖 AI Chat Assistant
- **Floating Assistant Orb**: Interactive AI chatbot with smooth animations
- **LLM Integration**: Powered by OpenAI APIs for intelligent responses
- **Context-Aware**: Maintains conversation history and project-specific knowledge
- **Project-Focused Responses**: AI assistant trained on portfolio content and technical details
- **Secure API Management**: Environment variable-based configuration

### � Responsive Design
- **Mobile Detection**: Adaptive experience based on device capabilities
- **Progressive Enhancement**: Full-featured desktop experience with optimized mobile view
- **Touch Optimizations**: Mobile-friendly interactions and gestures

### 🎯 Interactive Components
- **Smooth Scrolling**: Section navigation with scroll spy
- **Project Showcase**: Detailed project cards with interactive charts (Recharts)
- **Experience Timeline**: Professional experience section with detailed views
- **Feedback System**: In-app feedback collection and management
- **Custom Routing**: Client-side routing for seamless navigation

### 🎭 Advanced Animations
- **Framer Motion**: Fluid page transitions and micro-interactions
- **Hardware Acceleration**: GPU-accelerated animations for 60fps performance
- **Reduced Motion Support**: Accessibility-friendly animations respecting user preferences

## �️ Tech Stack

### Core Technologies
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 6.3.5** - Lightning-fast build tool with HMR
- **Tailwind CSS 4.1.10** - Utility-first CSS framework

### 3D & Graphics
- **Three.js 0.177.0** - WebGL 3D graphics library
- **@react-three/fiber 9.2.0** - React renderer for Three.js
- **@react-three/drei 10.4.2** - Useful helpers for React Three Fiber
- **@react-three/postprocessing 3.0.4** - Post-processing effects
- **simplex-noise 4.0.3** - Noise generation for procedural animations

### UI & Animation
- **Framer Motion 12.18.1** - Production-ready animation library
- **[liquid-glass-react](https://github.com/rdev/liquid-glass-react) 1.1.1** - Glassmorphism effects (customized for this project)
- **Recharts 3.2.1** - Composable charting library
- **react-markdown 10.1.0** - Markdown rendering

### Development Tools
- **@vitejs/plugin-react-swc 3.9.0** - Fast Refresh with SWC
- **ESLint 9.25.0** - Code quality and consistency
- **TypeScript ESLint 8.30.1** - TypeScript-specific linting
- **Terser 5.43.1** - JavaScript minification
- **stats.js 0.17.0** - Performance monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/FallenUns/personal-website.git
cd personal-website

# Install dependencies
npm install

# Set up environment variables (for AI assistant)
# Create .env file with your API keys
cp .env

# Start development server
npm run dev
```

### Available Scripts

```bash
# Start development server with HMR
npm run dev

# Type-check and build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## 🎯 Performance Optimizations

### React Optimizations
- **Lazy Loading**: Route-based code splitting
- **React.memo**: Memoized components to prevent unnecessary re-renders
- **useCallback & useMemo**: Optimized hooks for expensive computations
- **Context API**: Efficient global state management (LoadingContext, TimeContext)

### Rendering Optimizations
- **Hardware Acceleration**: CSS transforms with `translate3d` and `translateZ(0)`
- **will-change Property**: Optimized for animated elements
- **CSS Containment**: Layout, style, and paint containment
- **RequestAnimationFrame**: Smooth 60fps animations

### Asset Optimizations
- **Asset Preloader**: Custom hook for preloading critical resources
- **Image Optimization**: Lazy loading and preloading strategies
- **Font Display**: `font-display: swap` for better loading UX
- **SVG Optimization**: Inline optimized SVGs

### Bundle Optimizations
- **Code Splitting**: Vendor and animation chunks separated
- **Tree Shaking**: Dead code elimination
- **Minification**: Terser for production builds
- **Modern Target**: ESNext for smaller bundles

### Performance Monitoring
- **Core Web Vitals**: FCP, LCP, CLS, FID tracking
- **FPS Monitoring**: Real-time frame rate tracking (development)
- **Memory Profiling**: Heap usage monitoring
- **Resource Timing**: Slow resource detection

## 📊 Performance Metrics

Target metrics for optimal user experience:
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Frame Rate**: Consistent 60fps on desktop

## 🌐 Browser Support

- Chrome 88+ ✅
- Firefox 85+ ✅
- Edge 88+ ✅

## 📁 Project Structure

```
src/
├── api/              # API services and types
├── components/       # React components
├── contexts/         # React contexts
├── data/             # Static data (projects, experiences)
├── hooks/            # Custom React hooks
├── services/         # Business logic services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🔒 Security

- Environment variables for sensitive data
- Secure API key management
- No hardcoded credentials
- HTTPS-only in production

## 🎨 Customization

### Time-Based Themes
The website dynamically adjusts colors based on time of day:
- **Dawn** (5am-8am): Purple hues
- **Day** (8am-5pm): Blue tones  
- **Dusk** (5pm-8pm): Deep purple
- **Night** (8pm-5am): Dark indigo

### Adding Projects
Edit `src/data/projects.ts` to add new portfolio projects.

### Adding Experience
Edit `src/data/experiences.ts` to update work experience.

## � Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

## 📝 License

© 2025 Patrick Adrianus. All rights reserved.

## 🙏 Acknowledgments

- Three.js community for amazing 3D capabilities
- React Three Fiber for seamless React integration
- Framer Motion for beautiful animations
- [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) for the glassmorphism effects foundation
- The open-source community for incredible tools

---

**Built with ❤️ by Patrick Adrianus**
