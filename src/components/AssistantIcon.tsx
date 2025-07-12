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

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        width: '200px',
        height: '200px',
        position: 'relative',
        zIndex: 10,

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
      >
        <AssistantOrb isHovered={isHovered} isThinking={isThinking} />
      </LiquidGlass>
    </div>
  );
};

export default AssistantIcon;