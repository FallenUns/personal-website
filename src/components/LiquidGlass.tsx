import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion'; // Import framer-motion

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
  elasticity?: number;
  aberrationIntensity?: number;
  // --- NEW PROPS ---
  hasBorder?: boolean;
  borderWidth?: number;
  borderColor?: string;
  edgeRefraction?: number;
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
  elasticity = 0.15,
  aberrationIntensity = 0.75,
  // --- NEW PROPS DEFAULTS ---
  hasBorder = false,
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.5)',
  edgeRefraction = 0.3,
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [filterAttrs, setFilterAttrs] = useState({ href: TRANSPARENT_PIXEL, scale: 50 });

  // State for the shine & border effect
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Draggability logic
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - width / 2, y: window.innerHeight / 2 - height / 2 });

  const fragmentShader = useCallback((uv: { x: number; y: number }) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // Calculate distance to edges for refraction
    const edgeDistX = Math.min(uv.x, 1.0 - uv.x);
    const edgeDistY = Math.min(uv.y, 1.0 - uv.y);
    const edgeDistMin = Math.min(edgeDistX, edgeDistY);
    
    // MODIFIED: Edge refraction - stronger near edges, now controlled by prop
    const refractionStrength = smoothStep(0.2, 0.0, edgeDistMin) * edgeRefraction;
    
    // Calculate normal-like direction for refraction
    const normalX = edgeDistX < edgeDistY ? (uv.x < 0.5 ? -1 : 1) : 0;
    const normalY = edgeDistY < edgeDistX ? (uv.y < 0.5 ? -1 : 1) : 0;
    
    // Apply edge refraction
    const refractedX = ix + normalX * refractionStrength;
    const refractedY = iy + normalY * refractionStrength;
    
    // Original rounded rect distortion
    const distanceToEdge = roundedRectSDF(refractedX, refractedY, 0.3, 0.2, 0.6);
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
    const scaled = smoothStep(0, 1, displacement);
    
    // Combine refraction with original distortion
    const finalX = refractedX * scaled + 0.5;
    const finalY = refractedY * scaled + 0.5;
    
    return texture(finalX, finalY);
  }, [edgeRefraction]);
    
    // --- ELASTICITY LOGIC ---
    const [globalMousePos, setGlobalMousePos] = useState({ x: -1, y: -1 });

    const smoothTx = useSpring(0, { stiffness: 500, damping: 40, mass: 1 });
    const smoothTy = useSpring(0, { stiffness: 500, damping: 40, mass: 1 });
    const smoothScaleX = useSpring(1, { stiffness: 500, damping: 40, mass: 1 });
    const smoothScaleY = useSpring(1, { stiffness: 500, damping: 40, mass: 1 });

    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        setGlobalMousePos({ x: e.clientX, y: e.clientY });
    }, []);

    useEffect(() => {
        if (isElastic) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
        }
    }, [isElastic, handleGlobalMouseMove]);

    useEffect(() => {
        if (!isElastic || !containerRef.current) {
            smoothTx.set(0);
            smoothTy.set(0);
            smoothScaleX.set(1);
            smoothScaleY.set(1);
            return;
        }

        const isMouseUninitialized = globalMousePos.x === -1;
        const rect = containerRef.current.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = globalMousePos.x - centerX;
        const deltaY = globalMousePos.y - centerY;
        
        const edgeDistanceX = Math.max(0, Math.abs(deltaX) - rect.width / 2);
        const edgeDistanceY = Math.max(0, Math.abs(deltaY) - rect.height / 2);
        const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY);
        
        const activationZone = 200;
        
        if (edgeDistance > activationZone || isMouseUninitialized) {
            smoothTx.set(0);
            smoothTy.set(0);
            smoothScaleX.set(1);
            smoothScaleY.set(1);
            return;
        }
        
        const fadeInFactor = 1 - edgeDistance / activationZone;
        const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const tx = deltaX * elasticity * 0.4 * fadeInFactor;
        const ty = deltaY * elasticity * 0.4 * fadeInFactor;
        smoothTx.set(tx);
        smoothTy.set(ty);
        
        const normalizedX = centerDistance === 0 ? 0 : deltaX / centerDistance;
        const normalizedY = centerDistance === 0 ? 0 : deltaY / centerDistance;
        const stretchIntensity = Math.min(centerDistance / 300, 1) * elasticity * fadeInFactor;
        
        const scaleX = 1 + Math.abs(normalizedX) * stretchIntensity * 0.6 - Math.abs(normalizedY) * stretchIntensity * 0.3;
        const scaleY = 1 + Math.abs(normalizedY) * stretchIntensity * 0.6 - Math.abs(normalizedX) * stretchIntensity * 0.3;
        
        smoothScaleX.set(scaleX);
        smoothScaleY.set(scaleY);

    }, [globalMousePos, isElastic, elasticity, smoothTx, smoothTy, smoothScaleX, smoothScaleY]);


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
  
  // Handlers for dragging
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
  
  const handleMouseLeaveCombined = useCallback(() => {
      setIsHovering(false);
      if (isElastic) {
          setGlobalMousePos({ x: -1, y: -1 });
      }
  }, [isElastic]);
  
  // Handler for the shine and border effects
  const handleMouseMoveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // --- NEW BORDER STYLE ---
  const borderGlowStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    border: `${borderWidth}px solid transparent`,
    backgroundImage: isHovering
        ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${borderColor} 0%, transparent 35%)`
        : undefined,
    backgroundClip: 'border-box',
    backgroundOrigin: 'border-box',
    // This creates a border mask. It's well-supported in modern browsers.
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    opacity: isHovering ? 1 : 0,
    transition: 'opacity 0.2s ease-out',
  };

  const motionProps = {};

  return (
    <>
      <svg width="0" height="0" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
        <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            <feImage href={filterAttrs.href} width="100%" height="100%" result="map" preserveAspectRatio="none"/>
            <feDisplacementMap in="SourceGraphic" in2="map" scale={filterAttrs.scale} xChannelSelector="R" yChannelSelector="G" result="displaced"/>
            <feOffset in="displaced" dx={aberrationIntensity * 0.5} dy="0" result="redOffset"/>
            <feOffset in="displaced" dx={-aberrationIntensity * 0.5} dy="0" result="blueOffset"/>
            <feComposite in="displaced" in2="redOffset" operator="over" result="withRed"/>
            <feComposite in="withRed" in2="blueOffset" operator="over"/>
          </filter>
        </defs>
      </svg>
      <motion.div
        ref={containerRef}
        className={className}
        onMouseDown={handleMouseDown}
        style={{
            ...containerStyle,
            translateX: smoothTx,
            translateY: smoothTy,
            scaleX: smoothScaleX,
            scaleY: smoothScaleY,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeaveCombined}
        onMouseMove={handleMouseMoveCombined}
        {...motionProps}
      >
        {children}
        <div style={shineStyle} />
        {/* --- NEW BORDER ELEMENT --- */}
        {hasBorder && <div style={borderGlowStyle} />}
      </motion.div>
    </>
  );
};

export default LiquidGlass;