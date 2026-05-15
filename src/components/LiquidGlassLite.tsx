import React from 'react';

/**
 * Lightweight "liquid glass" surface — same visual identity as `LiquidGlass`
 * but **no SVG filter chain, no displacement map, no canvas shader**. The
 * full `LiquidGlass` does `feImage` + 3× `feDisplacementMap` (one per RGB
 * channel) + a shader-generated displacement texture per instance — all
 * CPU-bound on Safari, and the cost compounds horribly when many small
 * UI bits (tech-sphere bubbles, FABs, chat input bar) each instantiate
 * their own filter chain. iPad Safari was thermally throttling within
 * a few seconds.
 *
 * This component renders the same frosted-glass *look* using only the GPU
 * compositor:
 *  - `backdrop-filter: blur() saturate()` (GPU-compositor pass, no CPU)
 *  - A two-stop linear-gradient surface tint (brighter top-left,
 *    darker bottom-right — fakes the highlight you'd get from a single
 *    light source on real frosted glass)
 *  - Multi-stop `box-shadow` stack: outer drop-shadow for separation,
 *    inset top-edge highlight for the rim of light, inset bottom-edge
 *    shadow for the lower lip
 *  - A subtle hairline border
 *  - An inner `::before`-style highlight via a real child element
 *    (CSS inline styles can't address pseudo-elements)
 *
 * The shadow stack is what carries most of the glass character. The big
 * miss from removing displacement was the **rim of light** at the top
 * edge; the inset shadow + child highlight bring it back.
 *
 * Per-instance CSS class so the global scroll-quiet bus in
 * `useInViewport.ts` can disable `backdrop-filter` during active scroll
 * (toggling `body.lg-scrolling`) — that's the second-biggest iPad Safari
 * win: backdrop-filter re-samples the page behind it on every frame the
 * filtered element moves relative to the background, so during a fast
 * scroll with N filtered elements, the cost is N × full-screen blurs.
 * Pausing for the duration of the scroll gesture removes the spike. The
 * brief moment without blur during the scroll is invisible to the user
 * because the page is moving past their eye too fast to notice.
 *
 * Drop-in replacement for `<LiquidGlass>` where the displacement effect
 * isn't the point of the surface. Same prop shape; shader-only props
 * (`aberrationIntensity`, `displacementScale`, `elasticity`, `mode`,
 * `overLight`) are accepted but ignored so existing call-sites swap with
 * a single import rename.
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
  /** Backdrop blur in px. Default 8. Clamped to [0, 14] — Safari throttles
   *  hard above ~14px backdrop blur radius. */
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
  const blur = Math.max(0, Math.min(14, blurAmount));
  const sat = Math.max(100, Math.min(220, saturation));

  // Two-stop angled tint — brighter at the top-left where a virtual light
  // would catch the surface, darker at the bottom-right where it'd fall
  // into shadow. This is what sells "this is glass" without a shader.
  const surfaceBg = overLight
    ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.18) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.12) 100%)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // The `lg-lite` class is the hook the global scroll-quiet bus uses
      // to disable backdrop-filter during active scroll (see
      // `useInViewport.ts` for the `body.lg-scrolling` toggle, and
      // `index.css` for the rule).
      className={`lg-lite${className ? ` ${className}` : ''}`}
      style={{
        position: positioning,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '14px',
        background: surfaceBg,
        backdropFilter: `blur(${blur}px) saturate(${sat}%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}%)`,
        // Hairline border + outer shadow + TWO inset highlights = the
        // shadow stack that fakes glass refraction at the edges:
        //   - inset 0 1px 0 (top edge rim of light)
        //   - inset 0 -1px 0 (bottom edge soft shadow)
        //   - outer 8px (separation from the background)
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: [
          '0 8px 24px rgba(0,0,0,0.22)',
          'inset 0 1px 0 rgba(255,255,255,0.30)',
          'inset 0 -1px 0 rgba(0,0,0,0.18)',
          'inset 0 0 18px rgba(255,255,255,0.04)',
        ].join(', '),
        overflow: 'hidden',
        // Tell Safari "this rect is independent" so paint/layout work
        // doesn't escape the box and we don't trigger relayouts upstream.
        // NOTE: no `transform: translateZ(0)` here — it was conflicting
        // with parent rotate animations on the floating tech bubbles and
        // making the rendered icon look smushed/asymmetric.
        contain: 'layout style paint',
        isolation: 'isolate',
        ...style,
      }}
    >
      {/* Inner highlight — a soft radial top-left "catch" that's the
          missing displacement substitute. Pure CSS gradient, free on
          the compositor, gives the surface a sense of curvature. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background:
            'radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Inner content wrapper sits above the highlight and matches
          LiquidGlass' centered content behavior. */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'inherit',
          lineHeight: 1,
          pointerEvents: 'inherit',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default React.memo(LiquidGlassLite);
