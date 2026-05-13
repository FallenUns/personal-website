import React, { useState } from 'react';
import AssistantOrb from './AssistantOrb';
import LiquidGlass from './LiquidGlass';

// Lightweight inline hook — matches the same `<768 px` threshold the rest of
// the site uses for mobile gates (TerminalHud, CameraWheel).
const useIsMobile = () => {
  const [m, setM] = useState<boolean>(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(max-width: 768px)').matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setM(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return m;
};

interface AssistantIconProps {
  onClick?: () => void;
  isThinking?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

const AssistantIcon: React.FC<AssistantIconProps> = ({ onClick, isThinking = false, onMouseDown, onMouseUp }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Mobile orb is smaller (104 px vs 130 px) but not so small that the
  // LiquidGlass refraction reads as nothing — at 88 px the displacement was
  // so subtle the user said the glass had disappeared. 104 px is a 20%
  // reduction with enough surface for the shader's edge refraction + rim
  // highlight to be visible against the aurora.
  const isMobile = useIsMobile();
  const orbSize = isMobile ? 104 : 130;

  const handleTouchStart = () => {
    setIsHovered(true);
    onMouseDown?.();
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    onMouseUp?.();
    onClick?.();
  };

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        zIndex: 20,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <LiquidGlass
        width={orbSize}
        height={orbSize}
        positioning="relative"
        style={{ borderRadius: '50%', cursor: 'pointer' }}
        className="hover:bg-white/20"
        // Mobile: pump up the glass effect so refraction is still legible
        // at a smaller surface. Desktop keeps the original tuning.
        aberrationIntensity={isMobile ? 1.8 : (isHovered ? 1.5 : 1.2)}
        elasticity={0.15}
        blurAmount={isMobile ? 5 : (isHovered ? 4 : 3)}
        saturation={isMobile ? 170 : 150}
        displacementScale={isMobile ? 90 : (isHovered ? 80 : 60)}
        mode='shader'
        overLight={false}
      >
        <AssistantOrb isHovered={isHovered} isThinking={isThinking} />
      </LiquidGlass>
    </div>
  );
};

export default AssistantIcon;
