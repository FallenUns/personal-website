import React from 'react';
import { motion } from 'framer-motion';

interface SkyState {
  gradientClass: string;
  sunPosition: { x: string; y: string };
  sunColor: string;
}

// UPDATED: Replaced the vibrant colors with a more muted, gentle palette
const getSkyState = (hour: number): SkyState => {
  let gradientClass: string;
  let sunColor: string;

  if (hour >= 5 && hour < 8) { // Sunrise
    gradientClass = 'bg-gradient-to-b from-slate-500 via-gray-400 to-stone-400';
    sunColor = 'bg-amber-200/60';
  } else if (hour >= 8 && hour < 17) { // Daytime
    gradientClass = 'bg-gradient-to-b from-sky-300 to-slate-300';
    sunColor = 'bg-yellow-100/70';
  } else if (hour >= 17 && hour < 20) { // Sunset
    gradientClass = 'bg-gradient-to-b from-orange-300 via-rose-300 to-slate-500';
    sunColor = 'bg-red-300/70';
  } else { // Night
    gradientClass = 'bg-gradient-to-b from-slate-900 to-slate-800';
    sunColor = 'bg-gray-200/80'; // Moon
  }

  const normalizedTime = (hour - 5) / 15;
  const yPath = 4 * normalizedTime * (1 - normalizedTime);
  let sunY = 100 - yPath * 120;
  sunY = Math.max(-20, Math.min(110, sunY));

  return {
    gradientClass,
    sunPosition: { x: `${((hour - 4) / 16) * 100}%`, y: `${sunY}%` },
    sunColor,
  };
};

interface DynamicSkyBackgroundProps {
  hour: number;
}

const DynamicSkyBackground: React.FC<DynamicSkyBackgroundProps> = ({ hour }) => {
  const sky = getSkyState(hour);
  const isNightTime = hour >= 20 || hour < 5;

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden">
      <motion.div
        className={`absolute inset-0 transition-colors duration-1000 ${sky.gradientClass}`}
        key={sky.gradientClass}
      />
      <motion.div
        className={`absolute rounded-full w-32 h-32 shadow-2xl ${sky.sunColor}`}
        style={{
            top: sky.sunPosition.y,
            left: sky.sunPosition.x,
            transform: 'translate(-50%, -50%)',
            filter: `blur(${isNightTime ? '4px' : '8px'})`, // Adjusted blur for new palette
        }}
        animate={{
            top: sky.sunPosition.y,
            left: sky.sunPosition.x,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        key={hour}
      />
    </div>
  );
};

export default DynamicSkyBackground;