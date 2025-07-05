import React, { useState } from 'react';
import AssistantOrb from './AssistantOrb';

interface AssistantIconProps {
  onClick?: () => void;
  isThinking?: boolean;
}

const AssistantIcon: React.FC<AssistantIconProps> = ({ onClick, isThinking = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        width: '200px',
        height: '200px',
        position: 'relative',
        zIndex: 10,
        transition: 'transform 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <AssistantOrb isHovered={isHovered} isThinking={isThinking} />
    </div>
  );
};

export default AssistantIcon;