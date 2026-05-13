import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { isLowPerformanceDevice } from '../utils/performance';

// Internal aurora-colored backdrop plane so the glass actually has
// something visible to refract. Without this, MeshTransmissionMaterial
// only refracts the Environment (sky/HDR), which reads as grey chrome.
const auroraBackdropFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
  }
  float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.55;}return v;}

  void main(){
    float t = uTime*0.08;
    float n = fbm(vUv*2.5 + vec2(t, -t*0.7));
    vec3 c1 = vec3(0.12,0.05,0.20);
    vec3 c2 = vec3(0.85,0.25,0.55);
    vec3 c3 = vec3(1.00,0.65,0.30);
    vec3 c4 = vec3(0.50,0.85,1.00);
    vec3 col = mix(c1, c2, smoothstep(0.1,0.45,n));
    col = mix(col, c3, smoothstep(0.4,0.7,n));
    col = mix(col, c4, smoothstep(0.65,0.95,n));
    gl_FragColor = vec4(col, 1.0);
  }
`;
const auroraBackdropVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const Backdrop: React.FC = () => {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const t0 = useRef(performance.now());
  useFrame(() => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = (performance.now() - t0.current) / 1000;
    }
  });
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  return (
    <mesh position={[0, 0, -1.6]}>
      <planeGeometry args={[5, 5]} />
      <shaderMaterial
        ref={mat}
        vertexShader={auroraBackdropVertex}
        fragmentShader={auroraBackdropFragment}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
};

/**
 * Floating refractive glass shape. Real refraction via drei's
 * MeshTransmissionMaterial — the material samples the page behind
 * the Canvas at runtime and bends pixels through an IOR/thickness
 * model. This is the real thing, not the CSS displacement fake.
 *
 * The Canvas has pointerEvents:none and alpha:true so it overlays
 * the page without blocking clicks or scroll.
 */

interface GlassOrbProps {
  /** CSS size of the canvas. Defaults to 320px. */
  size?: number;
  /** "torus" = donut, "knot" = trefoil knot, "ico" = icosahedron. */
  shape?: 'torus' | 'knot' | 'ico';
}

const Shape: React.FC<{ shape: 'torus' | 'knot' | 'ico'; samples: number; resolution: number }> = ({
  shape, samples, resolution,
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
  });

  const geometry =
    shape === 'torus' ? <torusGeometry args={[0.9, 0.35, 64, 200]} />
    : shape === 'knot' ? <torusKnotGeometry args={[0.75, 0.25, 256, 64]} />
    : <icosahedronGeometry args={[1.1, 4]} />;

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
      <mesh ref={ref}>
        {geometry}
        {/* Real refraction via MeshTransmissionMaterial.
            Key props per the drei + Codrops tutorial:
              transmission:1, transmissionSampler, ior, thickness,
              chromaticAberration, anisotropicBlur, samples, resolution. */}
        <MeshTransmissionMaterial
          transmission={1}
          transmissionSampler
          backside
          backsideThickness={0.4}
          thickness={0.55}
          ior={1.4}
          chromaticAberration={0.18}
          anisotropy={0.25}
          distortion={0.25}
          distortionScale={0.35}
          temporalDistortion={0.1}
          roughness={0.0}
          attenuationDistance={1.4}
          attenuationColor={'#ffffff'}
          color={'#ffffff'}
          samples={samples}
          resolution={resolution}
        />
      </mesh>
    </Float>
  );
};

const GlassOrb: React.FC<GlassOrbProps> = ({ size = 320, shape = 'knot' }) => {
  const isLowPerf = isLowPerformanceDevice();
  const samples = isLowPerf ? 4 : 8;
  const resolution = isLowPerf ? 128 : 256;

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 38 }}
        dpr={isLowPerf ? [1, 1] : [1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: isLowPerf ? 'low-power' : 'high-performance',
          stencil: false,
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {/* Colorful backdrop INSIDE the canvas so the glass has something
              vibrant to refract. MeshTransmissionMaterial with
              transmissionSampler can only sample the WebGL scene. */}
          <Backdrop />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <directionalLight position={[-4, -2, 3]} intensity={0.9} color={'#9eb6ff'} />
          <pointLight position={[0, 0, 2]} intensity={0.7} color={'#ffb088'} />
          <Environment preset="sunset" />
          <Shape shape={shape} samples={samples} resolution={resolution} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default React.memo(GlassOrb);
