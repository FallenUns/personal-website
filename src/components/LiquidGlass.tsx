import { type CSSProperties, forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { throttle } from "../utils/throttle"

// Simplified displacement map generator
const generateSimpleDisplacementMap = (width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  // Create a radial gradient for displacement
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width, height)/2)
  gradient.addColorStop(0, 'rgb(128, 128, 128)')
  gradient.addColorStop(0.7, 'rgb(140, 120, 128)')
  gradient.addColorStop(1, 'rgb(128, 128, 128)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}

const getMap = (mode: "standard" | "polar" | "prominent" | "shader", customMapUrl?: string) => {
  // Return custom map if provided
  if (customMapUrl) return customMapUrl
  
  // Create different patterns based on mode for visual variety
  const patterns = {
    standard: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:rgb(128,128,128);stop-opacity:1" />
            <stop offset="70%" style="stop-color:rgb(140,120,128);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(128,128,128);stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad)" />
      </svg>
    `,
    polar: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:rgb(150,128,140);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgb(128,128,128);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(120,140,128);stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad)" />
      </svg>
    `,
    prominent: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(140,128,150);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgb(128,128,128);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(128,150,140);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad)" />
      </svg>
    `,
    shader: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:rgb(160,128,128);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgb(128,160,128);stop-opacity:1" />
            <stop offset="80%" style="stop-color:rgb(128,128,160);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(128,128,128);stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad)" />
      </svg>
    `
  }
  
  return `data:image/svg+xml;base64,${btoa(patterns[mode])}`
}

/* ---------- SVG filter (edge-only displacement) ---------- */
const GlassFilter: React.FC<{ id: string; displacementScale: number; aberrationIntensity: number; width: number; height: number; mode: "standard" | "polar" | "prominent" | "shader"; shaderMapUrl?: string }> = ({
  id,
  displacementScale,
  aberrationIntensity,
  width,
  height,
  mode,
  shaderMapUrl,
}) => (
  <svg style={{ position: "absolute", width, height }} aria-hidden="true">
    <defs>
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feImage 
          id="feimage" 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          result="displacementMap" 
          href={getMap(mode, shaderMapUrl)} 
          preserveAspectRatio="xMidYMid slice" 
        />

        {/* Simple displacement */}
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="displacementMap" 
          scale={displacementScale} 
          xChannelSelector="R" 
          yChannelSelector="G" 
          result="displaced" 
        />
        
        {/* Add slight blur for smoothness */}
        <feGaussianBlur 
          in="displaced" 
          stdDeviation={Math.max(0.5, aberrationIntensity * 0.5)} 
          result="final" 
        />
      </filter>    </defs>
  </svg>
)

/* ---------- container ---------- */
const GlassContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
    displacementScale?: number
    blurAmount?: number
    saturation?: number
    aberrationIntensity?: number
    mouseOffset?: { x: number; y: number }
    onMouseLeave?: () => void
    onMouseEnter?: () => void
    onMouseDown?: () => void
    onMouseUp?: () => void
    active?: boolean
    overLight?: boolean
    cornerRadius?: number
    padding?: string
    glassSize?: { width: number; height: number }
    onClick?: () => void
    mode?: "standard" | "polar" | "prominent" | "shader"
  }>
