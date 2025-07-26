import React, {
    useState,
    useEffect,
    useRef,
    useId,
    useCallback,
    useMemo,
    type CSSProperties,
} from "react";
import { motion, useSpring } from "framer-motion";
import { useTime } from '../contexts/TimeContext';
import { displacementMap, polarDisplacementMap, prominentDisplacementMap } from "../utils/utils";
import { ShaderDisplacementGenerator, fragmentShaders } from '../utils/shader-utils';
import { isLowPerformanceDevice } from '../utils/performance';

// Helper to get the correct displacement map based on the mode
const getMap = (
  mode: "standard" | "polar" | "prominent" | "shader",
  shaderMapUrl?: string
) => {
  switch (mode) {
    case "standard":
      return displacementMap;
    case "polar":
      return polarDisplacementMap;
    case "prominent":
      return prominentDisplacementMap;
    case "shader":
      return shaderMapUrl || displacementMap;
    default:
      return displacementMap;
  }
};

// --- ADVANCED SVG FILTER COMPONENT (from your reference) ---
interface GlassFilterProps {
  id: string;
  displacementScale: number;
  aberrationIntensity: number;
  width: number;
  height: number;
  mode: "standard" | "polar" | "prominent" | "shader";
  shaderMapUrl?: string;
}

const GlassFilter: React.FC<GlassFilterProps> = ({
  id,
  displacementScale,
  aberrationIntensity,
  width,
  height,
  mode,
  shaderMapUrl,
}) => (
  <svg 
    style={{ 
      position: "absolute", 
      width: width,
      height: height,
      transform: 'translateZ(0)',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      WebkitTransform: 'translateZ(0)',
      WebkitBackfaceVisibility: 'hidden',
    }} 
    aria-hidden="true"
  >
    <defs>
      <filter 
        id={id} 
        x="-20%" 
        y="-20%" 
        width="140%" 
        height="140%" 
        colorInterpolationFilters="sRGB"
      >
        <feImage
          x="0"
          y="0"
          width="100%"
          height="100%"
          result="DISPLACEMENT_MAP"
          href={getMap(mode, shaderMapUrl)}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Simple displacement mapping */}
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="DISPLACEMENT_MAP" 
          scale={displacementScale * (mode === "shader" ? 1 : -1)} 
          xChannelSelector="R" 
          yChannelSelector="G" 
          result="DISPLACED" 
        />

        {/* Optional subtle blur for smoother effect */}
        <feGaussianBlur 
          in="DISPLACED" 
          stdDeviation={Math.max(0.1, aberrationIntensity * 0.3)} 
          result="BLURRED" 
        />
      </filter>
    </defs>
  </svg>
);

