import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTime } from '../contexts/TimeContext';
import { isLowPerformanceDevice } from '../utils/performance';

/**
 * Full-screen WebGL aurora. A single plane with an fBM-noise fragment
 * shader that produces flowing organic gradients. Multiple palette colors
 * are interpolated by noise value; colors come from the time-of-day
 * context. The Canvas is rendered with pointer-events:none so it never
 * blocks clicks or scroll.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform vec3  uColorD;
  uniform vec3  uColorE;
  uniform vec3  uColorF;
  uniform vec2  uResolution;
  uniform float uIntensity;
  uniform vec2  uMouse;          // 0..1, with (0,0) at bottom-left
  uniform float uMouseInfluence; // 0 disables warp (low-perf devices)
  uniform float uScroll;         // accumulated scroll progress in fBM units
                                 // → makes the aurora feel like a long tall
                                 // canvas the user scrolls THROUGH

  // Classic 2D hash + value noise + fBM
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.55;
    }
    return v;
  }

  void main() {
    // Aspect-correct uv with slow drift over time. uScroll shifts the noise
    // sampling so that as the user scrolls DOWN the page, the aurora pattern
    // also moves DOWN with them — like the bg is attached to the document
    // and they're carrying it along, not parallaxing past a tall image.
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;
    uv.y -= uScroll;

    float t = uTime * 0.05;

    // Mouse-driven domain warp: the aurora bends toward the cursor with a
    // soft gaussian falloff, leaving a flowing "wake" as the pointer moves.
    // Two-layer warp — a tight close-range pull plus a long-range drift so
    // the effect reads at any cursor distance.
    vec2 m = uMouse;
    m.x *= aspect;
    vec2 toMouse = m - uv;
    float mouseDist2 = dot(toMouse, toMouse);
    float closeFalloff = exp(-2.2 * mouseDist2);   // strong near the cursor
    float wideFalloff  = exp(-0.45 * mouseDist2);  // gentle reach to edges
    vec2 warp = toMouse * (closeFalloff * 0.70 + wideFalloff * 0.18) * uMouseInfluence;

    // Layer 1: large slow-moving warp
    vec2 q;
    q.x = fbm(uv * 1.1 + warp + vec2(0.0, t));
    q.y = fbm(uv * 1.1 + warp + vec2(1.7, -t * 0.8));

    // Layer 2: domain-warped fbm — gives the flowing-ink look
    vec2 r;
    r.x = fbm(uv * 1.5 + 3.0 * q + warp + vec2(1.7 + t, 9.2));
    r.y = fbm(uv * 1.5 + 3.0 * q + warp + vec2(8.3 - t * 0.7, 2.8));

    float n = fbm(uv * 1.8 + 4.0 * r + t);

    // Build a wider 6-stop gradient so the atmosphere has warm, cool, and
    // accent bands instead of collapsing into mostly blue/purple.
    float t1 = smoothstep(0.18, 0.42, n);
    float t2 = smoothstep(0.34, 0.58, n);
    float t3 = smoothstep(0.50, 0.72, n);
    float t4 = smoothstep(0.66, 0.88, n);
    float t5 = smoothstep(0.82, 0.99, n);

    vec3 col = uColorA;
    col = mix(col, uColorB, t1);
    col = mix(col, uColorC, t2);
    col = mix(col, uColorD, t3);
    col = mix(col, uColorE, t4);
    col = mix(col, uColorF, t5);

    // A second, slower noise field softly reintroduces the mid-palette colors
    // so every viewport gets several hues even when the main noise sits in
    // one value range.
    float accent = fbm(uv * 0.85 + vec2(-t * 0.7, t * 0.55));
    vec3 accentCol = mix(uColorC, uColorE, smoothstep(0.25, 0.80, accent));
    col = mix(col, accentCol, 0.18 * smoothstep(0.35, 0.95, accent));

    // Broad chromatic bands guarantee the time palette feels plentiful in
    // every viewport instead of depending entirely on one noise threshold.
    float bandA = 0.5 + 0.5 * sin((uv.x * 2.2 + uv.y * 1.1) + t * 1.3);
    float bandB = 0.5 + 0.5 * sin((uv.x * -1.3 + uv.y * 2.7) - t * 1.1);
    vec3 bandCol = mix(uColorD, uColorF, smoothstep(0.20, 0.90, bandA));
    bandCol = mix(bandCol, uColorB, 0.35 * smoothstep(0.15, 0.85, bandB));
    col = mix(col, bandCol, 0.10);

    // Soft vignette so the centre stays legible WITHOUT crushing the edges
    // into near-black rectangles when the noise sample drifts into a dark
    // region of the palette. 0.78 instead of 0.55 prevents the "black square"
    // artifact the user reported.
    vec2 cv = vUv - 0.5;
    float vig = smoothstep(0.95, 0.30, length(cv));
    col *= mix(0.66, 0.92, vig);

    // Luminance ceiling — keeps the broader palette from ever brightening a
    // patch enough to fight white foreground text. We compute perceived
    // luminance and softly squash anything above the readable threshold,
    // preserving hue while capping value. Threshold tuned so light text
    // retains >=4.5:1 contrast across the whole canvas.
    vec3 finalCol = col * uIntensity;
    float lum = dot(finalCol, vec3(0.2126, 0.7152, 0.0722));
    float cap = 0.34;
    if (lum > cap) {
      finalCol *= cap / max(lum, 0.0001);
    }
    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

// Convert "r, g, b" CSS triplet (e.g. "0, 123, 255") into THREE.Color
const triple = (s: string): THREE.Color => {
  const [r, g, b] = s.split(',').map((v) => parseInt(v.trim(), 10) / 255);
  return new THREE.Color(r, g, b);
};

// Map time-of-day to six palette colors. Each palette uses contrasting
// hues across cool + warm + accent so the page never reads as monochrome.
const palettesByPhase = {
  dawn: {
    bg: triple('14, 10, 30'),     // dark plum sky
    a:  triple('48, 30, 124'),    // royal violet
    b:  triple('168, 50, 132'),   // dim fuchsia
    c:  triple('198, 86, 74'),    // ember coral
    d:  triple('170, 132, 56'),   // dim gold
    e:  triple('40, 132, 120'),   // deep mint teal
  },
  day: {
    bg: triple('8, 18, 34'),      // dark readable sky
    a:  triple('22, 70, 132'),    // deep blue
    b:  triple('30, 118, 138'),   // dim cyan
    c:  triple('28, 132, 96'),    // aurora green
    d:  triple('148, 110, 56'),   // muted amber
    e:  triple('160, 64, 110'),   // dim berry
  },
  dusk: {
    bg: triple('20, 8, 34'),      // wine shadow
    a:  triple('78, 38, 138'),    // violet
    b:  triple('176, 56, 140'),   // magenta
    c:  triple('196, 86, 60'),    // ember
    d:  triple('176, 126, 60'),   // amber
    e:  triple('40, 132, 144'),   // teal contrast
  },
  night: {
    bg: triple('8, 12, 28'),      // midnight
    a:  triple('60, 40, 138'),    // indigo
    b:  triple('148, 56, 174'),   // orchid
    c:  triple('190, 70, 128'),   // neon rose (dimmed)
    d:  triple('54, 168, 178'),   // aurora cyan (dimmed)
    e:  triple('90, 178, 124'),   // electric green (dimmed)
  },
};

const phaseFromHour = (hour: number): keyof typeof palettesByPhase => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

const intensityByPhase: Record<keyof typeof palettesByPhase, number> = {
  dawn: 0.84,
  day: 0.72,
  dusk: 0.86,
  night: 0.94,
};

const AuroraPlane: React.FC<{ phase: keyof typeof palettesByPhase; intensity: number; mouseInfluence: number }> = ({ phase, intensity, mouseInfluence }) => {
  const material = useRef<THREE.ShaderMaterial>(null);
  const startRef = useRef(performance.now());
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const { viewport } = useThree();

  const uniforms = useMemo(() => {
    const p = palettesByPhase[phase];
    return {
      uTime:           { value: 0 },
      uResolution:     { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uColorA:         { value: p.bg.clone() },
      uColorB:         { value: p.a.clone() },
      uColorC:         { value: p.b.clone() },
      uColorD:         { value: p.c.clone() },
      uColorE:         { value: p.d.clone() },
      uColorF:         { value: p.e.clone() },
      uIntensity:      { value: intensity },
      uMouse:          { value: new THREE.Vector2(0.5, 0.5) },
      uMouseInfluence: { value: mouseInfluence },
      uScroll:         { value: 0 },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync scroll into the shader. Use Lenis scroll callback directly (avoids
  // the continuous rAF polling that was causing the aurora to update on
  // every frame even when idle — a likely source of perceived jitter).
  const scrollTarget = useRef(0);
  useEffect(() => {
    const SCROLL_TO_FBM = 1 / 600;
    let cleanup: (() => void) | null = null;
    const attach = () => {
      // Lazy import to avoid a cycle if AuroraShader mounts before App's
      // Lenis effect runs.
      import('../utils/lenis').then(({ getLenis }) => {
        const lenis = getLenis();
        const update = (scroll: number) => {
          scrollTarget.current = scroll * SCROLL_TO_FBM;
        };
        if (lenis) {
          update(lenis.scroll || window.scrollY || 0);
          const handle = ({ scroll }: { scroll: number }) => update(scroll);
          lenis.on('scroll', handle);
          cleanup = () => lenis.off('scroll', handle);
        } else {
          const onScroll = () => update(window.scrollY || document.documentElement.scrollTop || 0);
          window.addEventListener('scroll', onScroll, { passive: true });
          cleanup = () => window.removeEventListener('scroll', onScroll);
        }
      });
    };
    attach();
    // Retry once after a tick in case Lenis attaches slightly later.
    const retry = setTimeout(attach, 200);
    return () => {
      clearTimeout(retry);
      cleanup?.();
    };
  }, []);

  // Window-level pointer tracking. Refs (not state) keep this off the React
  // render path; the lerp in useFrame turns it into a smoothed uniform update.
  useEffect(() => {
    if (mouseInfluence <= 0) return;
    const onMove = (e: PointerEvent) => {
      mouseTarget.current.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      );
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouseInfluence]);

  // Smoothly cross-fade colors when the phase changes
  const target = useMemo(() => palettesByPhase[phase], [phase]);
  useFrame(() => {
    if (!material.current) return;
    const u = material.current.uniforms;
    u.uTime.value = (performance.now() - startRef.current) / 1000;
    (u.uColorA.value as THREE.Color).lerp(target.bg, 0.02);
    (u.uColorB.value as THREE.Color).lerp(target.a,  0.02);
    (u.uColorC.value as THREE.Color).lerp(target.b,  0.02);
    (u.uColorD.value as THREE.Color).lerp(target.c,  0.02);
    (u.uColorE.value as THREE.Color).lerp(target.d,  0.02);
    (u.uColorF.value as THREE.Color).lerp(target.e,  0.02);
    u.uIntensity.value += (intensity - u.uIntensity.value) * 0.05;
    (u.uMouse.value as THREE.Vector2).lerp(mouseTarget.current, 0.08);
    // Ease the scroll uniform so abrupt jumps (anchor navigation) sweep
    // smoothly rather than snapping the aurora.
    u.uScroll.value += (scrollTarget.current - u.uScroll.value) * 0.12;
    (u.uResolution.value as THREE.Vector2).set(window.innerWidth, window.innerHeight);
  });

  return (
    <mesh frustumCulled={false} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

const AuroraShader: React.FC = () => {
  let phase: keyof typeof palettesByPhase = 'night';
  try {
    const ctx = useTime();
    phase = phaseFromHour(ctx.hour);
  } catch {
    /* fallback */
  }

  const isLowPerf = isLowPerformanceDevice();
  const dpr: [number, number] = isLowPerf ? [1, 1] : [1, 1.5];
  // Keep the aurora colorful but dark enough for white foreground text.
  // Daytime used to wash into pastel green/cyan, so it intentionally gets
  // the lowest multiplier.
  const intensity = (isLowPerf ? 0.82 : 1.0) * intensityByPhase[phase];
  const mouseInfluence = isLowPerf ? 0 : 1;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        frameloop="always"
      >
        <AuroraPlane phase={phase} intensity={intensity} mouseInfluence={mouseInfluence} />
      </Canvas>
    </div>
  );
};

export default React.memo(AuroraShader);
