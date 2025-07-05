import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
#define M_PI 3.1415926535897932384626433832795

uniform vec3 uLightAColor;
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;
uniform vec3 uLightBColor;
uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

uniform vec2 uSubdivision;
uniform vec3 uOffset;

uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

uniform float uFresnelOffset;
uniform float uFresnelMultiplier;
uniform float uFresnelPower;

uniform float uTime;
uniform vec2 uMousePosition;
uniform float uMouseInfluence;

varying vec3 vColor;

// Corrected 4D Perlin noise function
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float perlin4d(vec4 P){
  vec4 Pi0 = floor(P); // Integer part for indexing
  vec4 Pi1 = Pi0 + vec4(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec4 Pf0 = fract(P); // Fractional part for interpolation
  vec4 Pf1 = Pf0 - vec4(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0.0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1010 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0110 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1110 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0001 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1001 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0101 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1101 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm01.x;
  g0110 *= norm01.y;
  g1010 *= norm01.z;
  g1110 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm10.x;
  g0101 *= norm10.y;
  g1001 *= norm10.z;
  g1101 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}

vec3 getDisplacedPosition(vec3 _position)
{
    vec3 distoredPosition = _position;
    distoredPosition += perlin4d(vec4(distoredPosition * uDistortionFrequency + uOffset, uTime)) * uDistortionStrength;

    float perlinStrength = perlin4d(vec4(distoredPosition * uDisplacementFrequency + uOffset, uTime));
    
    // Add mouse influence
    float mouseDistance = distance(uMousePosition, _position.xy);
    float mouseEffect = exp(-mouseDistance * 2.0) * uMouseInfluence;
    
    vec3 displacedPosition = _position;
    displacedPosition += normalize(_position) * perlinStrength * uDisplacementStrength;
    displacedPosition += normalize(_position) * mouseEffect * 0.5;

    return displacedPosition;
}

void main()
{
    vec3 displacedPosition = getDisplacedPosition(position);
    vec4 viewPosition = viewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    // Simplified normal calculation for tangent/bitangent
    vec3 displacedNormal = normalize(displacedPosition);

    // Fresnel
    vec3 viewDirection = normalize(displacedPosition.xyz - cameraPosition);
    float fresnel = uFresnelOffset + (1.0 + dot(viewDirection, displacedNormal)) * uFresnelMultiplier;
    fresnel = pow(max(0.0, fresnel), uFresnelPower);

    // Color calculation
    float lightAIntensity = max(0.0, -dot(displacedNormal.xyz, normalize(-uLightAPosition))) * uLightAIntensity;
    float lightBIntensity = max(0.0, -dot(displacedNormal.xyz, normalize(-uLightBPosition))) * uLightBIntensity;

    vec3 color = vec3(0.0);
    color = mix(color, uLightAColor, lightAIntensity * fresnel);
    color = mix(color, uLightBColor, lightBIntensity * fresnel);
    
    // Ensure minimum visibility
    color = max(color, vec3(0.1));

    vColor = color;
}
`;

const fragmentShader = `
varying vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);
}
`;

// Create custom shader material
const DisplacedSphereMaterial = shaderMaterial(
  {
    // Lighting uniforms
    uLightAColor: new THREE.Color('#ff6030'),
    uLightAPosition: new THREE.Vector3(1, 1, 0),
    uLightAIntensity: 1.0,
    uLightBColor: new THREE.Color('#0060ff'),
    uLightBPosition: new THREE.Vector3(-1, -1, 0),
    uLightBIntensity: 1.0,

    // Geometry uniforms
    uSubdivision: new THREE.Vector2(64, 64),
    uOffset: new THREE.Vector3(0, 0, 0),

    // Distortion uniforms
    uDistortionFrequency: 1.0,
    uDistortionStrength: 0.1,
    uDisplacementFrequency: 1.0,
    uDisplacementStrength: 0.1,

    // Fresnel uniforms
    uFresnelOffset: 0.0,
    uFresnelMultiplier: 1.0,
    uFresnelPower: 2.0,

    // Animation uniforms
    uTime: 0,
    uMousePosition: new THREE.Vector2(0, 0),
    uMouseInfluence: 0.0,
  },
  vertexShader,
  fragmentShader
);

// Extend Three.js with our custom material
extend({ DisplacedSphereMaterial });

// TypeScript declaration for the custom material
declare module '@react-three/fiber' {
  interface ThreeElements {
    displacedSphereMaterial: any;
  }
}

interface SphereProps {
  isHovered: boolean;
  isThinking: boolean;
}

function AnimatedSphere({ isHovered, isThinking }: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseInfluence, setMouseInfluence] = useState(0);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = document.getElementById('assistant-orb-container')?.getBoundingClientRect();
      if (rect) {
        // Convert mouse position to normalized coordinates relative to the orb container
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update mouse influence based on hover and thinking states
  useEffect(() => {
    const targetInfluence = isHovered ? 0.3 : isThinking ? 0.5 : 0.1;
    setMouseInfluence(targetInfluence);
  }, [isHovered, isThinking]);

  // Animation loop
  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Update time for animation
      materialRef.current.uTime = clock.getElapsedTime() * 0.5;
      
      // Smooth mouse position updates
      const current = materialRef.current.uMousePosition;
      current.x += (mousePosition.x - current.x) * 0.1;
      current.y += (mousePosition.y - current.y) * 0.1;
      
      // Smooth mouse influence
      const currentInfluence = materialRef.current.uMouseInfluence;
      materialRef.current.uMouseInfluence += (mouseInfluence - currentInfluence) * 0.05;

      // Dynamic parameters based on state
      if (isThinking) {
        materialRef.current.uDisplacementStrength = 0.15 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
        materialRef.current.uDistortionStrength = 0.15 + Math.cos(clock.getElapsedTime() * 1.5) * 0.05;
      } else {
        materialRef.current.uDisplacementStrength = 0.1;
        materialRef.current.uDistortionStrength = 0.1;
      }
    }

    // Gentle rotation
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 64]} />
      <displacedSphereMaterial
        ref={materialRef}
      />
    </mesh>
  );
}

interface AssistantOrbProps {
  isHovered: boolean;
  isThinking: boolean;
}

const AssistantOrb: React.FC<AssistantOrbProps> = ({ isHovered, isThinking }) => {
  return (
    <div 
      id="assistant-orb-container"
      style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <AnimatedSphere isHovered={isHovered} isThinking={isThinking} />
      </Canvas>
    </div>
  );
};

export default AssistantOrb;