// --- MAIN LIQUID GLASS COMPONENT ---
interface LiquidGlassProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  positioning?: "fixed" | "relative" | "absolute";
  blurAmount?: number;
  saturation?: number;
  isElastic?: boolean;
  elasticity?: number;
  aberrationIntensity?: number;
  displacementScale?: number;
  cornerRadius?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  overLight?: boolean | 'auto'; // Allow 'auto' to use time context
  mode?: "standard" | "polar" | "prominent" | "shader";
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  width: initialWidth = 300,
  height: initialHeight = 200,
  className,
  style,
  positioning = "relative",
  blurAmount = 10,
  saturation = 120,
  isElastic = true,
  elasticity = 0.15,
  aberrationIntensity = 1,
  displacementScale = 30, // Reduced default for subtler effect
  cornerRadius = 24,
  overLight = 'auto', // Default to 'auto' to use time context
  mode = "standard",
  onClick,
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get time context for automatic overLight behavior
  let timeContext: { overLight: boolean } | null = null;
  try {
    timeContext = useTime();
  } catch {
    // TimeContext is not available, use default value
  }

  // Determine the actual overLight value
  const actualOverLight = overLight === 'auto' && timeContext ? timeContext.overLight : (overLight === 'auto' ? false : overLight);

  // Performance optimization: reduce features on low-end devices
  const isLowPerf = isLowPerformanceDevice();
  const optimizedElasticity = isLowPerf ? 0 : elasticity;
  const optimizedIsElastic = isLowPerf ? false : isElastic;
  const optimizedBlurAmount = isLowPerf ? Math.min(blurAmount, 5) : blurAmount;
  const optimizedDisplacementScale = isLowPerf ? displacementScale * 0.5 : displacementScale;

  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [globalMousePos, setGlobalMousePos] = useState({ x: -1, y: -1 });
  const [shaderMapUrl, setShaderMapUrl] = useState<string>('');

  // Use props directly for consistent sizing
  const elementWidth = initialWidth;
  const elementHeight = initialHeight;

  // Memoize expensive calculations that depend on dimensions
  const optimizedConstants = useMemo(() => ({
    halfWidth: elementWidth * 0.5,
    halfHeight: elementHeight * 0.5,
    maxDimension: Math.max(elementWidth, elementHeight),
    activationZoneBase: Math.max(elementWidth, elementHeight) * 1.5,
    activationZone: Math.max(150, Math.min(300, Math.max(elementWidth, elementHeight) * 1.5)),
  }), [elementWidth, elementHeight]);

  const { halfWidth, halfHeight, activationZone } = optimizedConstants;
  const activationZoneSquared = activationZone * activationZone;
  const inverseActivationZone = 1 / activationZone;

  // Framer Motion springs for smooth transformations - optimized for hardware acceleration
  const smoothTx = useSpring(0, { 
    stiffness: 200, 
    damping: 25, 
    mass: 0.8,
    restDelta: 0.01,
    restSpeed: 0.01
  });
  const smoothTy = useSpring(0, { 
    stiffness: 200, 
    damping: 25, 
    mass: 0.8,
    restDelta: 0.01,
    restSpeed: 0.01
  });
  const smoothScaleX = useSpring(1, { 
    stiffness: 250, 
    damping: 28, 
    mass: 0.7,
    restDelta: 0.001,
    restSpeed: 0.001
  });
  const smoothScaleY = useSpring(1, { 
    stiffness: 250, 
    damping: 28, 
    mass: 0.7,
    restDelta: 0.001,
    restSpeed: 0.001
  });
  const smoothClickScale = useSpring(1, { 
    stiffness: 500, 
    damping: 25,
    restDelta: 0.001,
    restSpeed: 0.001
  });

  // 2. USE EFFECT TO GENERATE THE SHADER MAP
  useEffect(() => {
    if (mode === 'shader' && elementWidth > 0 && elementHeight > 0) {
      const generator = new ShaderDisplacementGenerator({
        width: elementWidth,
        height: elementHeight,
        fragment: fragmentShaders.liquidGlass,
      });
      const url = generator.updateShader();
      setShaderMapUrl(url);
      generator.destroy();
    }
  }, [mode, elementWidth, elementHeight]);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - elementWidth / 2,
    y: window.innerHeight / 2 - elementHeight / 2,
  });

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    // Only update if elastic is enabled and element is near viewport
    if (!optimizedIsElastic || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const isNearViewport = rect.top < window.innerHeight + 200 && rect.bottom > -200;
    
    if (isNearViewport) {
      // Use requestAnimationFrame for smooth updates with built-in throttling
      requestAnimationFrame(() => {
        // Additional check to prevent stale updates
        if (!containerRef.current) return;
        setGlobalMousePos({ x: e.clientX, y: e.clientY });
      });
    }
  }, [optimizedIsElastic]);

  useEffect(() => {
    if (optimizedIsElastic) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
    }
  }, [optimizedIsElastic, handleGlobalMouseMove]);

  useEffect(() => {
    if (!optimizedIsElastic || !containerRef.current) {
      smoothTx.set(0);
      smoothTy.set(0);
      smoothScaleX.set(1);
      smoothScaleY.set(1);
      return;
    }
    
    const isMouseUninitialized = globalMousePos.x === -1;
    if (isMouseUninitialized) {
      smoothTx.set(0);
      smoothTy.set(0);
      smoothScaleX.set(1);
      smoothScaleY.set(1);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + halfWidth;
    const centerY = rect.top + halfHeight;
    const deltaX = globalMousePos.x - centerX;
    const deltaY = globalMousePos.y - centerY;
    
    // Use squared distance to avoid expensive sqrt calculation until needed
    const centerDistanceSquared = deltaX * deltaX + deltaY * deltaY;
    
    // Early exit if outside activation zone (using squared comparison)
    if (centerDistanceSquared > activationZoneSquared) {
      smoothTx.set(0);
      smoothTy.set(0);
      smoothScaleX.set(1);
      smoothScaleY.set(1);
      return;
    }
    
    // Only calculate sqrt when we know we're in range
    const centerDistance = Math.sqrt(centerDistanceSquared);
    
    // Optimized smooth falloff using pre-calculated inverse
    const distanceFactor = Math.max(0, 1 - centerDistance * inverseActivationZone);
    const smoothFactor = distanceFactor * distanceFactor * (3 - 2 * distanceFactor); // Smoothstep
    
    if (smoothFactor <= 0.001) {
      smoothTx.set(0);
      smoothTy.set(0);
      smoothScaleX.set(1);
      smoothScaleY.set(1);
      return;
    }

    // Pre-calculate common values
    const translationIntensity = optimizedElasticity * smoothFactor;
    const translationFactor = translationIntensity * 0.3;
    
    // Translation with improved responsiveness
    smoothTx.set(deltaX * translationFactor);
    smoothTy.set(deltaY * translationFactor);

    // Scale effects with optimized calculations
    const invCenterDistance = centerDistance === 0 ? 0 : 1 / centerDistance;
    const normalizedX = deltaX * invCenterDistance;
    const normalizedY = deltaY * invCenterDistance;
    const scaleBase = Math.min(centerDistance * 0.005, 1) * optimizedElasticity * smoothFactor; // Pre-calculate base scale
    
    const absNormalizedX = Math.abs(normalizedX);
    const absNormalizedY = Math.abs(normalizedY);
    
    const scaleX = 1 + absNormalizedX * scaleBase * 0.4 - absNormalizedY * scaleBase * 0.2;
    const scaleY = 1 + absNormalizedY * scaleBase * 0.4 - absNormalizedX * scaleBase * 0.2;
    
    smoothScaleX.set(scaleX);
    smoothScaleY.set(scaleY);
  }, [
    globalMousePos,
    optimizedIsElastic,
    optimizedElasticity,
    halfWidth,
    halfHeight,
    activationZoneSquared,
    inverseActivationZone,
    smoothTx,
    smoothTy,
    smoothScaleX,
    smoothScaleY,
  ]);

  // Update click scale effect
  useEffect(() => {
      smoothClickScale.set(isActive ? 0.96 : 1);
  }, [isActive, smoothClickScale]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsActive(true);
    if (positioning !== "fixed") return;
    isDragging.current = true;
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { x: position.x, y: position.y };
    e.preventDefault();
  };

  const handleMouseUp = useCallback(() => {
    setIsActive(false);
    if (positioning !== "fixed") return;
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  }, [positioning]);

  const handleMouseMoveDraggable = useCallback(
    (e: MouseEvent) => {
      if (positioning === "fixed" && isDragging.current) {
        // Calculate new position with optimized math
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const newX = initialPosition.current.x + deltaX;
        const newY = initialPosition.current.y + deltaY;
        
        // Use pre-calculated window dimensions for constraints
        const maxX = window.innerWidth - elementWidth - 10;
        const maxY = window.innerHeight - elementHeight - 10;
        
        const constrainedX = Math.max(10, Math.min(maxX, newX));
        const constrainedY = Math.max(10, Math.min(maxY, newY));
        
        setPosition({ x: constrainedX, y: constrainedY });
      }
    },
    [elementWidth, elementHeight, positioning]
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    if (positioning === "fixed") {
      document.addEventListener("mousemove", handleMouseMoveDraggable);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMoveDraggable);
    };
  }, [handleMouseMoveDraggable, handleMouseUp, positioning]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      // Use requestAnimationFrame to throttle updates for smooth performance
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Optimized calculations using pre-calculated half dimensions
        const relativeX = e.clientX - rect.left - halfWidth;
        const relativeY = e.clientY - rect.top - halfHeight;
        setMouseOffset({
            x: (relativeX / halfWidth) * 50, // Normalize to -50 to 50 range
            y: (relativeY / halfHeight) * 50,
        });
      });
  };

  // Base styles for both layers to ensure they are synced
  const baseLayerStyles: CSSProperties = {
      position: positioning,
      width: `${elementWidth}px`,
      height: `${elementHeight}px`,
      borderRadius: `${cornerRadius}px`,
      transformOrigin: 'center',
  };

  // Styles for the decorative overlay (borders, shines)
  const decorativeLayerStyles: CSSProperties = {
      ...baseLayerStyles,
      pointerEvents: 'none',
      zIndex: ((typeof style?.zIndex === 'number' ? style.zIndex : 0) || 0) + 1,
  };

  if (positioning === "fixed") {
    decorativeLayerStyles.top = `${position.y}px`;
    decorativeLayerStyles.left = `${position.x}px`;
    decorativeLayerStyles.zIndex = 10000;
  }

  const borderBaseStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      height: elementHeight,
      width: elementWidth,
      borderRadius: `${cornerRadius}px`,
      pointerEvents: "none",
      transition: "all 0.2s ease-out",
      padding: "1.5px", // MODIFIED
      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      // Hardware acceleration for borders
      transform: "translateZ(0)",
      willChange: "opacity, background",
      backfaceVisibility: "hidden",
      WebkitTransform: "translateZ(0)",
      WebkitBackfaceVisibility: "hidden",
  };

  // Memoize border styles to prevent unnecessary recalculations
  const borderStyles = useMemo(() => {
    // Pre-calculate gradient values for performance
    const gradientAngle = 135 + mouseOffset.x * 1.2;
    const baseOpacity1 = 0.12 + Math.abs(mouseOffset.x) * 0.008;
    const baseOpacity2 = 0.4 + Math.abs(mouseOffset.x) * 0.012;
    const gradientStop1 = Math.max(10, 33 + mouseOffset.y * 0.3);
    const gradientStop2 = Math.min(90, 66 + mouseOffset.y * 0.4);
    
    const borderStyle1: React.CSSProperties = {
      ...borderBaseStyle,
      mixBlendMode: "screen",
      opacity: 0.25,
      background: `linear-gradient(${gradientAngle}deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, ${baseOpacity1}) ${gradientStop1}%, rgba(255, 255, 255, ${baseOpacity2}) ${gradientStop2}%, rgba(255, 255, 255, 0.0) 100%)`,
    };

    const borderStyle2: React.CSSProperties = {
      ...borderBaseStyle,
      mixBlendMode: "overlay",
      opacity: isHovering ? 0.8 : 0.4,
      background: `linear-gradient(${gradientAngle}deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, ${0.32 + Math.abs(mouseOffset.x) * 0.008}) ${gradientStop1}%, rgba(255, 255, 255, ${0.6 + Math.abs(mouseOffset.x) * 0.012}) ${gradientStop2}%, rgba(255, 255, 255, 0.0) 100%)`,
    };

    return { borderStyle1, borderStyle2 };
  }, [mouseOffset.x, mouseOffset.y, isHovering, borderBaseStyle]);

  const { borderStyle1, borderStyle2 } = borderStyles;

  const shineStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    height: elementHeight,
    width: elementWidth, 
    borderRadius: `${cornerRadius}px`,
    pointerEvents: "none",
    transition: "opacity 0.2s ease-out",
    opacity: isHovering || isActive ? 0.6 : 0,
    background: isHovering 
      ? `radial-gradient(circle at ${50 + mouseOffset.x * 0.8}% ${50 + mouseOffset.y * 0.8}%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0) 60%)`
      : "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%)",
    mixBlendMode: "overlay",
    // Hardware acceleration for shine effect
    transform: "translateZ(0)",
    willChange: "opacity, background",
    backfaceVisibility: "hidden",
    WebkitTransform: "translateZ(0)",
    WebkitBackfaceVisibility: "hidden",
  };

    // --- JSX ---
    return (
        <motion.div
            ref={containerRef}
            className={className}
            style={{
                position: positioning,
                width: `${elementWidth}px`,
                height: `${elementHeight}px`,
                borderRadius: `${cornerRadius}px`,
                transformOrigin: 'center',
                cursor: onClick ? 'pointer' : positioning === 'fixed' ? 'grab' : 'default',
                // Hardware acceleration for main container
                willChange: 'transform',
                contain: 'layout style paint',
                isolation: 'isolate',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                // Enable GPU compositing
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                // Optimize for animations
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                ...(positioning === "fixed" && {
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    zIndex: 9999,
                }),
                ...style,
                translateX: smoothTx,
                translateY: smoothTy,
                scaleX: smoothScaleX,
                scaleY: smoothScaleY,
                scale: smoothClickScale,
                boxShadow: actualOverLight
                  ? "0px 16px 70px rgba(0, 0, 0, 0.75), 0px 4px 20px rgba(0, 0, 0, 0.1), 0px 0px 0px 1px rgba(255, 255, 255, 0.1)"
                  : "0px 12px 40px rgba(0, 0, 0, 0.25)",
                transition: 'box-shadow 0.3s ease-out'
            }}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onMouseUp={() => setIsActive(false)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Over light effect - positioned absolutely within the container but behind content */}
            {actualOverLight && (
                <>
                    <div
                        className="bg-black pointer-events-none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: `${cornerRadius}px`,
                            opacity: 0.04,
                            zIndex: 0,
                            transform: 'translateZ(0)',
                            transition: 'opacity 150ms ease-in-out',
                            willChange: 'opacity',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                        }}
                    />
                </>
            )}

            {/* Layer 1: Filtered Background with Frosted Effect */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: `${cornerRadius}px`,
                    boxShadow: actualOverLight ? "0px 16px 70px rgba(0, 0, 0, 0.75)" : "0px 12px 40px rgba(0, 0, 0, 0.25)",
                    backdropFilter: `blur(${(actualOverLight ? 12 : 4) + optimizedBlurAmount}px) saturate(${saturation}%)`,
                    WebkitBackdropFilter: `blur(${(actualOverLight ? 12 : 4) + optimizedBlurAmount}px) saturate(${saturation}%)`,
                    filter: `url(#${id})`,
                    background: actualOverLight 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.12) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.08) 100%)',
                    overflow: 'hidden',
                    zIndex: 1,
                    transform: 'translateZ(0)',
                    willChange: 'transform, filter',
                    contain: 'layout style paint',
                    isolation: 'isolate',
                    backfaceVisibility: 'hidden',
                    WebkitTransform: 'translateZ(0)',
                    WebkitBackfaceVisibility: 'hidden',
                }}
            >
                {/* Frosted glass texture overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: `${cornerRadius}px`,
                        background: `
                            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.06) 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 70%)
                        `,
                        opacity: actualOverLight ? 0.8 : 0.6,
                        mixBlendMode: 'overlay',
                        pointerEvents: 'none',
                    }}
                />
                
                <GlassFilter
                    id={id}
                    width={elementWidth}
                    height={elementHeight}
                    displacementScale={actualOverLight ? optimizedDisplacementScale * 0.5 : optimizedDisplacementScale}
                    aberrationIntensity={aberrationIntensity}
                    mode={mode}
                    shaderMapUrl={shaderMapUrl}
                />
            </div>

            {/* Layer 2: Decorative Overlay (borders, shines) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: `${cornerRadius}px`,
                    pointerEvents: 'none',
                    zIndex: 2,
                    // Hardware acceleration for decorative layer
                    transform: 'translateZ(0)',
                    willChange: 'opacity, transform',
                    contain: 'layout style paint',
                    backfaceVisibility: 'hidden',
                    WebkitTransform: 'translateZ(0)',
                    WebkitBackfaceVisibility: 'hidden',
                }}
            >
                <span style={borderStyle1} />
                <span style={borderStyle2} />
                <div style={shineStyle} />
            </div>

            {/* Layer 3: Content (unfiltered) */}
            <div style={{ 
                position: 'relative',
                zIndex: 3,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'inherit',
                textShadow: actualOverLight ? '0px 2px 12px rgba(0, 0, 0, 0)' : '0px 2px 12px rgba(0, 0, 0, 0.4)',
                // Hardware acceleration for content layer
                transform: 'translateZ(0)',
                willChange: 'contents',
                contain: 'layout style',
                backfaceVisibility: 'hidden',
                WebkitTransform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
            }}>
                {children}
            </div>
        </motion.div>
    );
};

export default LiquidGlass;