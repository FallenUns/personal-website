// src/components/LiquidGlass.tsx

import React, { useState, useEffect, useRef, useId, useCallback, useMemo } from 'react';
import { motion, useSpring } from 'framer-motion';

// ... (utility functions `smoothStep`, `texture` remain the same)
function smoothStep(a: number, b: number, t: number) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function texture(x: number, y: number) {
  return { type: 't', x, y };
}

// Cache for the expensive filter calculation to improve performance
const filterCache = new Map<string, { href: string; scale: number }>();

// Pre-generate filter for common sizes to avoid render delays
const preGenerateFilter = (width: number, height: number, edgeRefraction: number = 0.1) => {
  const w = Math.round(width);
  const h = Math.round(height);
  if (w === 0 || h === 0) return;
  
  const cacheKey = `${w}_${h}_${edgeRefraction}`;
  if (filterCache.has(cacheKey)) return;

  const fragmentShader = (uv: { x: number; y: number }) => {
    const aspect = w / h;
    const ix = (uv.x - 0.5) * aspect;
    const iy = uv.y - 0.5;
    const distToEdge = 0.5 - Math.max(Math.abs(uv.x - 0.5), Math.abs(uv.y - 0.5));
    const edgeFactor = smoothStep(0.0, 0.4, 1.0 - distToEdge / 0.5);
    const displacement = edgeFactor * edgeRefraction;
    const scale = 1.0 - displacement;
    return texture((ix * scale) / aspect + 0.5, iy * scale + 0.5);
  };

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
  
  maxScale = Math.max(1, maxScale);
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
  
  const filterAttrs = {
    href: canvas.toDataURL(),
    scale: maxScale,
  };
  
  filterCache.set(cacheKey, filterAttrs);
  return filterAttrs;
};

interface LiquidGlassProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  positioning?: 'fixed' | 'relative' | 'absolute';
  blur?: number;
  isElastic?: boolean;
  elasticity?: number;
  aberrationIntensity?: number;
  borderType?: 'none' | 'glow' | 'dynamic';
  borderWidth?: number;
  borderColor?: string;
  edgeRefraction?: number;
  disableShine?: boolean;
  onClick?: () => void;
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
  borderType = 'none',
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.5)',
  edgeRefraction = 0.1,
  disableShine = false,
  onClick,
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate filter synchronously to avoid render delays
  const filterAttrs = useMemo(() => {
    const w = Math.round(width ?? 0);
    const h = Math.round(height ?? 0);
    if (w === 0 || h === 0) return { href: TRANSPARENT_PIXEL, scale: 50 };
    
    const cacheKey = `${w}_${h}_${edgeRefraction}`;
    let cachedFilter = filterCache.get(cacheKey);
    
    if (!cachedFilter) {
      // Generate immediately if not cached
      cachedFilter = preGenerateFilter(w, h, edgeRefraction);
    }
    
    return cachedFilter || { href: TRANSPARENT_PIXEL, scale: 50 };
  }, [width, height, edgeRefraction]);

  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - width / 2, y: window.innerHeight / 2 - height / 2 });
    
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
      const constrainedX = Math.max(10, Math.min(window.innerWidth - (width ?? 0) - 10, newX));
      const constrainedY = Math.max(10, Math.min(window.innerHeight - (height ?? 0) - 10, newY));
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
  
  const handleMouseMoveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };  const containerStyle: React.CSSProperties = {
    ...style,
    position: positioning,
    width: `${width}px`,
    height: `${height}px`,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15)',
    backdropFilter: `url(#${id}) blur(${blur}px) contrast(1.2) brightness(0.87) saturate(1.4)`,
    WebkitBackdropFilter: `url(#${id}) blur(${blur}px) contrast(1.2) brightness(0.87) saturate(1.4)`,
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

  const borderElement = useMemo(() => {
    if (borderType === 'glow') {
      const borderGlowStyle: React.CSSProperties = {
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        border: `${borderWidth}px solid transparent`,
        backgroundImage: isHovering
            ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${borderColor} 0%, transparent 35%)`
            : undefined,
        backgroundClip: 'border-box', backgroundOrigin: 'border-box',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor', opacity: isHovering ? 1 : 0, transition: 'opacity 0.2s ease-out',
      };
      return <div style={borderGlowStyle} />;
    }
    if (borderType === 'dynamic') {
      return <div className="dynamic-border" style={{ borderWidth: `${borderWidth}px` }} />;
    }
    return null;
  }, [borderType, borderWidth, borderColor, isHovering, mousePos.x, mousePos.y]);
  
  const motionStyle: React.CSSProperties = { ...containerStyle };
  if (isElastic) {
    // @ts-ignore
    motionStyle.translateX = smoothTx;
    // @ts-ignore
    motionStyle.translateY = smoothTy;
    // @ts-ignore
    motionStyle.scaleX = smoothScaleX;
    // @ts-ignore
    motionStyle.scaleY = smoothScaleY;
  }

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
        onClick={onClick}
        style={motionStyle}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeaveCombined}
        onMouseMove={handleMouseMoveCombined}
      >
        {children}
        {!disableShine && <div style={shineStyle} />}
        {borderElement}
      </motion.div>
    </>
  );
};

export default LiquidGlass;
export { preGenerateFilter };