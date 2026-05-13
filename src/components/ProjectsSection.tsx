import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useComponentLoader } from '../contexts/LoadingContext';
import { navigateTo } from '../utils/router';
import './performance.css';
import { projects } from '../data/projects';
import { hudLog } from '../hooks/useHudBus';
import { StickySectionBackground } from './visuals/SectionBackground';

// SVG filter for pixelated blur effect
const PixelateFilter = memo(() => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="pixelate-filter">
        <feFlood x="4" y="4" height="2" width="2" />
        <feComposite width="8" height="8" />
        <feTile result="a" />
        <feComposite in="SourceGraphic" in2="a" operator="in" />
        <feMorphology operator="dilate" radius="4" />
      </filter>
    </defs>
  </svg>
));
PixelateFilter.displayName = 'PixelateFilter';

// Animated Data Pipeline Mockup for Data Science projects
const DataPipelineMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-24 h-20">
        {/* Data sources - left side */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <motion.div
            className="w-5 h-4 bg-gradient-to-r from-red-400/60 to-red-500/60 rounded border border-white/30"
            animate={{ x: [0, 2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-5 h-4 bg-gradient-to-r from-yellow-400/60 to-yellow-500/60 rounded border border-white/30"
            animate={{ x: [0, 2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>

        {/* Data flow arrows */}
        <motion.div
          className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-white/40 to-cyan-400/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Processing center */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-gradient-to-br from-cyan-400/40 to-blue-500/40 rounded-lg border border-white/40 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Output arrow */}
        <motion.div
          className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-cyan-400/60 to-green-400/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />

        {/* Output - unified dataset */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-br from-green-400/60 to-emerald-500/60 rounded border border-white/40"
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <div className="absolute inset-1 space-y-0.5">
            <div className="h-0.5 bg-white/50 rounded w-full"></div>
            <div className="h-0.5 bg-white/40 rounded w-3/4"></div>
            <div className="h-0.5 bg-white/40 rounded w-full"></div>
            <div className="h-0.5 bg-white/30 rounded w-2/3"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
DataPipelineMockup.displayName = 'DataPipelineMockup';

// Animated Neural Network Mockup for ML projects (2 → 3 → 1 architecture)
const NeuralNetworkMockup = memo(() => {
  const layers = [2, 3, 1]; // neurons per layer: Input (text+image), Hidden, Output

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-24 flex items-center justify-between px-2">
        {layers.map((neurons, layerIndex) => (
          <div key={layerIndex} className="flex flex-col justify-center gap-1">
            {Array.from({ length: neurons }).map((_, neuronIndex) => (
              <motion.div
                key={neuronIndex}
                className={`w-3 h-3 rounded-full border border-white/40 ${layerIndex === 0 ? 'bg-gradient-to-br from-blue-400/60 to-blue-500/60' :
                  layerIndex === layers.length - 1 ? 'bg-gradient-to-br from-green-400/60 to-emerald-500/60' :
                    'bg-gradient-to-br from-purple-400/50 to-purple-500/50'
                  }`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: (layerIndex * 0.3) + (neuronIndex * 0.1)
                }}
              />
            ))}
          </div>
        ))}

        {/* Connection lines overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
          <motion.line
            x1="15%" y1="50%" x2="35%" y2="30%"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.line
            x1="15%" y1="50%" x2="35%" y2="70%"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.line
            x1="65%" y1="40%" x2="85%" y2="35%"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
          <motion.line
            x1="65%" y1="60%" x2="85%" y2="65%"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
          />
        </svg>
      </div>
    </div>
  );
});
NeuralNetworkMockup.displayName = 'NeuralNetworkMockup';

// Animated Multimodal Mockup (for text + image fusion projects)
const MultimodalMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-20">
        {/* Text input - left top */}
        <motion.div
          className="absolute left-0 top-0 w-10 h-8 bg-gradient-to-br from-blue-400/50 to-blue-500/50 rounded border border-white/30 overflow-hidden"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="p-1 space-y-0.5">
            <div className="h-0.5 bg-white/50 rounded w-full"></div>
            <div className="h-0.5 bg-white/40 rounded w-3/4"></div>
            <div className="h-0.5 bg-white/40 rounded w-5/6"></div>
          </div>
        </motion.div>

        {/* Image input - left bottom */}
        <motion.div
          className="absolute left-0 bottom-0 w-10 h-8 bg-gradient-to-br from-pink-400/50 to-pink-500/50 rounded border border-white/30 overflow-hidden"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              className="w-4 h-4 border border-white/50 rounded"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-1 h-1 bg-yellow-400/60 rounded-full absolute top-0.5 right-0.5"></div>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-green-400/40 to-transparent"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Fusion arrows */}
        <motion.div
          className="absolute left-11 top-4 w-3 h-0.5 bg-gradient-to-r from-blue-400/60 to-purple-400/60"
          animate={{ scaleX: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-11 bottom-4 w-3 h-0.5 bg-gradient-to-r from-pink-400/60 to-purple-400/60"
          animate={{ scaleX: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />

        {/* Fusion center */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-gradient-to-br from-purple-400/50 to-violet-500/50 rounded-lg border border-white/40"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              className="w-3 h-3 bg-white/40 rounded"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Output arrow */}
        <motion.div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-purple-400/60 to-green-400/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />

        {/* Output labels */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-12 bg-gradient-to-br from-green-400/50 to-emerald-500/50 rounded border border-white/40 overflow-hidden"
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <div className="p-1 space-y-1">
            <motion.div
              className="h-2 bg-orange-400/60 rounded"
              animate={{ width: ['60%', '80%', '60%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="h-2 bg-cyan-400/60 rounded"
              animate={{ width: ['40%', '70%', '40%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="h-2 bg-pink-400/60 rounded"
              animate={{ width: ['70%', '50%', '70%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
});
MultimodalMockup.displayName = 'MultimodalMockup';

// Animated Regression Plot Mockup for Life Expectancy - scatter dots around diagonal line
const RegressionPlotMockup = memo(() => {
  // Generate scatter points that cluster around a diagonal line (y = x)
  const scatterPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 20; i++) {
      const baseX = 10 + (i * 4); // x from 10 to 86
      const baseY = 10 + (i * 4); // Perfect line would be y = x
      // Add some random noise to create scatter around the line
      const noise = (Math.random() - 0.5) * 12;
      points.push({
        x: baseX + (Math.random() - 0.5) * 6,
        y: Math.max(5, Math.min(95, baseY + noise)),
        delay: i * 0.1
      });
    }
    return points;
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-24">
        {/* Axis lines */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30" /> {/* X axis */}
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-white/30" /> {/* Y axis */}

        {/* Regression line (diagonal) */}
        <motion.div
          className="absolute bottom-0 left-0 w-[120%] h-0.5 bg-gradient-to-r from-emerald-400/60 to-teal-400/60 origin-bottom-left"
          style={{ transform: 'rotate(-45deg)' }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Scatter points */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {scatterPoints.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={100 - point.y} // Flip Y axis for proper orientation
              r="2.5"
              fill="rgba(16,185,129,0.8)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: point.delay
              }}
            />
          ))}
        </svg>

        {/* Axis labels */}
        <div className="absolute -bottom-2 left-1/2 text-[6px] text-white/50 -translate-x-1/2">Actual</div>
        <div className="absolute top-1/2 -left-3 text-[6px] text-white/50 -translate-y-1/2 -rotate-90">Predicted</div>
      </div>
    </div>
  );
});
RegressionPlotMockup.displayName = 'RegressionPlotMockup';

// Neural Network 2→3→1 Mockup for Persuasion Detection in Memes
const NeuralNetwork231Mockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-24">
        {/* SVG for connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 96">
          {/* Input to Hidden connections */}
          {/* Node 1 (input) to all hidden nodes */}
          <motion.line x1="18" y1="32" x2="48" y2="20" stroke="rgba(139,92,246,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.line x1="18" y1="32" x2="48" y2="48" stroke="rgba(139,92,246,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
          <motion.line x1="18" y1="32" x2="48" y2="76" stroke="rgba(139,92,246,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
          {/* Node 2 (input) to all hidden nodes */}
          <motion.line x1="18" y1="64" x2="48" y2="20" stroke="rgba(236,72,153,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.1 }} />
          <motion.line x1="18" y1="64" x2="48" y2="48" stroke="rgba(236,72,153,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
          <motion.line x1="18" y1="64" x2="48" y2="76" stroke="rgba(236,72,153,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
          {/* Hidden to Output connections */}
          <motion.line x1="60" y1="20" x2="94" y2="48" stroke="rgba(16,185,129,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
          <motion.line x1="60" y1="48" x2="94" y2="48" stroke="rgba(16,185,129,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
          <motion.line x1="60" y1="76" x2="94" y2="48" stroke="rgba(16,185,129,0.5)" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 1.0 }} />
        </svg>

        {/* Input Layer - 2 nodes */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <motion.div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400/80 to-blue-500/80 border border-white/50 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0 0 rgba(59,130,246,0)', '0 0 8px 2px rgba(59,130,246,0.4)', '0 0 0 0 rgba(59,130,246,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <span className="text-[6px] text-white font-bold">T</span>
          </motion.div>
          <motion.div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400/80 to-pink-500/80 border border-white/50 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0 0 rgba(236,72,153,0)', '0 0 8px 2px rgba(236,72,153,0.4)', '0 0 0 0 rgba(236,72,153,0)'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>
            <span className="text-[6px] text-white font-bold">I</span>
          </motion.div>
        </div>

        {/* Hidden Layer - 3 nodes */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400/70 to-violet-500/70 border border-white/40"
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>

        {/* Output Layer - 1 node */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <motion.div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400/80 to-green-500/80 border-2 border-white/50 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0 0 rgba(16,185,129,0)', '0 0 10px 3px rgba(16,185,129,0.5)', '0 0 0 0 rgba(16,185,129,0)'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
            <span className="text-[6px] text-white font-bold">✓</span>
          </motion.div>
        </div>

        {/* Labels */}
        <div className="absolute -bottom-1 left-2 text-[5px] text-white/40">Input</div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[5px] text-white/40">Hidden</div>
        <div className="absolute -bottom-1 right-2 text-[5px] text-white/40">Output</div>
      </div>
    </div>
  );
});
NeuralNetwork231Mockup.displayName = 'NeuralNetwork231Mockup';

// Coming Soon Mockup - Blurred placeholder
const ComingSoonMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Blurred background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-2 left-4 w-12 h-8 bg-white/20 rounded-lg blur-sm"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-4 right-6 w-8 h-8 bg-white/15 rounded-full blur-sm"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-4 left-8 w-16 h-6 bg-white/15 rounded blur-sm"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-6 right-4 w-10 h-10 bg-white/10 rounded-lg blur-sm"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.8 }}
        />
      </div>

      {/* Question mark icon */}
      <motion.div
        className="relative z-10 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-2xl text-white/60 font-bold">?</span>
      </motion.div>
    </div>
  );
});
ComingSoonMockup.displayName = 'ComingSoonMockup';

// iOS App Mockup for Cliniwatch - Mental Health Companion
const IOSAppMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* iPhone-style frame */}
      <div className="relative w-16 h-28 bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-2xl border-2 border-gray-600/50 overflow-hidden shadow-2xl">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-black rounded-full" />

        {/* Screen content */}
        <div className="absolute top-4 left-1 right-1 bottom-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="h-4 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 flex items-center justify-center">
            <span className="text-[5px] text-white/80 font-semibold">Daily Check-in</span>
          </div>

          {/* Mood emoji */}
          <motion.div className="flex justify-center mt-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-300/80 to-orange-400/80 rounded-full flex items-center justify-center">
              <span className="text-[8px]">😊</span>
            </div>
          </motion.div>

          {/* Mood calendar grid */}
          <div className="mt-2 px-1">
            <div className="grid grid-cols-7 gap-0.5">
              {[...Array(14)].map((_, i) => (
                <motion.div key={i}
                  className={`w-1.5 h-1.5 rounded-sm ${i < 7 ? 'bg-green-400/60' : i < 10 ? 'bg-yellow-400/60' : 'bg-teal-400/40'
                    }`}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </div>
          </div>

          {/* Heartbeat line */}
          <motion.div className="mt-2 mx-1 h-3 overflow-hidden"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}>
            <svg className="w-full h-full" viewBox="0 0 50 12" preserveAspectRatio="none">
              <motion.path
                d="M0,6 L8,6 L10,2 L12,10 L14,6 L22,6 L24,2 L26,10 L28,6 L36,6 L38,2 L40,10 L42,6 L50,6"
                fill="none" stroke="rgba(20,184,166,0.8)" strokeWidth="1"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity }} />
            </svg>
          </motion.div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/30 rounded-full" />
      </div>
    </div>
  );
});
IOSAppMockup.displayName = 'IOSAppMockup';

// Interactive Web Mockup for Portfolio Website
const InteractiveWebMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Browser window frame */}
      <div className="relative w-24 h-20 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/20 overflow-hidden shadow-2xl">
        {/* Browser header */}
        <div className="h-3 bg-gray-700/50 flex items-center px-1 gap-0.5">
          <div className="w-1 h-1 bg-red-400/70 rounded-full" />
          <div className="w-1 h-1 bg-yellow-400/70 rounded-full" />
          <div className="w-1 h-1 bg-green-400/70 rounded-full" />
          <div className="flex-1 mx-1 h-1.5 bg-white/10 rounded" />
        </div>

        {/* Website content - Liquid Glass style */}
        <div className="absolute top-4 left-1 right-1 bottom-1 bg-gradient-to-br from-white/5 to-white/10 rounded overflow-hidden">
          {/* Glassmorphism cards */}
          <div className="p-1 space-y-1">
            <motion.div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded backdrop-blur-sm border border-white/10"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }} />
            <div className="flex gap-1">
              <motion.div className="flex-1 h-6 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded border border-white/10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="flex-1 h-6 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded border border-white/10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            </div>
          </div>

          {/* Floating glass effect */}
          <motion.div className="absolute top-2 right-1 w-3 h-3 bg-white/10 rounded-full backdrop-blur"
            animate={{ y: [-2, 2, -2], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }} />
        </div>
      </div>
    </div>
  );
});
InteractiveWebMockup.displayName = 'InteractiveWebMockup';

// LLM Detection Mockup for Privacy Violation Detection
const LLMDetectionMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-20">
        {/* Document input */}
        <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-10 bg-gradient-to-br from-blue-400/50 to-blue-500/50 rounded border border-white/30"
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <div className="p-1 space-y-0.5">
            <div className="h-0.5 bg-white/50 rounded w-full" />
            <div className="h-0.5 bg-white/40 rounded w-3/4" />
            <div className="h-0.5 bg-red-400/60 rounded w-1/2" />
            <div className="h-0.5 bg-white/40 rounded w-full" />
            <div className="h-0.5 bg-white/30 rounded w-2/3" />
          </div>
        </motion.div>

        {/* Arrow to LLM */}
        <motion.div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-blue-400/60 to-purple-400/60"
          animate={{ scaleX: [0.8, 1.1, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }} />

        {/* LLM Brain */}
        <motion.div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-purple-400/50 to-violet-500/50 rounded-lg border border-white/40"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}>
          <div className="w-full h-full flex items-center justify-center">
            <motion.div className="text-[10px] text-white/80"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              🧠
            </motion.div>
          </div>
          {/* Processing indicator */}
          <motion.div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-400/0 via-purple-400/60 to-purple-400/0 rounded"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }} />
        </motion.div>

        {/* Arrow to output */}
        <motion.div className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-purple-400/60 to-red-400/60"
          animate={{ scaleX: [0.8, 1.1, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />

        {/* Alert output */}
        <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-8 bg-gradient-to-br from-red-400/50 to-orange-500/50 rounded border border-white/30 flex items-center justify-center"
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
          <motion.div className="text-[12px]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}>
            ⚠️
          </motion.div>
        </motion.div>

        {/* Labels */}
        <div className="absolute -bottom-2 left-1 text-[5px] text-white/40">Post</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[5px] text-white/40">LLM</div>
        <div className="absolute -bottom-2 right-1 text-[5px] text-white/40">Alert</div>
      </div>
    </div>
  );
});
LLMDetectionMockup.displayName = 'LLMDetectionMockup';

// Interactive Dashboard Mockup for data exploration projects (like CO2 & GDP Explorer)
const DashboardMockup = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-20">
        {/* Main dashboard container */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 overflow-hidden">
          {/* Header bar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-white/10 border-b border-white/10 flex items-center px-1 gap-0.5">
            <div className="w-1 h-1 bg-green-400/70 rounded-full"></div>
            <div className="w-1 h-1 bg-yellow-400/70 rounded-full"></div>
            <div className="w-1 h-1 bg-red-400/70 rounded-full"></div>
          </div>

          {/* Dashboard content */}
          <div className="absolute top-4 left-1 right-1 bottom-1 flex gap-1">
            {/* Left panel - Mini map */}
            <div className="w-10 h-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded border border-white/15 relative overflow-hidden">
              {/* Map representation */}
              <motion.div
                className="absolute top-1 left-1 w-2 h-1.5 bg-green-400/50 rounded-sm"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-2 right-1 w-3 h-2 bg-orange-400/50 rounded-sm"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="absolute bottom-2 left-2 w-2 h-1.5 bg-yellow-400/50 rounded-sm"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
            </div>

            {/* Right panel - Charts */}
            <div className="flex-1 flex flex-col gap-1">
              {/* Line chart */}
              <div className="flex-1 bg-gradient-to-br from-white/5 to-transparent rounded border border-white/10 relative overflow-hidden p-0.5">
                <svg className="w-full h-full" viewBox="0 0 40 20" preserveAspectRatio="none">
                  <motion.path
                    d="M0,15 Q10,10 20,12 T40,5"
                    fill="none"
                    stroke="rgba(34,197,94,0.7)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                  />
                  <motion.path
                    d="M0,18 Q10,14 20,16 T40,10"
                    fill="none"
                    stroke="rgba(251,191,36,0.6)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "loop", delay: 0.3 }}
                  />
                </svg>
              </div>

              {/* Bar chart */}
              <div className="h-6 bg-gradient-to-br from-white/5 to-transparent rounded border border-white/10 flex items-end justify-center gap-0.5 p-0.5">
                <motion.div
                  className="w-1.5 bg-gradient-to-t from-orange-400/70 to-orange-300/50 rounded-t"
                  animate={{ height: ['30%', '60%', '30%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="w-1.5 bg-gradient-to-t from-orange-400/70 to-orange-300/50 rounded-t"
                  animate={{ height: ['50%', '80%', '50%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 bg-gradient-to-t from-orange-400/70 to-orange-300/50 rounded-t"
                  animate={{ height: ['70%', '40%', '70%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
                <motion.div
                  className="w-1.5 bg-gradient-to-t from-orange-400/70 to-orange-300/50 rounded-t"
                  animate={{ height: ['40%', '90%', '40%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
DashboardMockup.displayName = 'DashboardMockup';

// Device mockup component
const DeviceMockup = memo(({ type, color }: { type: string; color: string }) => {
  if (type === 'ui-ux') {
    return (
      <div className="flex space-x-2 items-end">
        <div className={`w-14 h-24 ${color} rounded-lg border border-white/40 relative overflow-hidden`}>
          <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
          <div className="absolute top-4 left-2 right-2 space-y-1">
            <div className="h-8 bg-orange-400/80 rounded"></div>
            <div className="h-2 bg-white/40 rounded w-3/4"></div>
            <div className="h-2 bg-white/30 rounded w-1/2"></div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full"></div>
        </div>
        <div className={`w-12 h-20 ${color} rounded-md border border-white/30 relative overflow-hidden`}>
          <div className="absolute top-1 left-1 right-1 space-y-1">
            <div className="h-6 bg-orange-400/60 rounded"></div>
            <div className="h-1 bg-white/30 rounded"></div>
            <div className="h-1 bg-white/20 rounded w-2/3"></div>
          </div>
        </div>
        <div className={`w-10 h-16 ${color} rounded border border-white/20 relative overflow-hidden`}>
          <div className="absolute top-1 left-1 right-1 space-y-0.5">
            <div className="h-4 bg-orange-400/40 rounded"></div>
            <div className="h-0.5 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'web') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-20 h-16 ${color} rounded border border-white/40 relative overflow-hidden`}>
          <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded"></div>
          <div className="absolute top-3 left-1 right-1 space-y-1">
            <div className="h-3 bg-orange-400/80 rounded"></div>
            <div className="flex space-x-1">
              <div className="h-6 bg-orange-500/60 rounded flex-1"></div>
              <div className="h-6 bg-orange-400/40 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'paper') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-18 h-20 ${color} rounded border border-white/40 relative overflow-hidden shadow-lg`}>
          {/* Paper header with title area */}
          <div className="absolute top-1 left-1 right-1 h-2 bg-white/40 rounded-sm"></div>
          <div className="absolute top-4 left-1 right-1 h-1 bg-white/25 rounded-sm"></div>

          {/* Abstract/content lines */}
          <div className="absolute top-6 left-1 right-1 space-y-0.5">
            <div className="h-0.5 bg-orange-400/60 rounded w-full"></div>
            <div className="h-0.5 bg-white/30 rounded w-5/6"></div>
            <div className="h-0.5 bg-white/30 rounded w-4/5"></div>
            <div className="h-0.5 bg-white/30 rounded w-full"></div>
            <div className="h-0.5 bg-white/30 rounded w-3/4"></div>
          </div>

          {/* Chart/graph representation */}
          <div className="absolute bottom-3 left-1 right-1 h-6 bg-gradient-to-t from-orange-400/40 to-orange-300/20 rounded-sm flex items-end justify-center space-x-0.5">
            <div className="w-1 h-2 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-4 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-3 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-5 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-2 bg-orange-500/70 rounded-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-1 items-center">
      <div className={`w-16 h-20 ${color} rounded border border-white/40 relative overflow-hidden`}>
        <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded"></div>
        <div className="absolute top-3 left-1 right-1 space-y-1">
          <div className="h-4 bg-orange-400/80 rounded"></div>
          <div className="h-1 bg-white/40 rounded"></div>
          <div className="h-1 bg-white/30 rounded w-3/4"></div>
          <div className="h-6 bg-orange-500/60 rounded"></div>
        </div>
      </div>
      <div className={`w-12 h-16 ${color} rounded border border-white/30 relative overflow-hidden`}>
        <div className="absolute top-1 left-1 right-1 space-y-0.5">
          <div className="h-3 bg-orange-400/60 rounded"></div>
          <div className="h-0.5 bg-white/30 rounded"></div>
          <div className="h-4 bg-orange-500/40 rounded"></div>
        </div>
      </div>
    </div>
  );
});
DeviceMockup.displayName = 'DeviceMockup';

const useResponsiveCards = (containerRef: React.RefObject<HTMLDivElement | null>, totalCards: number) => {
  const [layout, setLayout] = useState({
    visibleCards: 2,
    cardWidth: 500,
    viewportWidth: 1200
  });

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;

      // Base all calcs on the container width
      const containerWidth = containerRef.current.clientWidth;

      const sideButtonSpace = containerWidth < 640 ? 0 : 56; // keep wider margins on desktop
      const viewportMargin = containerWidth < 640 ? 16 : 32;
      const cardGap = containerWidth < 640 ? 12 : 24;

      // Available width strictly for cards area
      const viewportWidthRaw = containerWidth - (sideButtonSpace * 2) - viewportMargin;
      const viewportWidth = Math.max(280, viewportWidthRaw);

      // How many cards can fit (up to 3) given a minimum card width
      const maxCards = Math.max(1, Math.min(3, totalCards || 1));
      const minCard = containerWidth < 480 ? 250 : containerWidth < 640 ? 280 : containerWidth < 1024 ? 340 : 360;

      let computedVisible = 1;
      for (let n = maxCards; n >= 1; n--) {
        const needed = n * minCard + (n - 1) * cardGap;
        if (viewportWidth >= needed) {
          computedVisible = n;
          break;
        }
      }

      // Compute base card width to fill the viewport evenly
      const baseCardWidth = Math.floor((viewportWidth - (computedVisible - 1) * cardGap) / computedVisible);

      // NEW: clamp single-card width and shrink viewport to match
      const SINGLE_CARD_MAX = 520;  // <- tweak to taste
      const SINGLE_CARD_MIN = minCard; // keep your existing min size
      const finalCardWidth =
        computedVisible === 1
          ? Math.max(SINGLE_CARD_MIN, Math.min(SINGLE_CARD_MAX, baseCardWidth))
          : baseCardWidth;

      const finalViewportWidth =
        computedVisible === 1 ? finalCardWidth : viewportWidth;

      setLayout({
        visibleCards: computedVisible,
        cardWidth: finalCardWidth,
        viewportWidth: finalViewportWidth
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [containerRef, totalCards]);

  return layout;
};

// ProjectCard component with navigation functionality
const ProjectCard = memo(({ project, index, cardWidth }: { project: typeof projects[0]; index: number; cardWidth: number; }) => {
  const cardHeight = 380; // Increased from 340px to 380px for more height
  const [isHovered, setIsHovered] = useState(false);

  // Special liquid glass configuration for the liquid glass project
  const isLiquidGlassProject = project.slug === 'liquid-glass-design';
  const isComingSoon = project.comingSoon === true;

  // Handle project card click - navigate to project detail page
  const handleProjectClick = () => {
    // Don't navigate for coming soon projects
    if (isComingSoon) return;
    // Navigate using the router utility
    navigateTo(`/projects/${project.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
      style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, maxWidth: '100%' }}
      className={`group perspective-1000 mx-auto flex-shrink-0 ${isComingSoon ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={handleProjectClick}
      onMouseEnter={() => { setIsHovered(true); hudLog(`> hover: ${project.title}`); }}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={isComingSoon ? {} : {
        scale: 1.02,
        rotateY: index % 2 === 0 ? 2 : -2,
        transition: { duration: 0.3 }
      }}
    >
      <LiquidGlass
        width={cardWidth}
        height={cardHeight}
        positioning="relative"
        style={{ borderRadius: '18px' }}
        elasticity={0.15}
        saturation={isHovered ? 180 : 150}
        aberrationIntensity={isHovered ? 1.5 : 1.2}
        displacementScale={isHovered ? 80 : 60}
        blurAmount={isHovered ? 4 : 3}
        mode='shader'
      >
          <div className="detail-readable w-full h-full flex flex-col relative p-4 sm:p-6 overflow-hidden">
            {/* Coming Soon overlay */}
            {isComingSoon && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div
                  className="px-6 py-3 bg-white/30 backdrop-blur-md rounded-full border-2 border-white/50 shadow-2xl"
                  style={{
                    boxShadow: '0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.1)'
                  }}
                >
                  <span className="text-base font-bold text-white tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.5)' }}>Coming Soon</span>
                </div>
              </div>
            )}
            {/* Enhanced background effects based on project type */}
            {isComingSoon ? (
              <div className="absolute inset-0 opacity-[0.12]">
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-400/30 to-transparent rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2],
                    x: [0, -15, 0],
                    y: [0, 15, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-500/30 to-transparent rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                    x: [0, 20, 0],
                    y: [0, -20, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-r from-gray-400/20 to-transparent rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.4, 0.1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
              </div>
            ) : isLiquidGlassProject ? (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/30 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/30 to-transparent rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-r from-pink-400/20 to-transparent rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            ) : project.category === 'Machine Learning' ? (
              <div className="absolute inset-0 opacity-[0.12]">
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/40 to-transparent rounded-full blur-xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/40 to-transparent rounded-full blur-xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-violet-400/30 to-transparent rounded-full blur-xl"
                  animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
              </div>
            ) : project.category === 'Data Science' ? (
              <div className="absolute inset-0 opacity-[0.12]">
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/40 to-transparent rounded-full blur-xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/40 to-transparent rounded-full blur-xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-l from-green-400/30 to-transparent rounded-full blur-xl"
                  animate={{ x: [10, -10, 10], y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </div>
            ) : project.category === 'Research' ? (
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/30 to-transparent rounded-full blur-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/30 to-transparent rounded-full blur-xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 opacity-[0.08]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-xl"></div>
              </div>
            )}
            {isComingSoon ? (
              <div
                className="relative z-10 mb-3 select-none"
                style={{ filter: 'url(#pixelate-filter)' }}
              >
                <div className="flex items-start justify-between mb-2 min-h-[52px] gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] leading-tight flex-1 line-clamp-2 break-words">
                    Mystery Project Title Here
                  </h3>
                  <motion.span
                    className="px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10 flex-shrink-0 whitespace-nowrap mt-0.5"
                    style={{ filter: 'url(#pixelate-filter)' }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [0.95, 1.05, 0.95]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    Category
                  </motion.span>
                </div>
                <div className="max-h-[72px] overflow-hidden">
                  <p className="text-[10px] sm:text-[11px] text-white/70 leading-[1.5] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] line-clamp-3 break-words">
                    This is a placeholder description for an exciting new project that is currently in development. Stay tuned for more details coming soon.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative z-10 mb-3">
                <div className="flex items-start justify-between mb-2 min-h-[52px] gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] leading-tight flex-1 line-clamp-2 break-words">
                    {project.title}
                  </h3>
                  <span className="px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10 flex-shrink-0 whitespace-nowrap mt-0.5">
                    {project.category}
                  </span>
                </div>
                <div className="max-h-[72px] overflow-hidden">
                  <p className="text-[10px] sm:text-[11px] text-white/70 leading-[1.5] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] line-clamp-3 break-words">
                    {project.description}
                  </p>
                </div>
              </div>
            )}
            {isComingSoon ? (
              <div
                className="flex-1 flex items-center justify-center mb-4 relative h-[128px] sm:h-[140px]"
                style={{ filter: 'url(#pixelate-filter)' }}
              >
                {/* Coming Soon blurred mockup */}
                <div className="relative w-full h-32 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-2xl backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl">
                  <div className="absolute inset-4 flex items-center justify-center">
                    <ComingSoonMockup />
                  </div>
                  <div className="absolute top-3 left-3 w-2 h-2 bg-gray-400/60 rounded-full" />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-gray-400/60 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center mb-4 relative h-[128px] sm:h-[140px]">
                {isLiquidGlassProject ? (
                  // Special liquid glass showcase
                  <div className="relative w-full h-32 grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl relative">
                      <div className="absolute inset-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border border-white/60 border-t-transparent rounded-full"
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl relative">
                      <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-3 h-3 bg-white/50 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl relative">
                      <div className="absolute inset-2 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-lg flex items-center justify-center">
                        <motion.div
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-2 h-6 bg-white/50 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ) : project.slug === 'job-ads-data-parsing' ? (
                  // Data Pipeline visualization for Job Ads project
                  <div className="relative w-full h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl backdrop-blur-sm border border-cyan-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <DataPipelineMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-cyan-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-green-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-2 h-2 bg-blue-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                ) : project.slug === 'co2-gdp-explorer' ? (
                  // Interactive Dashboard visualization for CO2 & GDP Explorer
                  <div className="relative w-full h-32 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-2xl backdrop-blur-sm border border-blue-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <DashboardMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-blue-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-green-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-2 h-2 bg-teal-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                ) : project.slug === 'blipt' ? (
                  // Logo-first hero for Blipt
                  <div className="relative w-full h-32 bg-gradient-to-br from-violet-500/12 via-purple-500/10 to-fuchsia-500/12 rounded-2xl backdrop-blur-sm border border-violet-300/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
                    <div className="absolute inset-3 flex items-center justify-center">
                      <motion.img
                        src="/blipt-icon.png"
                        alt="Blipt logo"
                        className="max-h-full max-w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-violet-300/70 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-pink-300/70 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-2 h-2 bg-orange-300/70 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                ) : project.slug === 'cliniwatch' ? (
                  // iOS App visualization for Cliniwatch
                  <div className="relative w-full h-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl backdrop-blur-sm border border-teal-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-2 flex items-center justify-center">
                      <IOSAppMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-teal-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-cyan-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                ) : project.slug === 'interactive-portfolio' ? (
                  // Web visualization for Interactive Portfolio
                  <div className="relative w-full h-32 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-2xl backdrop-blur-sm border border-orange-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <InteractiveWebMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-orange-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-pink-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                ) : project.slug === 'software-engineering-project' ? (
                  // LLM Detection visualization
                  <div className="relative w-full h-32 bg-gradient-to-br from-purple-500/10 to-red-500/10 rounded-2xl backdrop-blur-sm border border-purple-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <LLMDetectionMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-purple-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-red-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                ) : project.slug === 'life-expectancy-prediction' ? (
                  // Regression Plot visualization for Life Expectancy
                  <div className="relative w-full h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl backdrop-blur-sm border border-emerald-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <RegressionPlotMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-emerald-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-teal-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                ) : project.slug === 'persuasion-detection-memes' ? (
                  // Neural Network 2-3-1 visualization for Persuasion Detection
                  <div className="relative w-full h-32 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl backdrop-blur-sm border border-purple-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <NeuralNetwork231Mockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-purple-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-pink-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-2 h-2 bg-violet-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                ) : project.category === 'Machine Learning' ? (
                  // Neural Network visualization for other ML projects
                  <div className="relative w-full h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl backdrop-blur-sm border border-indigo-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <NeuralNetworkMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-indigo-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-purple-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-2 h-2 bg-blue-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                ) : project.category === 'Data Science' ? (
                  // Data Pipeline visualization for other Data Science projects
                  <div className="relative w-full h-32 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl backdrop-blur-sm border border-cyan-400/20 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <DataPipelineMockup />
                    </div>
                    <motion.div
                      className="absolute top-3 left-3 w-2 h-2 bg-cyan-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-3 right-3 w-2 h-2 bg-teal-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-2 h-2 bg-green-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                ) : (
                  // Standard mockup for other projects
                  <div className="relative w-full h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl">
                    <div className="absolute inset-4 flex items-center justify-center">
                      <DeviceMockup type={project.mockupType} color="bg-white/30" />
                    </div>
                    <div className="absolute top-3 left-3 w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
                    <div className="absolute top-3 right-3 w-2 h-2 bg-orange-400/60 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute bottom-3 left-3 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse delay-700"></div>
                  </div>
                )}
              </div>
            )}
            {isComingSoon ? (
              <div
                className="relative z-10 flex items-center justify-between mt-auto select-none"
                style={{ filter: 'url(#pixelate-filter)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {['Tech 1', 'Tech 2', 'Tech 3'].map((tech, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 bg-white/10 text-white/80 rounded-full backdrop-blur-sm border border-white/5 shadow-2xl relative whitespace-nowrap">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-between mt-auto">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <motion.span key={i} className="text-[10px] sm:text-[11px] px-2.5 py-1 bg-white/10 text-white/80 rounded-full backdrop-blur-sm border border-white/5 shadow-2xl relative whitespace-nowrap" whileHover={{ scale: 1.05 }}>
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <motion.div
                  className="ml-4 p-2.5 bg-white/15 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors duration-300"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? 45 : 0
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    transformOrigin: "center"
                  }}
                >
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white transition-colors duration-300"
                    animate={{
                      rotate: isHovered ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                      duration: isHovered ? 0.6 : 0.3,
                      ease: "easeInOut",
                      repeat: isHovered ? Infinity : 0,
                      repeatDelay: isHovered ? 2 : 0
                    }}
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7L17 7L17 17" />
                  </motion.svg>
                </motion.div>
              </div>
            )}
          </div>
      </LiquidGlass>
    </motion.div>
  );
});
ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  useComponentLoader('ProjectsSection');
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Create a ref for the slider container
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Single, correct call to the hook with the ref
  const { visibleCards, cardWidth, viewportWidth } = useResponsiveCards(sliderContainerRef, projects.length);

  const totalCards = projects.length;
  const totalPages = Math.ceil(totalCards / visibleCards);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const handlePrevious = () => setCurrentPage((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  const handleDotClick = (pageIndex: number) => setCurrentPage(pageIndex);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const swipeDistanceX = touchStartXRef.current - endX;
    const swipeDistanceY = Math.abs(touchStartYRef.current - endY);
    const swipeThreshold = 45;

    // Only register horizontal swipe if it's more horizontal than vertical
    if (Math.abs(swipeDistanceX) > swipeDistanceY && Math.abs(swipeDistanceX) > swipeThreshold) {
      if (swipeDistanceX > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const getVisibleProjects = () => {
    const startIndex = currentPage * visibleCards;
    return projects.slice(startIndex, startIndex + visibleCards);
  };
  const visibleProjects = getVisibleProjects();

  const isPrevDisabled = currentPage === 0;
  const isNextDisabled = currentPage >= totalPages - 1;
  const navControlWidth = Math.min(200, Math.max(168, viewportWidth - 40));

  return (
    <motion.section
      id="projects"
      className="relative min-h-[100svh] box-border flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 w-full"
    >
      <StickySectionBackground variant="projects" />
      {/* SVG filter for pixelated effect */}
      <PixelateFilter />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="hero-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300" />
              Selected projects
            </span>
          </motion.div>
          <h2 className="relative inline-block font-display font-extrabold text-[clamp(2.5rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.04em] text-white mb-4 [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
            Featured&nbsp;Work
          </h2>
          <p className="text-lg text-white/75 max-w-2xl mx-auto font-body-grotesk [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
            Explore my latest projects and creative solutions
          </p>
        </motion.div>

        {/* Attach the ref to this container */}
        <div ref={sliderContainerRef} className="w-full flex items-center justify-center mb-8 px-1 sm:px-4">
          {/* Cards Viewport */}
          <div className="flex justify-center items-center mx-auto w-full" style={{ maxWidth: `${viewportWidth}px` }}>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex gap-4 md:gap-6 justify-center items-center carousel-swipe-area"
              style={{ minHeight: viewportWidth < 640 ? '430px' : '460px', touchAction: 'pan-y pinch-zoom' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  cardWidth={cardWidth}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Navigation Bar with Arrows and Dots */}
        <div className="flex justify-center items-center mb-6 mx-auto w-full" style={{ maxWidth: `${viewportWidth}px` }}>
          <LiquidGlass
            width={navControlWidth}
            height={48}
            positioning="relative"
            style={{ borderRadius: '24px' }}
            elasticity={0.15}
            saturation={150}
            aberrationIntensity={1.2}
            displacementScale={60}
            blurAmount={3}
            mode="shader"
            overLight={false}
          >
            <div className="flex items-center justify-center gap-4 px-4">
              {/* Left Arrow */}
              <motion.button
                onClick={handlePrevious}
                disabled={isPrevDisabled}
                className={`p-1.5 rounded-full transition-all ${isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
                whileHover={{ scale: isPrevDisabled ? 1 : 1.1 }}
                whileTap={{ scale: isPrevDisabled ? 1 : 0.9 }}
                aria-label="Previous project"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                  <path d="M15 18L9 12L15 6" />
                </svg>
              </motion.button>

              {/* Navigation Dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, pageIndex) => {
                  const isActive = currentPage === pageIndex;
                  return (
                    <motion.button
                      key={`dot-${pageIndex}`}
                      onClick={() => handleDotClick(pageIndex)}
                      className={`h-2 rounded-full transition-all duration-300 ${isActive
                        ? 'bg-white w-6'
                        : 'bg-white/40 hover:bg-white/60 w-2'
                        }`}
                      whileHover={{ scale: isActive ? 1.05 : 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  );
                })}
              </div>

              {/* Right Arrow */}
              <motion.button
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`p-1.5 rounded-full transition-all ${isNextDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
                whileHover={{ scale: isNextDisabled ? 1 : 1.1 }}
                whileTap={{ scale: isNextDisabled ? 1 : 0.9 }}
                aria-label="Next project"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                  <path d="M9 18L15 12L9 6" />
                </svg>
              </motion.button>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </motion.section>
  );
};

export default memo(ProjectsSection);
