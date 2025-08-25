import React, { useState } from 'react';
import AssistantOrb from './AssistantOrb';
import LiquidGlass from './LiquidGlass';

interface AssistantIconProps {
  onClick?: () => void;
  isThinking?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

const AssistantIcon: React.FC<AssistantIconProps> = ({ onClick, isThinking = false, onMouseDown, onMouseUp }) => {
  const [isHovered, setIsHovered] = useState(false);

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
        width={130}
        height={130}
        positioning="relative"
        style={{ borderRadius: '50%', cursor: 'pointer' }}
        className="hover:bg-white/20"
        aberrationIntensity={1}
        elasticity={0.2}
        blurAmount={12}
        saturation={150}
        displacementScale={50}
        mode='shader'
        overLight={false}
      >
        <AssistantOrb isHovered={isHovered} isThinking={isThinking} />
      </LiquidGlass>
    </div>
  );
};

export default AssistantIcon;