>(
  (
    {
      children,
      className = "",
      style,
      displacementScale = 25,
      blurAmount = 12,
      saturation = 180,
      aberrationIntensity = 2,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      active = false,
      overLight = false,
      cornerRadius = 999,
      padding = "24px 32px",
      glassSize = { width: 270, height: 69 },
      onClick,
      mode = "standard",
    },
    ref,
  ) => {
    const filterId = useId()
    const [shaderMapUrl, setShaderMapUrl] = useState<string>("")

    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox")    // Generate shader displacement map when in shader mode
    useEffect(() => {
      if (mode === "shader") {
        const url = generateSimpleDisplacementMap(glassSize.width, glassSize.height)
        setShaderMapUrl(url)
      }
    }, [mode, glassSize.width, glassSize.height])

    return (
      <div 
        ref={ref} 
        className={`relative ${className} ${active ? "active" : ""} ${Boolean(onClick) ? "cursor-pointer" : ""}`} 
        style={style}
        onClick={onClick}
      >
        <GlassFilter mode={mode} id={filterId} displacementScale={displacementScale} aberrationIntensity={aberrationIntensity} width={glassSize.width} height={glassSize.height} shaderMapUrl={shaderMapUrl} />

        <div
          className="glass"
          style={{
            borderRadius: `${cornerRadius}px`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding,
            overflow: "hidden",
            transition: "all 0.2s ease-in-out",
            boxShadow: overLight ? "0px 16px 70px rgba(0, 0, 0, 0.75)" : "0px 12px 40px rgba(0, 0, 0, 0.25)",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {/* backdrop layer that gets both backdrop-filter AND SVG filter effects */}
          <div
            className="glass__warp"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              borderRadius: `${cornerRadius}px`,
              // Apply BOTH backdrop-filter and SVG filter
              backdropFilter: `blur(${(overLight ? 12 : 4) + blurAmount * 32}px) saturate(${saturation}%)`,
              WebkitBackdropFilter: `blur(${(overLight ? 12 : 4) + blurAmount * 32}px) saturate(${saturation}%)`,
              filter: isFirefox ? `blur(${blurAmount * 16}px)` : `url(#${filterId})`,
              // Base glass appearance
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              // Force hardware acceleration and proper layering
              transform: 'translateZ(0)',
              willChange: 'filter, backdrop-filter',
            } as CSSProperties}
          />

          {/* user content stays sharp */}
          <div
            className="transition-all duration-150 ease-in-out text-white"
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              font: "500 20px/1 system-ui",
              textShadow: overLight ? "0px 2px 12px rgba(0, 0, 0, 0)" : "0px 2px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  },
)

GlassContainer.displayName = "GlassContainer"

// Helper function to parse CSS size values
interface LiquidGlassProps {
  children: React.ReactNode
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  aberrationIntensity?: number
  elasticity?: number
  cornerRadius?: number
  globalMousePos?: { x: number; y: number }
  mouseOffset?: { x: number; y: number }
  mouseContainer?: React.RefObject<HTMLElement | null> | null
  className?: string
  padding?: string
  style?: React.CSSProperties
  overLight?: boolean
  mode?: "standard" | "polar" | "prominent" | "shader"
  onClick?: () => void
}

export default function LiquidGlass({
  children,
  displacementScale = 70,
  blurAmount = 0.0625,
  saturation = 140,
  aberrationIntensity = 2,
  elasticity = 0.15,
  cornerRadius = 999,
  globalMousePos: externalGlobalMousePos,
  mouseOffset: externalMouseOffset,
  mouseContainer = null,
  className = "",
  padding = "24px 32px",
  overLight = false,
  style = {},
  mode = "standard",
  onClick,
}: LiquidGlassProps) {
  const glassRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [glassSize, setGlassSize] = useState({ width: 320, height: 200 })
  const [internalGlobalMousePos, setInternalGlobalMousePos] = useState({ x: 0, y: 0 })
  const [internalMouseOffset, setInternalMouseOffset] = useState({ x: 0, y: 0 })

  // Use external mouse position if provided, otherwise use internal
  const globalMousePos = externalGlobalMousePos || internalGlobalMousePos
  const mouseOffset = externalMouseOffset || internalMouseOffset

  // Internal mouse tracking
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      const container = mouseContainer?.current || glassRef.current
      if (!container) {
        return
      }

      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      setInternalMouseOffset({
        x: ((e.clientX - centerX) / rect.width) * 100,
        y: ((e.clientY - centerY) / rect.height) * 100,
      })

      setInternalGlobalMousePos({
        x: e.clientX,
        y: e.clientY,
      })
    }, 16),
    [mouseContainer]
  )

  // Set up mouse tracking if no external mouse position is provided
  useEffect(() => {
    if (externalGlobalMousePos && externalMouseOffset) {
      // External mouse tracking is provided, don't set up internal tracking
      return
    }

    const container = mouseContainer?.current || glassRef.current
    if (!container) {
      return
    }

    container.addEventListener("mousemove", handleMouseMove)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseMove, mouseContainer, externalGlobalMousePos, externalMouseOffset])

  // Calculate directional scaling based on mouse position
  const calculateDirectionalScale = useCallback(() => {
    if (!globalMousePos.x || !globalMousePos.y || !glassRef.current) {
      return "scale(1)"
    }

    const rect = glassRef.current.getBoundingClientRect()
    const pillCenterX = rect.left + rect.width / 2
    const pillCenterY = rect.top + rect.height / 2
    const pillWidth = glassSize.width
    const pillHeight = glassSize.height

    const deltaX = globalMousePos.x - pillCenterX
    const deltaY = globalMousePos.y - pillCenterY

    // Calculate distance from mouse to pill edges (not center)
    const edgeDistanceX = Math.max(0, Math.abs(deltaX) - pillWidth / 2)
    const edgeDistanceY = Math.max(0, Math.abs(deltaY) - pillHeight / 2)
    const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY)

    // Activation zone: 200px from edges
    const activationZone = 200

    // If outside activation zone, no effect
    if (edgeDistance > activationZone) {
      return "scale(1)"
    }

    // Calculate fade-in factor (1 at edge, 0 at activation zone boundary)
    const fadeInFactor = 1 - edgeDistance / activationZone

    // Normalize the deltas for direction
    const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (centerDistance === 0) {
      return "scale(1)"
    }

    const normalizedX = deltaX / centerDistance
    const normalizedY = deltaY / centerDistance

    // Calculate stretch factors with fade-in
    const stretchIntensity = Math.min(centerDistance / 300, 1) * elasticity * fadeInFactor

    // X-axis scaling: stretch horizontally when moving left/right, compress when moving up/down
    const scaleX = 1 + Math.abs(normalizedX) * stretchIntensity * 0.3 - Math.abs(normalizedY) * stretchIntensity * 0.15

    // Y-axis scaling: stretch vertically when moving up/down, compress when moving left/right
    const scaleY = 1 + Math.abs(normalizedY) * stretchIntensity * 0.3 - Math.abs(normalizedX) * stretchIntensity * 0.15

    return `scaleX(${Math.max(0.8, scaleX)}) scaleY(${Math.max(0.8, scaleY)})`
  }, [globalMousePos, elasticity, glassSize])

  // Update glass size whenever component mounts or window resizes
  useEffect(() => {
    const updateGlassSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        
        // Use container dimensions for accurate sizing
        const width = rect.width || 320
        const height = rect.height || 200
        
        setGlassSize({ width, height })
      }
    }

    // Initial update with a small delay to ensure rendering
    const timeoutId = setTimeout(updateGlassSize, 100)
    
    window.addEventListener("resize", updateGlassSize)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updateGlassSize)
    }
  }, [style.width, style.height])

  // Watch for size changes using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setGlassSize({ width, height })
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const transformStyle = useMemo(() => {
    return isActive && Boolean(onClick) ? "scale(0.96)" : calculateDirectionalScale();
  }, [isActive, onClick, calculateDirectionalScale]);

  const baseStyle = useMemo(() => ({
    ...style,
    transform: transformStyle,
    transition: "all ease-out 0.2s",
  }) ,[style, transformStyle]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        width: style.width || 'auto',
        height: style.height || 'auto',
        minHeight: style.minHeight || 'auto',
      }}
    >
      <GlassContainer
        ref={glassRef}
        className={className}
        style={baseStyle}
        cornerRadius={cornerRadius}
        displacementScale={overLight ? displacementScale * 0.5 : displacementScale}
        blurAmount={blurAmount}
        saturation={saturation}
        aberrationIntensity={aberrationIntensity}
        glassSize={glassSize}
        padding={padding}
        mouseOffset={mouseOffset}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        active={isActive}
        overLight={overLight}
        onClick={onClick}
        mode={mode}
      >
        {children}
      </GlassContainer>

      {/* Over light effect */}
      <div
        className={`bg-black transition-all duration-150 ease-in-out pointer-events-none absolute inset-0 ${overLight ? "opacity-20" : "opacity-0"}`}
        style={{
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
        }}
      />
      <div
        className={`bg-black transition-all duration-150 ease-in-out pointer-events-none mix-blend-overlay absolute inset-0 ${overLight ? "opacity-100" : "opacity-0"}`}
        style={{
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
        }}
      />

      {/* Border layer 1 */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
          mixBlendMode: "screen",
          opacity: 0.2,
          padding: "1.5px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          boxShadow: "0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)",
          background: `linear-gradient(
          ${135 + mouseOffset.x * 1.2}deg,
          rgba(255, 255, 255, 0.0) 0%,
          rgba(255, 255, 255, ${0.12 + Math.abs(mouseOffset.x) * 0.008}) ${Math.max(10, 33 + mouseOffset.y * 0.3)}%,
          rgba(255, 255, 255, ${0.4 + Math.abs(mouseOffset.x) * 0.012}) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%,
          rgba(255, 255, 255, 0.0) 100%
        )`,
        }}
      />

      {/* Border layer 2 */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
          mixBlendMode: "overlay",
          padding: "1.5px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          boxShadow: "0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)",
          background: `linear-gradient(
          ${135 + mouseOffset.x * 1.2}deg,
          rgba(255, 255, 255, 0.0) 0%,
          rgba(255, 255, 255, ${0.32 + Math.abs(mouseOffset.x) * 0.008}) ${Math.max(10, 33 + mouseOffset.y * 0.3)}%,
          rgba(255, 255, 255, ${0.6 + Math.abs(mouseOffset.x) * 0.012}) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%,
          rgba(255, 255, 255, 0.0) 100%
        )`,
        }}
      />

      {/* Hover effects */}
      {Boolean(onClick) && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: `${cornerRadius}px`,
              transform: baseStyle.transform,
              transition: "all 0.2s ease-out",
              opacity: isHovered || isActive ? 0.5 : 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%)",
              mixBlendMode: "overlay",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: `${cornerRadius}px`,
              transform: baseStyle.transform,
              transition: "all 0.2s ease-out",
              opacity: isActive ? 0.5 : 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 80%)",
              mixBlendMode: "overlay",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: `${cornerRadius}px`,
              transform: baseStyle.transform,
              transition: "all 0.2s ease-out",
              opacity: isHovered ? 0.4 : isActive ? 0.8 : 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
              mixBlendMode: "overlay",
            }}
          />
        </>
      )}
    </div>
  )
}