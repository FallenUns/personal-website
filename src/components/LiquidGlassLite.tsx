import React from 'react';

/**
 * Lightweight "liquid glass" surface — same visual identity as `LiquidGlass`
 * but **no SVG filter chain, no chromatic-aberration displacement map, no
 * canvas-shader displacement texture**. The full `LiquidGlass` does all
 * three: `feImage` + 3× `feDisplacementMap` (one per RGB channel) + a
 * shader-generated displacement map. Those are CPU-bound on Safari and
 * compound horribly when many small UI bits (tech-sphere bubbles, FABs,
 * chat-input bar) each instantiate their own filter chain — iPad Safari
 * was thermally throttling within a few seconds.
 *
 * This component renders the same frosted-glass *look* using only the GPU:
 *  - `backdrop-filter: blur(...) saturate(...)` (compositor-only)
 *  - A subtle linear-gradient surface tint
 *  - A 1 px hairline border + outer/inner shadow
 *  - Rounded corners
 *
 * No per-instance SVG, no `feDisplacementMap`, no shader. Each instance
 * adds essentially zero CPU cost and only a single backdrop-filter pass.
 *
 * Drop-in replacement for `<LiquidGlass>` where the displacement effect
 * isn't the point of the surface (e.g. icon FABs, chat bubbles, hover
 * tooltips). Keeps the **same prop shape** for `width / height /
 * positioning / style / className / onClick / blurAmount / saturation /
 * onMouseEnter / onMouseLeave / children`. The shader-only props
 * (`aberrationIntensity`, `displacementScale`, `elasticity`, `mode`,
 * `overLight`) are accepted but **ignored** so existing call-sites swap
 * with a single rename — no other code changes.
 */

type Positioning = 'relative' | 'absolute' | 'fixed';

export interface LiquidGlassLiteProps {
  width: number;
  height: number;
  positioning?: Positioning;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  /** Backdrop blur in px. Default 8. Capped to a sane range so iPad-class
   *  GPUs aren't asked to blur a half-screen radius. */
  blurAmount?: number;
  /** Backdrop saturation percent (100 = identity). Default 150. */
  saturation?: number;
  /** Use a brighter tint suitable for placement over light backgrounds. */
  overLight?: boolean;

  // ------------------------------------------------------------------
  // Accepted-but-ignored props — present so call-sites can swap the
  // import for `LiquidGlassLite` without touching their other code.
  // ------------------------------------------------------------------
  /** @ignored — no chromatic aberration in lite. */
  aberrationIntensity?: number;
  /** @ignored — no displacement shader in lite. */
  displacementScale?: number;
  /** @ignored — no elastic deform in lite. */
  elasticity?: number;
  /** @ignored — no shader mode toggle in lite. */
  mode?: string;
  /** @ignored — no animation prop in lite. */
  isElastic?: boolean;
}

const LiquidGlassLite: React.FC<LiquidGlassLiteProps> = ({
  width,
  height,
  positioning = 'relative',
  style,
  className,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  blurAmount = 8,
  saturation = 150,
  overLight = false,
}) => {
  // Clamp blur — Safari throttles hard above ~14 px backdrop blur.
  const blur = Math.max(0, Math.min(14, blurAmount));
  const sat = Math.max(100, Math.min(220, saturation));

  // Tint gradient — slightly brighter on light backgrounds so the surface
  // doesn't disappear into bright photos behind it.
  const surfaceBg = overLight
    ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.16) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{
        position: positioning,
        width: `${width}px`,
        height: `${height}px`,
        // Sensible default — caller can override via `style.borderRadius`.
        borderRadius: '14px',
        background: surfaceBg,
        backdropFilter: `blur(${blur}px) saturate(${sat}%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}%)`,
        // 1 px hairline + outer shadow for separation, inset highlight
        // for the "rim of light" cue that sells the glass material.
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow:
          '0 8px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
        overflow: 'hidden',
        // Hardware-accel only — no compositor surprises on Safari.
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        // Container queries / layout containment so paint doesn't escape
        // the box. Tells Safari "this rect is independent" and lets it
        // skip relayout work outside.
        contain: 'layout style paint',
        isolation: 'isolate',
        // Let caller override anything above.
        ...style,
      }}
    >
      {/* Inner content wrapper sits above the backdrop layer */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default React.memo(LiquidGlassLite);
