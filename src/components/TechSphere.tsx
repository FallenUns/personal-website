import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Text, OrbitControls, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useComponentLoader } from '../contexts/LoadingContext';
import { use3DResourceLoader } from '../hooks/useAssetPreloader';

interface TechData {
  name: string;
  color: number;
  symbol: string;
  logoPath?: string;
}

const techData: TechData[] = [
  { name: 'VS Code', color: 0x007ACC, symbol: '</>', logoPath: '/vite.svg' },
  { name: 'Node.js', color: 0x339933, symbol: 'N' },
  { name: 'React', color: 0x61DAFB, symbol: 'R', logoPath: '/react-logo.png' },
  { name: 'Python', color: 0x3776AB, symbol: 'Py', logoPath: '/python-logo.png' },
  { name: 'JavaScript', color: 0xF7DF1E, symbol: 'JS', logoPath: '/js-logo.png' },
  { name: 'Docker', color: 0x2496ED, symbol: '🐳' },
  { name: 'Git', color: 0xF05032, symbol: 'G' },
  { name: 'TensorFlow', color: 0xFF6F00, symbol: 'TF', logoPath: '/tensorflow-logo.png' }
];

function createOrbitPath(radiusX: number, radiusY: number, radiusZ: number, tiltX: number, tiltY: number, tiltZ: number, centerOffset: THREE.Vector3) {
  const points: THREE.Vector3[] = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    let x = Math.cos(angle) * radiusX;
    let y = Math.sin(angle) * radiusY;
    let z = Math.sin(angle * 2) * radiusZ;

    // Apply rotations for tilted orbits
    const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
    const cosY = Math.cos(tiltY), sinY = Math.sin(tiltY);
    const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ);

    // Rotate around X axis
    let newY = y * cosX - z * sinX;
    let newZ = y * sinX + z * cosX;
    y = newY;
    z = newZ;

    // Rotate around Y axis
    let newX = x * cosY + z * sinY;
    newZ = -x * sinY + z * cosY;
    x = newX;
    z = newZ;

    // Rotate around Z axis
    newX = x * cosZ - y * sinZ;
    newY = x * sinZ + y * cosZ;
    x = newX;
    y = newY;

    // Add center offset to move orbit center
    points.push(new THREE.Vector3(x + centerOffset.x, y + centerOffset.y, z + centerOffset.z));
  }

  return points;
}

interface LogoMeshProps {
  logoPath: string;
}

