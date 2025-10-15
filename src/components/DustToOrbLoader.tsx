import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

const DustToOrbLoader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { progress, preventAutoHide, allowAutoHide } = useLoading();
  const [animationPhase, setAnimationPhase] = useState<'forming' | 'greeting' | 'throwing' | 'complete'>('forming');
  const [showWelcome, setShowWelcome] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const hasReached100 = useRef(false);
  
  // Smooth progress animation
  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(100, progress || 0));
    
    // Smoothly animate to target progress
    const duration = 200; // ms
    const startProgress = displayProgress;
    const startTime = Date.now();
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentProgress = startProgress + (targetProgress - startProgress) * easeProgress;
      
      setDisplayProgress(currentProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    animateProgress();
  }, [progress]);
  
  // Main Three.js animation for dust particles - progressive formation based on loading %
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      antialias: true, 
      alpha: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    camera.position.z = 3;
    
    // Particle system - dust particles
    const particleCount = 2000; // Increased from 800 for more particles
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3); // Add velocity for smooth movement
    const particleProgress = new Float32Array(particleCount); // Individual progress for each particle
    const particleStartTime = new Float32Array(particleCount); // When each particle starts moving
    
    // Orb radius in 3D space - smaller size during formation
    const sphereRadius = 0.5; // Reduced from 0.8 to make it smaller
    const phi = Math.PI * (3 - Math.sqrt(5));
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random dust positions (scattered)
      originalPositions[i3] = (Math.random() - 0.5) * 8;
      originalPositions[i3 + 1] = (Math.random() - 0.5) * 6;
      originalPositions[i3 + 2] = (Math.random() - 0.5) * 4;
      
      // Sphere positions (target)
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      targetPositions[i3] = Math.cos(theta) * radius * sphereRadius;
      targetPositions[i3 + 1] = y * sphereRadius;
      targetPositions[i3 + 2] = Math.sin(theta) * radius * sphereRadius;
      
      // Start at dust positions
      positions[i3] = originalPositions[i3];
      positions[i3 + 1] = originalPositions[i3 + 1];
      positions[i3 + 2] = originalPositions[i3 + 2];
      
      // Initialize velocity to zero
      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;
      
      // Initialize particle progress
      particleProgress[i] = 0;
      particleStartTime[i] = -1; // Not started yet
      
      // Color gradient (orange to blue)
      const intensity = (targetPositions[i3 + 1] / sphereRadius + 1) / 2;
      colors[i3] = 1.0 - intensity * 0.8;
      colors[i3 + 1] = 0.6 - intensity * 0.4;
      colors[i3 + 2] = 0.2 + intensity * 0.8;
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.03, // Much smaller particles for smoother look
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85, // Slightly more transparent for smoother appearance
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animation state
    let currentProgress = 0;
    let shouldFadeOut = false;
    const animationStartTime = Date.now();
    
    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001;
      const elapsedTime = (Date.now() - animationStartTime) * 0.001; // Time since animation started
      const posArray = geometry.attributes.position.array as Float32Array;
      
      if (shouldFadeOut) {
        // Fade out particles when orb is complete
        material.opacity = Math.max(0, material.opacity - 0.03); // Slower fade for smoothness
        particles.rotation.y += 0.008; // Smoother rotation
      } else {
        // Form particles based on progress (0-100%)
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          
          // Calculate which particles should start moving based on progress
          const particleThreshold = i / particleCount; // 0 to 1
          
          // Check if this particle should start moving
          if (particleThreshold <= currentProgress) {
            // Start the particle if it hasn't started yet
            if (particleStartTime[i] < 0) {
              particleStartTime[i] = elapsedTime;
            }
            
            // Calculate time since this particle started moving
            const particleElapsed = elapsedTime - particleStartTime[i];
            const moveDuration = 1.2; // 1.2 seconds for each particle to reach the orb
            
            // Update particle progress (0 to 1)
            particleProgress[i] = Math.min(particleElapsed / moveDuration, 1);
            
            if (particleProgress[i] < 1) {
              // Particle is still traveling - use smooth easing
              const easeProgress = particleProgress[i] * particleProgress[i] * (3 - 2 * particleProgress[i]); // Smoothstep
              
              // Calculate direction to target
              const dx = targetPositions[i3] - originalPositions[i3];
              const dy = targetPositions[i3 + 1] - originalPositions[i3 + 1];
              const dz = targetPositions[i3 + 2] - originalPositions[i3 + 2];
              
              // Apply velocity-based smooth movement
              posArray[i3] = originalPositions[i3] + dx * easeProgress;
              posArray[i3 + 1] = originalPositions[i3 + 1] + dy * easeProgress;
              posArray[i3 + 2] = originalPositions[i3 + 2] + dz * easeProgress;
            } else {
              // Particle has reached the orb - keep it there with slight orbit
              const orbitSpeed = 0.5;
              const orbitRadius = 0.02;
              posArray[i3] = targetPositions[i3] + Math.cos(time * orbitSpeed + i * 0.1) * orbitRadius;
              posArray[i3 + 1] = targetPositions[i3 + 1] + Math.sin(time * orbitSpeed * 0.7 + i * 0.1) * orbitRadius;
              posArray[i3 + 2] = targetPositions[i3 + 2] + Math.sin(time * orbitSpeed + i * 0.1) * orbitRadius;
            }
          } else {
            // Still floating as dust with gentler movement
            posArray[i3] = originalPositions[i3] + Math.sin(time * 0.3 + i * 0.05) * 0.05;
            posArray[i3 + 1] = originalPositions[i3 + 1] + Math.cos(time * 0.2 + i * 0.05) * 0.05;
            posArray[i3 + 2] = originalPositions[i3 + 2] + Math.sin(time * 0.25 + i * 0.05) * 0.03;
          }
        }
        
        // Gentle rotation
        particles.rotation.y += 0.003; // Slower, smoother rotation
        
        const pulse = Math.sin(time * 2) * 0.5 + 0.5; // Slower pulse
        material.size = 0.03 + pulse * 0.008; // Adjusted for smaller size with subtle pulse
      }
      
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    animate();
    
    // Expose progress update function
    (canvas as any).__updateProgress = (prog: number) => {
      currentProgress = Math.min(prog / 100, 1);
    };
    
    (canvas as any).__fadeOut = () => {
      shouldFadeOut = true;
    };
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Update particles based on loading progress
  useEffect(() => {
    const validProgress = Math.max(0, Math.min(100, progress || 0));
    
    if (canvasRef.current) {
      const canvas = canvasRef.current as any;
      if (canvas.__updateProgress) {
        canvas.__updateProgress(validProgress);
      }
    }
    
    // Update phase - only trigger once when reaching 100%
    if (validProgress >= 100 && !hasReached100.current) {
      hasReached100.current = true;
      
      // Prevent auto-hide while showing the welcome message
      preventAutoHide();
      
      // Show greeting message first with a slight delay
      setTimeout(() => {
        setAnimationPhase('greeting');
        setShowWelcome(true);
      }, 500); // 500ms delay after reaching 100%
      
      // Then do the parabolic throw after user can read the message extensively (2 seconds total)
      setTimeout(() => {
        setAnimationPhase('throwing');
        // Fade out particles when throwing
        if (canvasRef.current) {
          const canvas = canvasRef.current as any;
          if (canvas.__fadeOut) {
            canvas.__fadeOut();
          }
        }
        // Allow auto-hide after animation starts
        allowAutoHide();
      }, 2500); // 500ms delay + 2000ms to read = 2500ms (2 seconds to read the message)
    } else if (validProgress < 100) {
      setAnimationPhase('forming');
      setShowWelcome(false);
    }
  }, [progress, preventAutoHide, allowAutoHide]);

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Three.js canvas for dust particles */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Percentage at bottom center */}
      <AnimatePresence>
        {animationPhase === 'forming' && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              className="text-white/90 font-bold text-4xl [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]"
              key={Math.floor(displayProgress / 5)}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {Math.floor(displayProgress)}%
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Floating welcome message - appears below the dust orb when 100% before parabolic throw */}
      <AnimatePresence>
        {showWelcome && animationPhase === 'greeting' && (
          <motion.div
            className="absolute z-40 left-1/2 transform -translate-x-1/2"
            style={{
              top: 'calc(50% + 150px)', // Positioned further below the dust orb
            }}
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              y: -10
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: 10
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Floating liquid glass message */}
            <motion.div
              className="relative px-5 py-3 rounded-xl overflow-hidden" // Smaller padding
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
              }}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Liquid glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10" />
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              <div className="relative z-10">
                <motion.p 
                  className="text-base md:text-lg font-medium text-white text-center whitespace-nowrap"
                  style={{
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Welcome to my portfolio! 👋
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DustToOrbLoader;
