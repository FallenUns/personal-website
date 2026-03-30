import React, { memo, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { navigateBack } from '../utils/router';
import './performance.css';
import { experiences, formatPeriod, diffMonths } from '../data/experiences';

interface ExperienceDetailProps {
  slug?: string;
}

const ExperienceDetail: React.FC<ExperienceDetailProps> = ({ slug }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'responsibilities' | 'achievements' | 'impact'>('overview');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  // Find the experience by slug
  const experience = useMemo(() => {
    return experiences.find(exp => exp.id === slug);
  }, [slug]);

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
      if (!isFullscreen || !experience?.photos || experience.photos.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActivePhotoIndex((prev) =>
          prev === 0 ? experience.photos!.length - 1 : prev - 1
        );
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActivePhotoIndex((prev) =>
          prev === experience.photos!.length - 1 ? 0 : prev + 1
        );
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleArrowKeys);
      return () => document.removeEventListener('keydown', handleArrowKeys);
    }
  }, [isFullscreen, experience?.photos]);

  if (!experience) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Experience Not Found</h2>
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

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const liquidGlassProps = useMemo(() => ({
    elasticity: 0.05,
    saturation: 120,
    displacementScale: 80,
    blurAmount: 6,
    mode: 'shader' as const,
  }), []);

  const period = formatPeriod(experience.start, experience.end);
  const durationMonths = diffMonths(experience.start, experience.end);
  const durationStr = experience.duration || (durationMonths >= 12 ? `${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs` : `${durationMonths} mos`);

  const tabContent = {
    overview: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">About This Role</h3>
          <p className="text-sm sm:text-base text-white/80 leading-7 sm:leading-relaxed">
            {experience.fullDescription ||
              `During my time as ${experience.role} at ${experience.company}, I gained valuable experience in ${experience.category.toLowerCase()} development and contributed to various projects that enhanced my technical and professional skills.`}
          </p>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Key Highlights</h3>
          <div className="grid gap-3">
            {experience.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{highlight}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Skills & Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skill, index) => (
              <motion.span
                key={index}
                className="px-3 py-1.5 bg-white/20 text-white/90 rounded-full text-xs sm:text-sm border border-white/10"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    ),
    responsibilities: (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Key Responsibilities</h3>
        <div className="grid gap-3">
          {(experience.responsibilities || experience.highlights).map((responsibility, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{responsibility}</span>
            </motion.div>
          ))}
        </div>

        {experience.technologies && (
          <div className="mt-6">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Technologies & Tools</h4>
            <div className="grid gap-3">
              {experience.technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{tech}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    achievements: (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Key Achievements</h3>
        <div className="grid gap-3">
          {experience.achievements?.map((achievement, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{achievement}</span>
            </motion.div>
          )) || <p className="text-white/70">No specific achievements documented for this role.</p>}
        </div>
      </div>
    ),
    impact: (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Impact & Outcomes</h3>
        <div className="grid gap-3">
          {experience.impact?.map((impact, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{impact}</span>
            </motion.div>
          )) || (
              <div className="space-y-3">
                <p className="text-white/70 mb-4">Key outcomes from this role:</p>
                {experience.achievements?.map((achievement, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-white/90 leading-7 sm:leading-relaxed">{achievement}</span>
                  </motion.div>
                )) || <p className="text-white/70">Growth and skill development in {experience.category.toLowerCase()} technologies.</p>}
              </div>
            )}
        </div>
      </div>
    ),
  };

  return (
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
                        {experience.category}
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
                    <div className="w-full lg:w-1/2 p-3 sm:p-6 flex flex-col overflow-y-auto overflow-x-hidden detail-scroll-panel lg:max-h-full max-h-[50vh] lg:max-h-none flex-shrink-0 lg:flex-shrink">
                      <div className="mb-4 sm:mb-6 flex-shrink-0">
                        <motion.h1
                          className="text-xl sm:text-4xl font-bold text-white mb-1 sm:mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {experience.role}
                        </motion.h1>
                        <motion.h2
                          className="text-base sm:text-2xl text-white/90 mb-1 sm:mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          {experience.company}
                        </motion.h2>
                        {experience.location && (
                          <motion.p
                            className="text-sm sm:text-base text-white/70 mb-2 sm:mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {experience.location}
                          </motion.p>
                        )}
                        <motion.div
                          className="flex items-center space-x-3 sm:space-x-4 text-white/80"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <span className="text-sm sm:text-lg font-medium">{period}</span>
                          <span className="text-xs sm:text-sm text-white/60">({durationStr})</span>
                        </motion.div>
                      </div>

                      {/* Photos Section */}
                      {experience.photos && experience.photos.length > 0 ? (
                        <div className="flex-shrink-0 mb-3 sm:mb-6">
                          <motion.div
                            className="w-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <LiquidGlass
                              width={0}
                              height={0}
                              positioning="relative"
                              style={{ borderRadius: '16px', width: '100%', height: '100%' }}
                              elasticity={0.2}
                              saturation={140}
                              displacementScale={60}
                              blurAmount={4}
                              mode="shader"
                              overLight={false}
                            >
                              <div
                                className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden relative"
                                style={{
                                  aspectRatio: '16 / 9',
                                  maxHeight: isMobile ? '180px' : undefined,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {/* Fullscreen Toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFullscreenToggle();
                                  }}
                                  className="absolute top-2 left-2 z-10 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                                  aria-label="Toggle fullscreen"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  {isFullscreen ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80 group-hover:text-white">
                                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80 group-hover:text-white">
                                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                  )}
                                </button>

                                {/* Photo display */}
                                <motion.img
                                  key={activePhotoIndex}
                                  src={experience.photos[activePhotoIndex].url}
                                  alt={experience.photos[activePhotoIndex].caption || `Experience photo ${activePhotoIndex + 1}`}
                                  className="rounded-2xl"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center'
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  loading="lazy"
                                />

                                {/* Caption overlay */}
                                {experience.photos[activePhotoIndex].caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                                    <p className="text-white/90 text-xs">{experience.photos[activePhotoIndex].caption}</p>
                                  </div>
                                )}
                              </div>
                            </LiquidGlass>

                            {/* Navigation bar below photo */}
                            {experience.photos.length > 1 && (
                              <div className="flex justify-center items-center gap-3 mt-3">
                                {/* Previous button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoIndex((prev) =>
                                      prev === 0 ? experience.photos!.length - 1 : prev - 1
                                    );
                                  }}
                                  className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                                  aria-label="Previous photo"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80 group-hover:text-white">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                  </svg>
                                </button>

                                {/* Elongated dot navigation */}
                                <div className="flex gap-2 items-center">
                                  {experience.photos.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePhotoIndex(index);
                                      }}
                                      className={`h-2 rounded-full transition-all ${
                                        index === activePhotoIndex
                                          ? 'bg-white w-6'
                                          : 'bg-white/40 hover:bg-white/60 w-2'
                                      }`}
                                      aria-label={`Go to photo ${index + 1}`}
                                      style={{ pointerEvents: 'auto' }}
                                    />
                                  ))}
                                </div>

                                {/* Next button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoIndex((prev) =>
                                      prev === experience.photos!.length - 1 ? 0 : prev + 1
                                    );
                                  }}
                                  className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                                  aria-label="Next photo"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80 group-hover:text-white">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 mb-6">
                          <motion.div
                            className="w-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <LiquidGlass
                              width={0}
                              height={0}
                              positioning="relative"
                              style={{ borderRadius: '16px', width: '100%', height: '200px', minWidth: '100%', minHeight: '200px' }}
                              elasticity={0.2}
                              saturation={140}
                              displacementScale={60}
                              blurAmount={4}
                              mode="prominent"
                              overLight={false}
                            >
                              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex flex-col items-center justify-center p-6">
                                <motion.div
                                  className="text-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6 }}
                                >
                                  <div className="text-3xl font-bold text-white mb-2">{experience.skills.length}</div>
                                  <div className="text-white/70 text-sm mb-4">Skills Developed</div>
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {experience.skills.slice(0, 3).map((skill, index) => (
                                      <span key={index} className="text-xs px-2 py-1 bg-white/20 text-white/80 rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                    {experience.skills.length > 3 && (
                                      <span className="text-xs px-2 py-1 bg-white/20 text-white/80 rounded-full">
                                        +{experience.skills.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              </div>
                            </LiquidGlass>
                          </motion.div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                        {experience.links?.map((link, index) => (
                          <motion.button
                            key={index}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-blue-600/30 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(link.url, '_blank');
                            }}
                            style={{ pointerEvents: 'auto' }}
                          >
                            {link.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Right side - Detailed content */}
                    <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col flex-1 min-h-0">
                      {/* Tab navigation */}
                      <div className="p-2 sm:p-6 border-b border-white/10 flex-shrink-0">
                        <div className="flex gap-1 bg-white/10 rounded-lg p-1 detail-tab-bar" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                          {(['overview', 'responsibilities', 'achievements', 'impact'] as const).map((tab) => (
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

      {/* Fullscreen Photo Modal */}
      {isFullscreen && experience?.photos && (
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

            {/* Photo count indicator - bottom center */}
            {experience.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <span className="text-sm text-white/90">
                    {activePhotoIndex + 1} / {experience.photos.length}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation buttons for multiple photos */}
            {experience.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) =>
                      prev === 0 ? experience.photos!.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                  aria-label="Previous photo"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) =>
                      prev === experience.photos!.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-colors group"
                  aria-label="Next photo"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </>
            )}

            {/* Fullscreen photo */}
            <motion.img
              key={activePhotoIndex}
              src={experience.photos[activePhotoIndex].url}
              alt={experience.photos[activePhotoIndex].caption || `Experience photo ${activePhotoIndex + 1}`}
              className="rounded-2xl max-w-full max-h-full"
              style={{
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Caption overlay */}
            {experience.photos[activePhotoIndex].caption && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-2xl">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/90 text-sm text-center">{experience.photos[activePhotoIndex].caption}</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(ExperienceDetail);
