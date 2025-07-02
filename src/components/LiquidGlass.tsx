import React, {
    useState,
    useEffect,
    useRef,
    useId,
    useCallback,
    type CSSProperties,
} from "react";
import { motion, useSpring } from "framer-motion";
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
    }} 
    aria-hidden="true"
  >
    <defs>
      <radialGradient id={`${id}-edge-mask`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="black" stopOpacity="0" />
        <stop offset={`${Math.max(30, 80 - aberrationIntensity * 2)}%`} stopColor="black" stopOpacity="0" />
        <stop offset="100%" stopColor="white" stopOpacity="1" />
      </radialGradient>
      <filter 
        id={id} 
        x="-35%" 
        y="-35%" 
        width="170%" 
        height="170%" 
        colorInterpolationFilters="sRGB"
      >
        <feImage
          id="feimage"
          x="0"
          y="0"
          width="100%"
          height="100%"
          result="DISPLACEMENT_MAP"
          href={getMap(mode, shaderMapUrl)}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Create edge mask using the displacement map itself */}
        <feColorMatrix
          in="DISPLACEMENT_MAP"
          type="matrix"
          values="0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0 0 0 1 0"
          result="EDGE_INTENSITY"
        />
        <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
          <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
        </feComponentTransfer>

        {/* Original undisplaced image for center */}
        <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />

        {/* Red channel displacement with slight offset */}
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="DISPLACEMENT_MAP" 
          scale={displacementScale * (mode === "shader" ? 1 : -1)} 
          xChannelSelector="R" 
          yChannelSelector="B" 
          result="RED_DISPLACED" 
        />
        <feColorMatrix
          in="RED_DISPLACED"
          type="matrix"
          values="1 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
          result="RED_CHANNEL"
        />

        {/* Green channel displacement */}
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="DISPLACEMENT_MAP" 
          scale={displacementScale * ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.05)} 
          xChannelSelector="R" 
          yChannelSelector="B" 
          result="GREEN_DISPLACED" 
        />
        <feColorMatrix
          in="GREEN_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                 0 1 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
          result="GREEN_CHANNEL"
        />

        {/* Blue channel displacement with slight offset */}
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="DISPLACEMENT_MAP" 
          scale={displacementScale * ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.1)} 
          xChannelSelector="R" 
          yChannelSelector="B" 
          result="BLUE_DISPLACED" 
        />
        <feColorMatrix
          in="BLUE_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                 0 0 0 0 0
                 0 0 1 0 0
                 0 0 0 1 0"
          result="BLUE_CHANNEL"
        />

        {/* Combine all channels with screen blend mode for chromatic aberration */}
        <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
        <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />

        {/* Add slight blur to soften the aberration effect */}
        <feGaussianBlur 
          in="RGB_COMBINED" 
          stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)} 
          result="ABERRATED_BLURRED" 
        />

        {/* Apply edge mask to aberration effect */}
        <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />

        {/* Create inverted mask for center */}
        <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />

        {/* Combine edge aberration with clean center */}
        <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
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
  overLight?: boolean;
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
  displacementScale = 50,
  cornerRadius = 24,
  overLight = false,
  mode = "standard",
  onClick,
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Performance optimization: reduce features on low-end devices
  const isLowPerf = isLowPerformanceDevice();
  const optimizedElasticity = isLowPerf ? 0 : elasticity;
  const optimizedIsElastic = isLowPerf ? false : isElastic;
  const optimizedBlurAmount = isLowPerf ? Math.min(blurAmount, 5) : blurAmount;
  const optimizedAberrationIntensity = isLowPerf ? Math.min(aberrationIntensity, 0.5) : aberrationIntensity;

  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [globalMousePos, setGlobalMousePos] = useState({ x: -1, y: -1 });
  const [shaderMapUrl, setShaderMapUrl] = useState<string>('');

  // Use props directly for consistent sizing
  const elementWidth = initialWidth;
  const elementHeight = initialHeight;

  // Framer Motion springs for smooth transformations
  const smoothTx = useSpring(0, { stiffness: 200, damping: 25, mass: 0.8 });
  const smoothTy = useSpring(0, { stiffness: 200, damping: 25, mass: 0.8 });
  const smoothScaleX = useSpring(1, { stiffness: 250, damping: 28, mass: 0.7 });
  const smoothScaleY = useSpring(1, { stiffness: 250, damping: 28, mass: 0.7 });
  const smoothClickScale = useSpring(1, { stiffness: 500, damping: 25 });

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
      setGlobalMousePos({ x: e.clientX, y: e.clientY });
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
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = globalMousePos.x - centerX;
    const deltaY = globalMousePos.y - centerY;
    const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Dynamic activation zone based on element size
    const baseActivationZone = Math.max(elementWidth, elementHeight) * 1.5;
    const activationZone = Math.max(150, Math.min(300, baseActivationZone));
    
    // Smooth falloff instead of hard cutoff
    const distanceFactor = Math.max(0, 1 - (centerDistance / activationZone));
    const smoothFactor = distanceFactor * distanceFactor * (3 - 2 * distanceFactor); // Smoothstep
    
    if (smoothFactor <= 0.001) {
      smoothTx.set(0);
      smoothTy.set(0);
      smoothScaleX.set(1);
      smoothScaleY.set(1);
      return;
    }

    // Translation with improved responsiveness
    const translationIntensity = optimizedElasticity * smoothFactor;
    const tx = deltaX * translationIntensity * 0.3;
    const ty = deltaY * translationIntensity * 0.3;
    smoothTx.set(tx);
    smoothTy.set(ty);

    // Scale effects with smoother transitions
    const normalizedX = centerDistance === 0 ? 0 : deltaX / centerDistance;
    const normalizedY = centerDistance === 0 ? 0 : deltaY / centerDistance;
    const scaleIntensity = Math.min(centerDistance / 200, 1) * optimizedElasticity * smoothFactor;
    
    const scaleX = 1 + Math.abs(normalizedX) * scaleIntensity * 0.4 - Math.abs(normalizedY) * scaleIntensity * 0.2;
    const scaleY = 1 + Math.abs(normalizedY) * scaleIntensity * 0.4 - Math.abs(normalizedX) * scaleIntensity * 0.2;
    
    smoothScaleX.set(scaleX);
    smoothScaleY.set(scaleY);
  }, [
    globalMousePos,
    optimizedIsElastic,
    optimizedElasticity,
    elementWidth,
    elementHeight,
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
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const newX = initialPosition.current.x + deltaX;
        const newY = initialPosition.current.y + deltaY;
        const constrainedX = Math.max(
          10,
          Math.min(window.innerWidth - elementWidth - 10, newX)
        );
        const constrainedY = Math.max(
          10,
          Math.min(window.innerHeight - elementHeight - 10, newY)
        );
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
      const rect = containerRef.current.getBoundingClientRect();
      setMouseOffset({
          x: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 100,
          y: ((e.clientY - rect.top - rect.height / 2) / rect.height) * 100,
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
  };

  const borderStyle1: React.CSSProperties = {
    ...borderBaseStyle,
    mixBlendMode: "screen",
    opacity: 0.25,
    background: `linear-gradient(${
      135 + mouseOffset.x * 1.2
    }deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, ${
      0.12 + Math.abs(mouseOffset.x) * 0.008
    }) ${Math.max(
      10,
      33 + mouseOffset.y * 0.3
    )}%, rgba(255, 255, 255, ${
      0.4 + Math.abs(mouseOffset.x) * 0.012
    }) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%, rgba(255, 255, 255, 0.0) 100%)`,
  };

  const borderStyle2: React.CSSProperties = {
    ...borderBaseStyle,
    mixBlendMode: "overlay",
    opacity: isHovering ? 0.8 : 0.4,
    background: `linear-gradient(${
      135 + mouseOffset.x * 1.2
    }deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, ${
      0.32 + Math.abs(mouseOffset.x) * 0.008
    }) ${Math.max(
      10,
      33 + mouseOffset.y * 0.3
    )}%, rgba(255, 255, 255, ${
      0.6 + Math.abs(mouseOffset.x) * 0.012
    }) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%, rgba(255, 255, 255, 0.0) 100%)`,
  };

  const shineStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    height: elementHeight,
    width: elementWidth, 
    borderRadius: `${cornerRadius}px`,
    pointerEvents: "none",
    transition: "opacity 0.2s ease-out",
    opacity: isHovering || isActive ? 0.6 : 0,
    backgroundImage:
      "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%)",
    mixBlendMode: "overlay",
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
            }}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onMouseUp={() => setIsActive(false)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Layer 1: Filtered Background */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: `${cornerRadius}px`,
                    // The new and improved shadow for the "overLight" state
                    boxShadow: overLight
                        ? "0 0 25px rgba(255, 255, 255, 0.1), 0 4px 15px rgba(0, 0, 0, 0.2)" // MODIFIED
                        : "none",
                    backdropFilter: `blur(${optimizedBlurAmount}px) saturate(${saturation}%)`,
                    WebkitBackdropFilter: `blur(${optimizedBlurAmount}px) saturate(${saturation}%)`,
                    filter: `url(#${id})`,
                    overflow: 'hidden',
                    transform: 'translateZ(0)',
                }}
            >
                <GlassFilter
                    id={id}
                    width={elementWidth}
                    height={elementHeight}
                    displacementScale={displacementScale}
                    aberrationIntensity={optimizedAberrationIntensity}
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
                textShadow: overLight ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
            }}>
                {children}
            </div>
        </motion.div>
    );
};

export default LiquidGlass;