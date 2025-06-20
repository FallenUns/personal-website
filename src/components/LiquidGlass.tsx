import React, { useState, useEffect, useRef, useId, useCallback } from 'react';

// Utility functions from the vanilla JS example
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
  blur?: number; // Add blur prop
}

// A 1x1 transparent pixel placeholder to avoid the empty href warning
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  width = 300,
  height = 200,
  className,
  style,
  positioning = 'relative',
  blur = 10, // Set a default blur value
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for the filter attributes
  const [filterAttrs, setFilterAttrs] = useState({ href: TRANSPARENT_PIXEL, scale: 50 });

  const mousePos = useRef({ x: 0, y: 0 });
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
    // Round dimensions to prevent ImageData errors
    const w = Math.round(width);
    const h = Math.round(height);

    if (w === 0 || h === 0) return;

    // Use a temporary canvas to generate the displacement map
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

    maxScale = Math.max(1, maxScale * 0.5); // Ensure maxScale is at least 1

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
    
    // Update state with the new data URL and scale
    setFilterAttrs({
        href: canvas.toDataURL(),
        scale: maxScale,
    });

  }, [width, height, fragmentShader]);
  
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
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
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
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, [handleMouseMove, handleMouseUp, positioning]);

  const containerStyle: React.CSSProperties = {
    ...style,
    position: positioning,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: '32px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15)',
    // Use the blur prop in the backdropFilter
    backdropFilter: `url(#${id}) blur(${blur}px) contrast(1.2) brightness(1.05) saturate(1.1)`,
    WebkitBackdropFilter: `url(#${id}) blur(${blur}px) contrast(1.2) brightness(1.05) saturate(1)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transform: style?.transform
  };

  if (positioning === 'fixed') {
    containerStyle.top = `${position.y}px`;
    containerStyle.left = `${position.x}px`;
    containerStyle.zIndex = 9999;
    containerStyle.cursor = 'grab';
    containerStyle.transform = ''; 
  }

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
      {/* The temporary canvas is no longer needed in the DOM */}
      <div
        ref={containerRef}
        className={className}
        onMouseDown={handleMouseDown}
        style={containerStyle}
      >
        {children}
      </div>
    </>
  );
};

export default LiquidGlass;