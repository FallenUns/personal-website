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
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Find the experience by slug
  const experience = useMemo(() => {
    return experiences.find(exp => exp.id === slug);
  }, [slug]);

  useEffect(() => {
    setIsVisible(true);
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
      if (event.key === 'Escape' && isVisible && !isClosing) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, isClosing]);

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
          <h3 className="text-xl font-semibold text-white mb-3">About This Role</h3>
          <p className="text-white/80 leading-relaxed">
            {experience.fullDescription ||
              `During my time as ${experience.role} at ${experience.company}, I gained valuable experience in ${experience.category.toLowerCase()} development and contributed to various projects that enhanced my technical and professional skills.`}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Key Highlights</h3>
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
                <span className="text-white/90 text-sm leading-relaxed">{highlight}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Skills & Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skill, index) => (
              <motion.span
                key={index}
                className="px-3 py-1.5 bg-white/20 text-white/90 rounded-full text-sm border border-white/10"
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
        <h3 className="text-xl font-semibold text-white mb-4">Key Responsibilities</h3>
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
              <span className="text-white/90">{responsibility}</span>
            </motion.div>
          ))}
        </div>

        {experience.technologies && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">Technologies & Tools</h4>
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
                  <span className="text-white/90">{tech}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    achievements: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Key Achievements</h3>
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
              <span className="text-white/90">{achievement}</span>
            </motion.div>
          )) || <p className="text-white/70">No specific achievements documented for this role.</p>}
        </div>
      </div>
    ),
    impact: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Impact & Outcomes</h3>
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
              <span className="text-white/90">{impact}</span>
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
                    <span className="text-white/90">{achievement}</span>
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
          className="fixed inset-0 z-[9999] bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <div className="w-full h-full flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
              className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl h-[min(85vh,800px)] relative"
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
                style={{ borderRadius: '24px', width: '100%', height: '100%' }}
                {...liquidGlassProps}
                overLight={false}
              >
                <div ref={modalContentRef} className="w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1.5 text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10">
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

                  {/* Main content */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left side - Hero */}
                    <div className="w-1/2 p-6 flex flex-col overflow-y-auto">
                      <div className="mb-6">
                        <motion.h1
                          className="text-4xl font-bold text-white mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {experience.role}
                        </motion.h1>
                        <motion.h2
                          className="text-2xl text-white/90 mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          {experience.company}
                        </motion.h2>
                        {experience.location && (
                          <motion.p
                            className="text-white/70 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {experience.location}
                          </motion.p>
                        )}
                        <motion.div
                          className="flex items-center space-x-4 text-white/80"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <span className="text-lg font-medium">{period}</span>
                          <span className="text-sm text-white/60">({durationStr})</span>
                        </motion.div>
                      </div>

                      {/* Photos Section */}
                      {experience.photos && experience.photos.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center">
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
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {/* Photo count indicator */}
                                {experience.photos.length > 1 && (
                                  <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                                      <span className="text-xs text-white/80">
                                        {activePhotoIndex + 1}/{experience.photos.length}
                                      </span>
                                    </div>
                                  </div>
                                )}

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

                            {/* Photo navigation */}
                            {experience.photos.length > 1 && (
                              <div className="flex justify-center items-center gap-3 mt-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoIndex((prev) =>
                                      prev === 0 ? experience.photos!.length - 1 : prev - 1
                                    );
                                  }}
                                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                  aria-label="Previous photo"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                  </svg>
                                </button>
                                <div className="flex gap-2">
                                  {experience.photos.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePhotoIndex(index);
                                      }}
                                      className={`w-2 h-2 rounded-full transition-all ${
                                        index === activePhotoIndex
                                          ? 'bg-white w-4'
                                          : 'bg-white/50 hover:bg-white/70'
                                      }`}
                                      aria-label={`Go to photo ${index + 1}`}
                                      style={{ pointerEvents: 'auto' }}
                                    />
                                  ))}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoIndex((prev) =>
                                      prev === experience.photos!.length - 1 ? 0 : prev + 1
                                    );
                                  }}
                                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                  aria-label="Next photo"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <motion.div
                            className="w-full max-w-md"
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
                      <div className="flex gap-3 mt-6" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
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
                    <div className="w-1/2 border-l border-white/10 flex flex-col">
                      {/* Tab navigation */}
                      <div className="p-6 border-b border-white/10">
                        <div className="flex space-x-1 bg-white/10 rounded-lg p-1" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                          {(['overview', 'responsibilities', 'achievements', 'impact'] as const).map((tab) => (
                            <motion.button
                              key={tab}
                              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
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
                      <div className="flex-1 p-6 overflow-y-auto">
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
  );
};

export default memo(ExperienceDetail);