function LogoMesh({ logoPath }: LogoMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, logoPath);
  
  useFrame(({ camera }) => {
    if (meshRef.current) {
      // Make logo always face the camera
      meshRef.current.lookAt(camera.position);
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 1.3]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        alphaTest={0.1}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

interface OrbitingSphereProps {
  tech: TechData;
  index: number;
  onSphereClick: (tech: TechData) => void;
}

function OrbitingSphere({ tech, index, onSphereClick }: OrbitingSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const orbitData = useMemo(() => {
    // Create wider distribution with bias towards right side
    const baseRadius = 8 + Math.random() * 12; // Increased range
    const radiusX = baseRadius + Math.random() * 8; // More variation
    const radiusY = baseRadius * (0.4 + Math.random() * 0.9); // Wider Y range
    const radiusZ = Math.random() * 8; // Increased Z variation

    const tiltX = (Math.random() - 0.5) * Math.PI * 0.9;
    const tiltY = (Math.random() - 0.5) * Math.PI * 0.9;
    const tiltZ = (Math.random() - 0.5) * Math.PI * 0.9;

    // Create different center offsets for each sphere to spread them out
    const centerOffset = new THREE.Vector3(
      -2 + (index % 3) * 4, // Spread across X axis (-2, 2, 6)
      (Math.random() - 0.5) * 6, // Random Y offset
      (Math.random() - 0.5) * 4  // Random Z offset
    );

    const orbitPoints = createOrbitPath(radiusX, radiusY, radiusZ, tiltX, tiltY, tiltZ, centerOffset);
    
    return {
      orbitPoints,
      speed: 0.01 + Math.random() * 0.01,
      direction: Math.random() > 0.5 ? 1 : -1,
      currentIndex: Math.random() * orbitPoints.length
    };
  }, [index]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Move along orbit path
    orbitData.currentIndex += orbitData.speed * orbitData.direction;

    if (orbitData.currentIndex >= orbitData.orbitPoints.length) {
      orbitData.currentIndex = 0;
    } else if (orbitData.currentIndex < 0) {
      orbitData.currentIndex = orbitData.orbitPoints.length - 1;
    }

    // Get current and next points for smooth interpolation
    const currentIdx = Math.floor(orbitData.currentIndex);
    const nextIdx = (currentIdx + 1) % orbitData.orbitPoints.length;
    const t = orbitData.currentIndex - currentIdx;

    // Interpolate between points
    const currentPoint = orbitData.orbitPoints[currentIdx];
    const nextPoint = orbitData.orbitPoints[nextIdx];
    
    groupRef.current.position.lerpVectors(currentPoint, nextPoint, t);

    // Rotate individual spheres
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.001;

    // Pulsing effect for inner glow
    if (innerGlowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      innerGlowRef.current.scale.setScalar(scale);
    }

    // Scale effect on hover
    const targetScale = hovered ? 1.2 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group ref={groupRef}>
      {/* Main sphere */}
      <mesh 
        ref={sphereRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onSphereClick(tech)}
      >
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshTransmissionMaterial
          color={tech.color}
          thickness={hovered ? 1.2 : 0.8}
          roughness={0.1}
          transmission={0.95}
          ior={1.4}
          chromaticAberration={0.06}
          backside={true}
          distortion={0.1}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          opacity={hovered ? 0.6 : 0.4}
          transparent
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <MeshTransmissionMaterial 
          color={tech.color}
          thickness={0.3}
          transmission={0.7}
          ior={1.2}
          roughness={0.3}
          chromaticAberration={0.04}
          distortion={0.05}
          backside={true}
          opacity={0.3}
          transparent
        />
      </mesh>

      {/* Logo display */}
      {tech.logoPath ? (
        <Suspense fallback={null}>
          <LogoMesh logoPath={tech.logoPath} />
        </Suspense>
      ) : (
        <mesh position={[0, 0, 1.3]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial 
            color={0xffffff}
            transparent
            opacity={0.8}
          />
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.4}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {tech.symbol}
          </Text>
        </mesh>
      )}

      {/* Text label */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        visible={hovered}
      >
        {tech.name}
      </Text>
    </group>
  );
}

interface TechSphereSceneProps {
  onSphereClick: (tech: TechData) => void;
}

function TechSphereScene({ onSphereClick }: TechSphereSceneProps) {
  return (
    <>
      {/* Enhanced lighting for glass effect */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, 0, 0]} intensity={0.8} color={0x4a90e2} />
      <pointLight position={[10, 0, 0]} intensity={0.8} color={0xe74c3c} />
      <pointLight position={[0, 10, 0]} intensity={0.6} color={0xffffff} />

      {/* Orbiting spheres */}
      {techData.map((tech, index) => (
        <OrbitingSphere 
          key={tech.name}
          tech={tech}
          index={index}
          onSphereClick={onSphereClick}
        />
      ))}
    </>
  );
}

const TechSphere: React.FC = () => {
  useComponentLoader('TechSphere'); // Register for loading tracking
  use3DResourceLoader('TechSphere-3D'); // Register 3D resources
  const [selectedTech, setSelectedTech] = useState<TechData | null>(null);

  const handleSphereClick = (tech: TechData) => {
    setSelectedTech(tech);
    setTimeout(() => setSelectedTech(null), 3000);
  };

  return (
    <div className="relative w-full h-full min-h-[700px]">
      {/* Info panel */}
      <div className="absolute top-4 left-4 z-10 bg-black/30 backdrop-blur-lg rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-bold mb-2">
          🌌 {selectedTech ? selectedTech.name : 'Multi-Orbital Technology'}
        </h3>
        <p className="text-sm">
          {selectedTech 
            ? 'Technology sphere activated!' 
            : 'Drag to rotate • Click spheres to interact'
          }
        </p>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        className="w-full h-full"
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          // Optimize for performance
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        dpr={[1, 2]} // Limit device pixel ratio for performance
        frameloop="demand" // Only render when needed during loading
      >
        <TechSphereScene 
          onSphereClick={handleSphereClick}
        />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
          minDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default React.memo(TechSphere);