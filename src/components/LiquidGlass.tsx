import React, {
  useState,
  useEffect,
  useRef,
  useId,
  useCallback,
} from "react";
import { motion, useSpring } from "framer-motion";
import {
  displacementMap,
  polarDisplacementMap,
  prominentDisplacementMap,
} from "../utils/utils";

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
  mode,
  shaderMapUrl,
}) => (
  <svg
    style={{ position: "absolute", width: 0, height: 0 }}
    aria-hidden="true"
  >
    <defs>
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

        {/* Create edge mask */}
        <feColorMatrix
          in="DISPLACEMENT_MAP"
          type="matrix"
          values="0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0 0 0 1 0"
          result="EDGE_INTENSITY"
        />
        <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
          <feFuncA
            type="discrete"
            tableValues={`0 ${aberrationIntensity * 0.05} 1`}
          />
        </feComponentTransfer>
        <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />
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
          values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          result="RED_CHANNEL"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="DISPLACEMENT_MAP"
          scale={
            displacementScale *
            ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.05)
          }
          xChannelSelector="R"
          yChannelSelector="B"
          result="GREEN_DISPLACED"
        />
        <feColorMatrix
          in="GREEN_DISPLACED"
          type="matrix"
          values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
          result="GREEN_CHANNEL"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="DISPLACEMENT_MAP"
          scale={
            displacementScale *
            ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.1)
          }
          xChannelSelector="R"
          yChannelSelector="B"
          result="BLUE_DISPLACED"
        />
        <feColorMatrix
          in="BLUE_DISPLACED"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
          result="BLUE_CHANNEL"
        />
        <feBlend
          in="GREEN_CHANNEL"
          in2="BLUE_CHANNEL"
          mode="screen"
          result="GB_COMBINED"
        />
        <feBlend
          in="RED_CHANNEL"
          in2="GB_COMBINED"
          mode="screen"
          result="RGB_COMBINED"
        />
        <feGaussianBlur
          in="RGB_COMBINED"
          stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)}
          result="ABERRATED_BLURRED"
        />
        <feComposite
          in="ABERRATED_BLURRED"
          in2="EDGE_MASK"
          operator="in"
          result="EDGE_ABERRATION"
        />
        <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feComposite
          in="CENTER_ORIGINAL"
          in2="INVERTED_MASK"
          operator="in"
          result="CENTER_CLEAN"
        />
        <feComposite
          in="EDGE_ABERRATION"
          in2="CENTER_CLEAN"
          operator="over"
        />
      </filter>
    </defs>
  </svg>
);

// --- MAIN LIQUID GLASS COMPONENT (MERGED AND REFACTORED) ---
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
  width = 300,
  height = 200,
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

  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [globalMousePos, setGlobalMousePos] = useState({ x: -1, y: -1 });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - width / 2,
    y: window.innerHeight / 2 - height / 2,
  });

  const smoothTx = useSpring(0, { stiffness: 500, damping: 40, mass: 1 });
  const smoothTy = useSpring(0, { stiffness: 500, damping: 40, mass: 1 });
  const smoothScaleX = useSpring(1, { stiffness: 500, damping: 40, mass: 1 });
  const smoothScaleY = useSpring(1, { stiffness: 500, damping: 40, mass: 1 });

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    setGlobalMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (isElastic) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
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
    const edgeDistance = Math.sqrt(
      edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY
    );
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
    const stretchIntensity =
      (Math.min(centerDistance / 300, 1) * elasticity * fadeInFactor);
    const scaleX =
      1 +
      Math.abs(normalizedX) * stretchIntensity * 0.6 -
      Math.abs(normalizedY) * stretchIntensity * 0.3;
    const scaleY =
      1 +
      Math.abs(normalizedY) * stretchIntensity * 0.6 -
      Math.abs(normalizedX) * stretchIntensity * 0.3;
    smoothScaleX.set(scaleX);
    smoothScaleY.set(scaleY);
  }, [
    globalMousePos,
    isElastic,
    elasticity,
    smoothTx,
    smoothTy,
    smoothScaleX,
    smoothScaleY,
  ]);

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
          Math.min(window.innerWidth - (width ?? 0) - 10, newX)
        );
        const constrainedY = Math.max(
          10,
          Math.min(window.innerHeight - (height ?? 0) - 10, newY)
        );
        setPosition({ x: constrainedX, y: constrainedY });
      }
    },
    [width, height, positioning]
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

  const handleMouseLeaveCombined = useCallback(() => {
    setIsHovering(false);
    if (isElastic) {
      setGlobalMousePos({ x: -1, y: -1 });
    }
  }, [isElastic]);

  const handleMouseMoveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouseOffset({
      x: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 100,
      y: ((e.clientY - rect.top - rect.height / 2) / rect.height) * 100,
    });
  };

  const containerStyle: React.CSSProperties = {
    ...style,
    position: positioning,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: `${cornerRadius}px`,
    boxShadow: overLight
      ? "0px 16px 70px rgba(0, 0, 0, 0.75)"
      : "0 8px 32px rgba(0, 0, 0, 0.3), 0 -10px 25px inset rgba(0, 0, 0, 0.15)",
    backdropFilter: `url(#${id}) blur(${blurAmount}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `url(#${id}) blur(${blurAmount}px) saturate(${saturation}%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transition: "box-shadow 0.3s ease",
  };

  if (positioning === "fixed") {
    containerStyle.top = `${position.y}px`;
    containerStyle.left = `${position.x}px`;
    containerStyle.zIndex = 9999;
    containerStyle.cursor = "grab";
  }

  const borderBaseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    height,
    width,
    borderRadius: `${cornerRadius}px`,
    pointerEvents: "none",
    transition: "all 0.2s ease-out",
    padding: "1.5px",
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
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
    height,
    width,
    borderRadius: `${cornerRadius}px`,
    pointerEvents: "none",
    transition: "opacity 0.2s ease-out",
    opacity: isHovering || isActive ? 0.6 : 0,
    backgroundImage:
      "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%)",
    mixBlendMode: "overlay",
  };

  return (
    <>
      <GlassFilter
        id={id}
        width={width}
        height={height}
        displacementScale={displacementScale}
        aberrationIntensity={aberrationIntensity}
        mode={mode}
      />
      <motion.div
        ref={containerRef}
        className={className}
        style={{
          ...containerStyle,
          ...(isElastic && {
            translateX: smoothTx,
            translateY: smoothTy,
            scaleX: smoothScaleX,
            scaleY: smoothScaleY,
          }),
        }}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeaveCombined}
        onMouseMove={handleMouseMoveCombined}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            color: "white",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {children}
        </div>
        <div style={shineStyle} />
        <span style={borderStyle1} />
        <span style={borderStyle2} />
      </motion.div>
    </>
  );
};

export default LiquidGlass;