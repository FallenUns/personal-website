import React, { memo, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import InteractiveChart from './InteractiveChart';
import { navigateBack } from '../utils/router';
import { PreloadedImage } from '../utils/preloadedImageHooks';
import { PreloadedVideo } from '../utils/preloadedVideoHooks';
import './performance.css';
import { getProjectBySlug } from '../data/projects';

interface ProjectDetailProps {
  slug?: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'challenges' | 'outcomes'>('overview');
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  // Find the project by slug
  const project = useMemo(() => getProjectBySlug(slug ?? ''), [slug]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isVisible]);

  // Handle scroll to show/hide indicator
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const hasScrollableContent = element.scrollHeight > element.clientHeight;
    const hasScrolled = element.scrollTop > 0;
    setShowScrollIndicator(hasScrollableContent && !hasScrolled);
  };

  // Check initial scroll state
  useEffect(() => {
    if (leftPanelRef.current) {
      const element = leftPanelRef.current;
      const hasScrollableContent = element.scrollHeight > element.clientHeight;
      setShowScrollIndicator(hasScrollableContent);
    }
  }, [project, isVisible]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (isVisible && !isClosing) {
          handleClose();
        }
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, isClosing, isFullscreen]);

  // Handle arrow key navigation in fullscreen mode
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!isFullscreen || !project?.images || project.images.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveMediaIndex((prev) =>
          prev === 0 ? project.images!.length - 1 : prev - 1
        );
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveMediaIndex((prev) =>
          prev === project.images!.length - 1 ? 0 : prev + 1
        );
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleArrowKeys);
      return () => document.removeEventListener('keydown', handleArrowKeys);
    }
  }, [isFullscreen, project?.images]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };


  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <button
            onClick={navigateBack}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    if (isClosing) return; // Prevent multiple calls
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      navigateBack();
    }, 300);
  };

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  const liquidGlassProps = useMemo(() => ({
    elasticity: 0.05,
    saturation: 120,
    displacementScale: 80,
    blurAmount: 6,
    mode: 'shader' as const,
  }), []);

  const tabContent = {
    overview: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">About This Project</h3>
          <p className="text-sm sm:text-base text-white/80 leading-7 sm:leading-relaxed">{project.fullDescription}</p>
        </div>

        {/* Special liquid glass demo section */}
        {project.slug === 'liquid-glass-design' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Interactive Demo</h3>
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                className="relative h-32"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LiquidGlass
                  width={0}
                  height={0}
                  positioning="relative"
                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                  elasticity={0.4}
                  saturation={180}
                  displacementScale={150}
                  blurAmount={6}
                  mode="shader"
                  overLight={false}
                >
                  <div className="w-full h-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: [-100, 400] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-white/90 font-medium">Hover for fluid effects</span>
                  </div>
                </LiquidGlass>
              </motion.div>

              <motion.div
                className="relative h-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <LiquidGlass
                  width={0}
                  height={0}
                  positioning="relative"
                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                  elasticity={0.3}
                  saturation={160}
                  displacementScale={100}
                  blurAmount={4}
                  mode="polar"
                  overLight={false}
                >
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                    <motion.div
                      className="flex space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-8 bg-white/40 rounded-full"
                          animate={{ scaleY: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </LiquidGlass>
              </motion.div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Technologies Used</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, index) => (
              <motion.span
                key={index}
                className="px-3 py-1.5 bg-white/20 text-white/90 rounded-full text-xs sm:text-sm border border-white/10"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    ),
    features: (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Key Features</h3>
        <div className="grid gap-3">
          {project.features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    challenges: (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Technical Challenges</h3>
        <div className="grid gap-3">
          {project.challenges?.map((challenge, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{challenge}</span>
            </motion.div>
          )) || <p className="text-white/70">No challenges documented for this project.</p>}
        </div>
      </div>
    ),
    outcomes: (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Project Outcomes</h3>
        <div className="grid gap-3">
          {project.outcomes?.map((outcome, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{outcome}</span>
            </motion.div>
          )) || <p className="text-white/70">No outcomes documented for this project.</p>}
        </div>
      </div>
    ),
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/30 detail-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackdropClick}
          >
            <div className="w-full h-full flex items-center justify-center p-0 sm:p-4 detail-modal-container">
              <motion.div
                ref={containerRef}
                className="w-full max-w-6xl h-[100dvh] sm:h-[min(88vh,860px)] relative detail-modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <LiquidGlass
                  width={dimensions.width}
                  height={dimensions.height}
                  positioning="relative"
                  style={{ borderRadius: isMobile ? '0px' : '24px', width: '100%', height: '100%' }}
                  {...liquidGlassProps}
                  overLight={false}
                >
                  <div ref={modalContentRef} className="detail-readable w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-6 border-b border-white/10 flex-shrink-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                          }}
                          disabled={isClosing}
                          className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 lg:hidden"
                          whileTap={{ scale: 0.9 }}
                          aria-label="Go back"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                            <polyline points="15,18 9,12 15,6"></polyline>
                          </svg>
                        </motion.button>
                        <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10">
                          {project.category}
                        </span>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose();
                        }}
                        disabled={isClosing}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isClosing ? 1 : 1.1 }}
                        whileTap={{ scale: isClosing ? 1 : 0.9 }}
                        aria-label="Close modal"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </motion.button>
                    </div>

                    {/* Main content - scrollable on mobile */}
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                      {/* Left side - Hero */}
                      <div
                        ref={leftPanelRef}
                        className="w-full lg:w-1/2 p-3 sm:p-5 flex flex-col overflow-y-auto overflow-x-hidden detail-scroll-panel lg:max-h-full max-h-[50vh] lg:max-h-none flex-shrink-0 lg:flex-shrink"
                        onScroll={handleScroll}
                      >
                        {/* Simple arrow indicator - fixed position */}
                        {showScrollIndicator && ((project.liveUrl && project.liveUrl !== '#') || (project.githubUrl && project.githubUrl !== '#')) ? (
                          <div className="hidden lg:block fixed bottom-4 left-4 z-[10000] pointer-events-none">
                            <motion.div
                              className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30"
                              animate={{ y: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                className="text-white/90"
                              >
                                <path
                                  d="M12 5v14m-4-4l4 4 4-4"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </motion.div>
                          </div>
                        ) : null}
                        <div className="mb-3 sm:mb-6">
                          <motion.h1
                            className="text-xl sm:text-4xl font-bold text-white mb-2 sm:mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {project.title}
                          </motion.h1>
                          <motion.p
                            className="text-sm text-white/80 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {project.description}
                          </motion.p>
                        </div>

                        {/* Project mockup/preview */}
                        <div className="flex-1 flex flex-col">
                          <motion.div
                            className="flex-1 w-full max-w-lg mx-auto relative max-h-[400px]"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {project.charts && project.charts.length > 0 ? (
                              // Display interactive chart for research projects
                              <div className="w-full h-full flex flex-col justify-center">
                                <div className="flex-1 min-h-0 flex items-center justify-center">
                                  <div className="w-full h-full max-w-2xl relative">
                                    {/* Chart count indicator - top right */}
                                    {project.charts.length > 1 && (
                                      <div className="absolute top-2 right-2 z-10">
                                        <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                                          <span className="text-xs text-white/80">
                                            {activeChartIndex + 1}/{project.charts.length}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    <InteractiveChart
                                      config={{
                                        ...project.charts[activeChartIndex],
                                        description: undefined,
                                        width: 450,
                                        height: 280
                                      }}
                                      className="w-full h-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : project.slug === 'liquid-glass-design' ? (
                              // Special showcase for liquid glass project
                              <div className="w-full h-full grid grid-cols-2 gap-3">
                                <LiquidGlass
                                  width={0}
                                  height={0}
                                  positioning="relative"
                                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                  elasticity={0.3}
                                  saturation={160}
                                  displacementScale={120}
                                  blurAmount={5}
                                  mode="shader"
                                  overLight={false}
                                >
                                  <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                      className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full"
                                    />
                                  </div>
                                </LiquidGlass>
                                <LiquidGlass
                                  width={0}
                                  height={0}
                                  positioning="relative"
                                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                  elasticity={0.2}
                                  saturation={180}
                                  displacementScale={80}
                                  blurAmount={3}
                                  mode="shader"
                                  overLight={false}
                                >
                                  <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                      className="w-6 h-6 bg-white/40 rounded-full"
                                    />
                                  </div>
                                </LiquidGlass>
                                <LiquidGlass
                                  width={0}
                                  height={0}
                                  positioning="relative"
                                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                  elasticity={0.25}
                                  saturation={140}
                                  displacementScale={100}
                                  blurAmount={4}
                                  mode="shader"
                                  overLight={false}
                                >
                                  <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                    <motion.div
                                      animate={{ y: [-10, 10, -10] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                      className="w-4 h-8 bg-white/40 rounded-full"
                                    />
                                  </div>
                                </LiquidGlass>
                                <LiquidGlass
                                  width={0}
                                  height={0}
                                  positioning="relative"
                                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                  elasticity={0.15}
                                  saturation={200}
                                  displacementScale={90}
                                  blurAmount={3}
                                  mode="shader"
                                  overLight={false}
                                >
                                  <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                    <motion.div
                                      animate={{ rotate: [-45, 45, -45] }}
                                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                      className="w-6 h-6 border-2 border-white/60 rounded"
                                    />
                                  </div>
                                </LiquidGlass>
                              </div>
                            ) : project.images && project.images.length > 0 ? (
                              // Display actual project image or video if available
                              <LiquidGlass
                                width={0}
                                height={0}
                                positioning="relative"
                                style={{ borderRadius: '16px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                elasticity={0.2}
                                saturation={140}
                                displacementScale={60}
                                blurAmount={2}
                                mode="shader"
                                overLight={false}
                              >
                                <div
                                  className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden relative"
                                  style={{
                                    aspectRatio: '16 / 9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {/* Fullscreen button for images and videos - top left */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFullscreenToggle();
                                    }}
                                    className="absolute top-2 left-2 z-[100] p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                                    aria-label="Fullscreen"
                                    style={{ pointerEvents: 'auto' }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80 group-hover:text-white">
                                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                    </svg>
                                  </button>

                                  {project.images[activeMediaIndex].toLowerCase().endsWith('.mp4') ||
                                    project.images[activeMediaIndex].toLowerCase().endsWith('.webm') ||
                                    project.images[activeMediaIndex].toLowerCase().endsWith('.mov') ? (
                                    <PreloadedVideo
                                      key={project.images[activeMediaIndex]}
                                      src={project.images[activeMediaIndex]}
                                      className="rounded-2xl relative z-0"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        objectPosition: 'center'
                                      }}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      onLoadedData={() => {
                                        if (import.meta.env.DEV) console.log(`Video loaded: ${project.images?.[activeMediaIndex] || 'unknown'}`);
                                      }}
                                      onError={() => {
                                        console.error(`❌ Failed to load video: ${project.images?.[activeMediaIndex] || 'unknown'}`);
                                      }}
                                    />
                                  ) : (
                                    <PreloadedImage
                                      src={project.images[activeMediaIndex]}
                                      alt={project.title}
                                      className="rounded-2xl relative z-0"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        objectPosition: 'center'
                                      }}
                                      onLoad={() => {
                                        if (import.meta.env.DEV) console.log(`Using preloaded image: ${project.images?.[activeMediaIndex] || 'unknown'}`);
                                      }}
                                      onError={() => {
                                        console.error(`❌ Failed to load preloaded image: ${project.images?.[activeMediaIndex] || 'unknown'}`);
                                      }}
                                    />
                                  )}

                                  {/* Caption overlay */}
                                  {project.imageCaptions && project.imageCaptions[activeMediaIndex] && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                                      <p className="text-white/90 text-xs">{project.imageCaptions[activeMediaIndex]}</p>
                                    </div>
                                  )}
                                </div>
                              </LiquidGlass>
                            ) : (
                              // Standard preview for other projects
                              <LiquidGlass
                                width={0}
                                height={0}
                                positioning="relative"
                                style={{ borderRadius: '16px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                elasticity={0.2}
                                saturation={140}
                                displacementScale={60}
                                blurAmount={2}
                                mode="shader"
                                overLight={false}
                              >
                                <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                                  {/* Dynamic visualization based on category */}
                                  {project.category === 'Machine Learning' ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                      {/* Neural network animation */}
                                      <div className="relative w-48 h-48">
                                        {/* Input layer */}
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                                          {[0, 1, 2, 3].map((i) => (
                                            <motion.div
                                              key={`in-${i}`}
                                              className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400/80 to-blue-500/80 border border-white/40"
                                              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                          ))}
                                        </div>
                                        {/* Hidden layer 1 */}
                                        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                          {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <motion.div
                                              key={`h1-${i}`}
                                              className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400/70 to-purple-500/70 border border-white/30"
                                              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 + i * 0.15 }}
                                            />
                                          ))}
                                        </div>
                                        {/* Hidden layer 2 */}
                                        <div className="absolute left-2/3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                          {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <motion.div
                                              key={`h2-${i}`}
                                              className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-400/70 to-violet-500/70 border border-white/30"
                                              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                              transition={{ duration: 1.5, repeat: Infinity, delay: 1 + i * 0.15 }}
                                            />
                                          ))}
                                        </div>
                                        {/* Output layer */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                                          {[0, 1, 2].map((i) => (
                                            <motion.div
                                              key={`out-${i}`}
                                              className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400/80 to-emerald-500/80 border border-white/40"
                                              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                              transition={{ duration: 2, repeat: Infinity, delay: 1.5 + i * 0.2 }}
                                            />
                                          ))}
                                        </div>
                                        {/* Connecting lines animation */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                          {[0, 1, 2].map((i) => (
                                            <motion.line
                                              key={`line-${i}`}
                                              x1="15%" y1={`${25 + i * 20}%`}
                                              x2="33%" y2={`${20 + i * 15}%`}
                                              stroke="rgba(147, 51, 234, 0.3)"
                                              strokeWidth="1"
                                              animate={{ opacity: [0.1, 0.5, 0.1] }}
                                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                            />
                                          ))}
                                        </svg>
                                      </div>
                                      <div className="absolute bottom-4 text-center text-white/70 text-sm">
                                        <span className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-400/30">Neural Network</span>
                                      </div>
                                    </div>
                                  ) : project.category === 'Data Science' ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                      {/* Data pipeline animation */}
                                      <div className="relative w-64 h-40 flex items-center justify-between px-4">
                                        {/* Source datasets */}
                                        <div className="flex flex-col gap-2">
                                          <motion.div
                                            className="w-12 h-10 bg-gradient-to-br from-red-400/60 to-red-500/60 rounded-lg border border-white/30 flex items-center justify-center"
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                          >
                                            <span className="text-[8px] text-white/80">CSV</span>
                                          </motion.div>
                                          <motion.div
                                            className="w-12 h-10 bg-gradient-to-br from-yellow-400/60 to-amber-500/60 rounded-lg border border-white/30 flex items-center justify-center"
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                                          >
                                            <span className="text-[8px] text-white/80">JSON</span>
                                          </motion.div>
                                        </div>
                                        
                                        {/* Flow arrows */}
                                        <motion.div
                                          className="flex items-center gap-1"
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                          <div className="w-8 h-0.5 bg-gradient-to-r from-white/40 to-cyan-400/60"></div>
                                          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-cyan-400/60"></div>
                                        </motion.div>
                                        
                                        {/* Processing */}
                                        <motion.div
                                          className="w-16 h-20 bg-gradient-to-br from-cyan-400/50 to-blue-500/50 rounded-xl border border-white/40 flex flex-col items-center justify-center"
                                          animate={{ scale: [1, 1.05, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        >
                                          <motion.div
                                            className="w-6 h-6 border-2 border-white/60 border-t-transparent rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                          />
                                          <span className="text-[7px] text-white/70 mt-1">ETL</span>
                                        </motion.div>
                                        
                                        {/* Flow arrows */}
                                        <motion.div
                                          className="flex items-center gap-1"
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                        >
                                          <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400/60 to-green-400/60"></div>
                                          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-green-400/60"></div>
                                        </motion.div>
                                        
                                        {/* Output */}
                                        <motion.div
                                          className="w-14 h-16 bg-gradient-to-br from-green-400/60 to-emerald-500/60 rounded-lg border border-white/40 flex flex-col items-center justify-center"
                                          animate={{ scale: [0.95, 1, 0.95] }}
                                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        >
                                          <div className="w-8 h-8 flex flex-col gap-0.5 p-1">
                                            <div className="h-1 bg-white/50 rounded w-full"></div>
                                            <div className="h-1 bg-white/40 rounded w-3/4"></div>
                                            <div className="h-1 bg-white/40 rounded w-full"></div>
                                            <div className="h-1 bg-white/30 rounded w-2/3"></div>
                                          </div>
                                          <span className="text-[7px] text-white/70">Clean</span>
                                        </motion.div>
                                      </div>
                                      <div className="absolute bottom-4 text-center text-white/70 text-sm">
                                        <span className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-400/30">Data Pipeline</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center text-white/60">
                                      <div className="w-16 h-16 bg-white/20 rounded-xl mb-4 mx-auto flex items-center justify-center">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                          <polyline points="21,15 16,10 5,21"></polyline>
                                        </svg>
                                      </div>
                                      <p className="text-sm">Project Preview</p>
                                    </div>
                                  )}
                                </div>
                              </LiquidGlass>
                            )}
                          </motion.div>

                          {/* Media navigation - for multiple images/videos */}
                          {project.images && project.images.length > 1 && !project.charts && (
                            <div className="flex justify-center items-center gap-3 mt-4 mb-2" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMediaIndex((prev) =>
                                    prev === 0 ? project.images!.length - 1 : prev - 1
                                  );
                                }}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                aria-label="Previous media"
                                style={{ pointerEvents: 'auto' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                  <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                              </button>
                              <div className="flex gap-2 items-center">
                                {project.images.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMediaIndex(index);
                                    }}
                                    className={`h-2 rounded-full transition-all ${index === activeMediaIndex
                                        ? 'bg-white w-6'
                                        : 'bg-white/40 hover:bg-white/60 w-2'
                                      }`}
                                    aria-label={`View media ${index + 1}`}
                                    style={{ pointerEvents: 'auto' }}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMediaIndex((prev) =>
                                    prev === project.images!.length - 1 ? 0 : prev + 1
                                  );
                                }}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                aria-label="Next media"
                                style={{ pointerEvents: 'auto' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                  <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                              </button>
                            </div>
                          )}

                          {/* Chart navigation - positioned outside chart container */}
                          {project.charts && project.charts.length > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-4 mb-2" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChartIndex((prev) =>
                                    prev === 0 ? project.charts!.length - 1 : prev - 1
                                  );
                                }}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                aria-label="Previous chart"
                                style={{ pointerEvents: 'auto' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                  <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                              </button>
                              <div className="flex gap-2 items-center">
                                {project.charts.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveChartIndex(index);
                                    }}
                                    className={`h-2 rounded-full transition-all ${index === activeChartIndex
                                        ? 'bg-white w-6'
                                        : 'bg-white/40 hover:bg-white/60 w-2'
                                      }`}
                                    aria-label={`View chart ${index + 1}`}
                                    style={{ pointerEvents: 'auto' }}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChartIndex((prev) =>
                                    prev === project.charts!.length - 1 ? 0 : prev + 1
                                  );
                                }}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                aria-label="Next chart"
                                style={{ pointerEvents: 'auto' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                  <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                          {project.liveUrl && project.liveUrl !== '#' && (
                            <motion.button
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 rounded-lg border border-green-500/30 hover:bg-gradient-to-r hover:from-green-500/30 hover:to-green-600/30 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
                              }}
                              style={{ pointerEvents: 'auto' }}
                            >
                              {project.liveUrl?.includes('testflight.apple.com') ? 'Join TestFlight' : 'Live Demo'}
                            </motion.button>
                          )}
                          {project.githubUrl && project.githubUrl !== '#' && (
                            <motion.button
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-violet-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-violet-600/30 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                              }}
                              style={{ pointerEvents: 'auto' }}
                            >
                              GitHub
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Right side - Detailed content */}
                      <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col flex-1 min-h-0">
                        {/* Tab navigation */}
                        <div className="p-2 sm:p-6 border-b border-white/10 flex-shrink-0">
                          <div className="flex gap-1 bg-white/10 rounded-lg p-1 detail-tab-bar" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                            {(['overview', 'features', 'challenges', 'outcomes'] as const).map((tab) => (
                              <motion.button
                                key={tab}
                                className={`flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                  }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab(tab);
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ pointerEvents: 'auto' }}
                              >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 p-3 sm:p-6 overflow-y-auto detail-scroll-panel min-h-0">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeTab}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {tabContent[activeTab]}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </LiquidGlass>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Media Modal */}
      <AnimatePresence>
        {isFullscreen && project?.images && (
          <motion.div
            className="fixed inset-0 z-[10001] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleFullscreenToggle}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center p-3 sm:p-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleFullscreenToggle}
                className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                aria-label="Exit fullscreen"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Media count indicator - bottom center */}
              {project.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                    <span className="text-sm text-white/90">
                      {activeMediaIndex + 1} / {project.images.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation buttons for multiple media */}
              {project.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex((prev) =>
                        prev === 0 ? project.images!.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                    aria-label="Previous media"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex((prev) =>
                        prev === project.images!.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                    aria-label="Next media"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </>
              )}

              {/* Fullscreen media - video or image */}
              {project.images && project.images[activeMediaIndex] && (
                project.images[activeMediaIndex].toLowerCase().endsWith('.mp4') ||
                  project.images[activeMediaIndex].toLowerCase().endsWith('.webm') ||
                  project.images[activeMediaIndex].toLowerCase().endsWith('.mov') ? (
                  <PreloadedVideo
                    key={project.images[activeMediaIndex]}
                    src={project.images[activeMediaIndex]}
                    className="rounded-2xl max-w-full max-h-full"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <PreloadedImage
                    key={project.images[activeMediaIndex]}
                    src={project.images[activeMediaIndex]}
                    alt={project.title}
                    className="rounded-2xl max-w-full max-h-full"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                  />
                )
              )}

              {/* Caption overlay in fullscreen */}
              {project.imageCaptions && project.imageCaptions[activeMediaIndex] && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-2xl">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <p className="text-white/90 text-sm text-center">{project.imageCaptions[activeMediaIndex]}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(ProjectDetail);
