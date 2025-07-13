# Personal Website

A high-performance personal portfolio website built with React, TypeScript, and Vite.

## Performance Optimizations

This website has been optimized for maximum performance with the following improvements:

### 🚀 React Optimizations
- **Lazy Loading**: Components are lazy-loaded to reduce initial bundle size
- **React.memo**: Components are memoized to prevent unnecessary re-renders
- **useCallback**: Event handlers are memoized to prevent function recreation
- **Optimized State Management**: Efficient state updates with proper dependency arrays

### 🎨 CSS Optimizations
- **Hardware Acceleration**: CSS transforms use `translate3d` and `translateZ(0)`
- **will-change Property**: Applied to animated elements for better performance
- **CSS Containment**: Layout, style, and paint containment for better rendering
- **Reduced Motion Support**: Respects user preferences for reduced motion

### 📦 Bundle Optimizations
- **Code Splitting**: Manual chunks for vendor libraries and animations
- **Tree Shaking**: Dead code elimination with modern build tools
- **Minification**: Terser for JavaScript and CSS minification
- **Console Removal**: Production builds remove console logs

### 🖼️ Image & Asset Optimizations
- **Optimized Gradients**: Cached color palettes to reduce calculations
- **SVG Optimization**: Inline SVGs with proper accessibility attributes
- **Font Display**: `font-display: swap` for better loading performance

### 🎭 Animation Optimizations
- **RAF Throttling**: RequestAnimationFrame throttling for smooth animations
- **Transform Optimization**: Using transform instead of changing layout properties
- **Reduced Complexity**: Mobile devices get simplified visual effects

### 📊 Performance Monitoring
- **Core Web Vitals**: Tracking FCP, LCP, and CLS metrics
- **Memory Monitoring**: JavaScript heap usage tracking in development
- **FPS Tracking**: Frame rate monitoring for smooth animations
- **Resource Timing**: Slow resource detection and reporting

### 🔧 Build Configuration
- **Modern Target**: ESNext for smaller bundles in modern browsers
- **Optimized Dependencies**: Pre-bundled common dependencies
- **HMR Optimization**: Fast hot module replacement in development

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Performance Metrics

The website achieves excellent performance scores:
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Bundler**: Rollup (via Vite)

## Development

Performance is monitored in development mode with:
- Real-time FPS tracking
- Memory usage monitoring
- Resource loading analysis
- Core Web Vitals reporting

Check the browser console for performance metrics during development.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

### 🤖 AI Chatbot Integration
- **LLM-Powered Assistant**: Integrated with OpenAI/Anthropic APIs for intelligent responses
- **Project-Focused**: AI only answers questions related to the website and portfolio
- **Conversation Memory**: Maintains context throughout the chat session
- **Secure Configuration**: Environment variable-based API key management
