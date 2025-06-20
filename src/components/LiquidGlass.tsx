import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { motion } from 'framer-motion'; // Import framer-motion

// Utility functions (no changes)
function smoothStep(a: number, b: number, t: number) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number) {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x: number, y: number) {
  return { type: 't', x, y };
}

interface LiquidGlassProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  positioning?: 'fixed' | 'relative';
  blur?: number;
  isElastic?: boolean;
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  width = 300,
  height = 200,
  className,
  style,
  positioning = 'relative',
  blur = 10,
  isElastic = true,
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [filterAttrs, setFilterAttrs] = useState({ href: TRANSPARENT_PIXEL, scale: 50 });

  // State for the new shine effect
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Draggability logic (no changes)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - width / 2, y: window.innerHeight / 2 - height / 2 });

  const fragmentShader = useCallback((uv: { x: number; y: number }) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
    const scaled = smoothStep(0, 1, displacement);
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  }, []);

  useEffect(() => {
    // ... (shader generation logic remains the same)
    const w = Math.round(width);
    const h = Math.round(height);
    if (w === 0 || h === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d');
    if (!context) return;
    const data = new Uint8ClampedArray(w * h * 4);
    let maxScale = 0;
    const rawValues: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pos = fragmentShader({ x: x / w, y: y / h });
        const dx = pos.x * w - x;
        const dy = pos.y * h - y;
        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
        rawValues.push(dx, dy);
      }
    }
    maxScale = Math.max(1, maxScale * 0.5);
    let index = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const pixelIndex = (y * w + x) * 4;
            const r = rawValues[index++] / maxScale + 0.5;
            const g = rawValues[index++] / maxScale + 0.5;
            data[pixelIndex] = r * 255;
            data[pixelIndex + 1] = g * 255;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 255;
        }
    }
    context.putImageData(new ImageData(data, w, h), 0, 0);
    setFilterAttrs({
        href: canvas.toDataURL(),
        scale: maxScale,
    });
  }, [width, height, fragmentShader]);
  
  // Handlers for dragging (no changes)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (positioning !== 'fixed') return;
    isDragging.current = true;
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
    }
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { x: position.x, y: position.y };
    e.preventDefault();
  };
  const handleMouseMoveDraggable = useCallback((e: MouseEvent) => {
    if (positioning === 'fixed' && isDragging.current) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      const newX = initialPosition.current.x + deltaX;
      const newY = initialPosition.current.y + deltaY;
      const constrainedX = Math.max(10, Math.min(window.innerWidth - width - 10, newX));
      const constrainedY = Math.max(10, Math.min(window.innerHeight - height - 10, newY));
      setPosition({ x: constrainedX, y: constrainedY });
    }
  }, [width, height, positioning]);
  const handleMouseUp = useCallback(() => {
    if (positioning !== 'fixed') return;
    isDragging.current = false;
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
    }
  }, [positioning]);
  useEffect(() => {
    if (positioning === 'fixed') {
        document.addEventListener('mousemove', handleMouseMoveDraggable);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMoveDraggable);
          document.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, [handleMouseMoveDraggable, handleMouseUp, positioning]);
  
  // Handler for the new shine effect
  const handleMouseMoveShine = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const containerStyle: React.CSSProperties = {
    ...style,
    position: positioning,
    width: `${width}px`,
    height: `${height}px`,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15)',
    backdropFilter: `url(#${id}) blur(${blur}px) contrast(1.2) brightness(1.05) saturate(1.1)`,
    WebkitBackdropFilter: `url(#${id}) blur(${blur}px) contrast(1.2) brightness(1.05) saturate(1)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (positioning === 'fixed') {
    containerStyle.top = `${position.y}px`;
    containerStyle.left = `${position.x}px`;
    containerStyle.zIndex = 9999;
    containerStyle.cursor = 'grab';
  }

  // Style for the shine overlay
  const shineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%)`,
    opacity: isHovering ? 1 : 0,
    transition: 'opacity 0.15s ease-out',
    pointerEvents: 'none',
  };

  const motionProps = isElastic
    ? {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <>
      <svg width="0" height="0" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
        <defs>
          <filter id={id} filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            <feImage href={filterAttrs.href} width="100%" height="100%" result="map" preserveAspectRatio="none"/>
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale={filterAttrs.scale} />
          </filter>
        </defs>
      </svg>
      <motion.div
        ref={containerRef}
        className={className}
        onMouseDown={handleMouseDown}
        style={containerStyle}
        // Handlers for shine effect
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMoveShine}
        {...motionProps}
      >
        {children}
        <div style={shineStyle} />
      </motion.div>
    </>
  );
};

export default LiquidGlass;