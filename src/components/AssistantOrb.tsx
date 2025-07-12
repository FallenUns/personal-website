import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './AssistantOrb.css';

interface AssistantOrbProps {
  className?: string;
  size?: number;
  showControls?: boolean;
  isHovered?: boolean;
  isThinking?: boolean;
}

interface MousePos {
  x: number;
  y: number;
}

interface Rotation {
  x: number;
  y: number;
}

const AssistantOrb: React.FC<AssistantOrbProps> = ({ 
  className = '', 
  size = 200, 
  showControls = false,
  isHovered = false,
  isThinking: externalIsThinking = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<any>(null);
  
  const [internalIsThinking, setInternalIsThinking] = useState(false);
  
  // Use external thinking state if provided, otherwise use internal state
  const isThinking = externalIsThinking || internalIsThinking;

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    class AIOrb {
      container: HTMLElement;
      canvas: HTMLCanvasElement;
      isThinking: boolean;
      mousePos: MousePos;
      hovering: boolean;
      isDragging: boolean;
      previousMousePos: MousePos;
      rotationVelocity: Rotation;
      userRotation: Rotation;
      autoRotation: Rotation;
      isPressed: boolean;
      pressScale: number;
      targetScale: number;
      clickStartTime: number;
      minClickDuration: number;
      scene!: THREE.Scene;
      camera!: THREE.PerspectiveCamera;
      renderer!: THREE.WebGLRenderer;
      sphereRadius!: number;
      dotCount!: number;
      dots!: any[];
      originalPositions!: THREE.Vector3[];
      targetPositions!: THREE.Vector3[];
      pointCloud!: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
      raycaster!: THREE.Raycaster;
      mouse!: THREE.Vector2;
      animationId: number | null;

      constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
        this.container = container;
        this.canvas = canvas;
        this.isThinking = false;
        this.mousePos = { x: 0, y: 0 };
        this.hovering = false;
        this.isDragging = false;
        this.previousMousePos = { x: 0, y: 0 };
        this.rotationVelocity = { x: 0, y: 0 };
        this.userRotation = { x: 0, y: 0 };
        this.autoRotation = { x: 0, y: 0 };
        this.isPressed = false;
        this.pressScale = 1.0;
        this.targetScale = 1.0;
        this.clickStartTime = 0;
        this.minClickDuration = 100;
        this.animationId = null;

        this.init();
        this.setupEventListeners();
        this.animate();
      }

      init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
          canvas: this.canvas, 
          antialias: true, 
          alpha: true 
        });
        this.renderer.setSize(size, size);
        this.renderer.setClearColor(0x000000, 0);
        
        this.camera.position.z = 3;
        
        this.sphereRadius = 1;
        this.dotCount = 800;
        this.dots = [];
        this.originalPositions = [];
        this.targetPositions = [];
        
        this.createDottedSphere();
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
      }

      createDottedSphere() {
        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colors: number[] = [];
        
        const phi = Math.PI * (3 - Math.sqrt(5));
        
        for (let i = 0; i < this.dotCount; i++) {
          const y = 1 - (i / (this.dotCount - 1)) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = phi * i;
          
          const x = Math.cos(theta) * radius * this.sphereRadius;
          const z = Math.sin(theta) * radius * this.sphereRadius;
          const finalY = y * this.sphereRadius;
          
          positions.push(x, finalY, z);
          this.originalPositions.push(new THREE.Vector3(x, finalY, z));
          this.targetPositions.push(new THREE.Vector3(x, finalY, z));
          
          const intensity = (finalY + this.sphereRadius) / (2 * this.sphereRadius);
          // Orange to blue gradient - orange at top, blue at bottom
          const r = 1.0 - intensity * 0.8;  // From orange (high red) to blue (low red)
          const g = 0.6 - intensity * 0.4;  // From orange (medium green) to blue (low green)
          const b = 0.2 + intensity * 0.8;  // From orange (low blue) to blue (high blue)
          colors.push(r, g, b);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
          size: 0.08,  // Increased thickness for more prominent dots
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,  // Increased opacity for better visibility
          blending: THREE.AdditiveBlending  // Add glow effect
        });
        
        this.pointCloud = new THREE.Points(geometry, material);
        this.scene.add(this.pointCloud);
      }

      setupEventListeners() {
        this.container.addEventListener('mousedown', (e) => {
          this.handlePressStart(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
          this.handleMove(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', () => {
          this.handlePressEnd();
        });
        
        this.container.addEventListener('touchstart', (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          this.handlePressStart(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchmove', (e) => {
          if (e.touches.length > 0) {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMove(touch.clientX, touch.clientY);
          }
        });
        
        document.addEventListener('touchend', () => {
          this.handlePressEnd();
        });
        
        this.container.addEventListener('mouseenter', () => {
          this.hovering = true;
          (this.pointCloud.material as THREE.PointsMaterial).size = 0.10;  // Thicker hover effect
        });
        
        this.container.addEventListener('mouseleave', () => {
          this.hovering = false;
          if (!this.isThinking) {
            (this.pointCloud.material as THREE.PointsMaterial).size = 0.08;  // Back to thicker base size
          }
        });
      }

      handlePressStart(x: number, y: number) {
        this.isDragging = true;
        this.isPressed = true;
        this.clickStartTime = Date.now();
        this.container.classList.add('dragging', 'clicked');
        this.previousMousePos = { x, y };
        this.rotationVelocity = { x: 0, y: 0 };
        this.targetScale = 0.9;
        
        (this.pointCloud.material as THREE.PointsMaterial).size = 0.05;  // Pressed state - slightly smaller than base
        (this.pointCloud.material as THREE.PointsMaterial).opacity = 0.7;
      }

      handleMove(x: number, y: number) {
        if (!this.isDragging) return;
        
        const deltaX = x - this.previousMousePos.x;
        const deltaY = y - this.previousMousePos.y;
        
        const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (moveDistance > 5) {
          const rotationScale = 0.01;
          this.userRotation.y += deltaX * rotationScale;
          this.userRotation.x += deltaY * rotationScale;
          
          this.rotationVelocity.x = deltaY * rotationScale * 0.1;
          this.rotationVelocity.y = deltaX * rotationScale * 0.1;
        }
        
        this.previousMousePos = { x, y };
      }

      handlePressEnd() {
        this.isDragging = false;
        this.container.classList.remove('dragging', 'clicked');
        
        const pressDuration = Date.now() - this.clickStartTime;
        const releaseDelay = Math.max(0, this.minClickDuration - pressDuration);
        
        setTimeout(() => {
          this.isPressed = false;
          this.targetScale = 1.0;
          
          if (!this.hovering && !this.isThinking) {
            (this.pointCloud.material as THREE.PointsMaterial).size = 0.08;  // Thicker base size
          }
          (this.pointCloud.material as THREE.PointsMaterial).opacity = 0.9;
        }, releaseDelay);
      }

      scrambleDots() {
        for (let i = 0; i < this.dotCount; i++) {
          const y = (Math.random() - 0.5) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = Math.random() * 2 * Math.PI;
          
          const x = Math.cos(theta) * radius * this.sphereRadius;
          const z = Math.sin(theta) * radius * this.sphereRadius;
          const finalY = y * this.sphereRadius;
          
          this.targetPositions[i].set(x, finalY, z);
        }
      }

      resetToOriginalPositions() {
        for (let i = 0; i < this.originalPositions.length; i++) {
          this.targetPositions[i].copy(this.originalPositions[i]);
        }
      }

      setThinking(thinking: boolean) {
        this.isThinking = thinking;
        
        if (this.isThinking) {
          this.scrambleDots();
        } else {
          this.resetToOriginalPositions();
        }
      }

      setHover(hovered: boolean) {
        this.hovering = hovered;
        if (hovered && !this.isThinking && !this.isPressed) {
          (this.pointCloud.material as THREE.PointsMaterial).size = 0.10;  // Thicker hover size
        } else if (!hovered && !this.isThinking && !this.isPressed) {
          (this.pointCloud.material as THREE.PointsMaterial).size = 0.08;  // Thicker base size
        }
      }

      reset() {
        this.isThinking = false;
        this.hovering = false;
        this.isDragging = false;
        this.isPressed = false;
        this.userRotation = { x: 0, y: 0 };
        this.autoRotation = { x: 0, y: 0 };
        this.rotationVelocity = { x: 0, y: 0 };
        this.pressScale = 1.0;
        this.targetScale = 1.0;
        this.resetToOriginalPositions();
        this.container.classList.remove('dragging', 'clicked');
      }

      animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        
        const time = Date.now() * 0.001;
        
        this.pressScale += (this.targetScale - this.pressScale) * 0.15;
        this.pointCloud.scale.setScalar(this.pressScale);
        
        if (!this.isDragging) {
          this.userRotation.x += this.rotationVelocity.x;
          this.userRotation.y += this.rotationVelocity.y;
          
          this.rotationVelocity.x *= 0.98;
          this.rotationVelocity.y *= 0.98;
          
          if (Math.abs(this.rotationVelocity.x) < 0.001 && Math.abs(this.rotationVelocity.y) < 0.001) {
            this.autoRotation.y += 0.005;
            this.autoRotation.x += 0.002;
          }
        }
        
        this.pointCloud.rotation.x = this.userRotation.x + this.autoRotation.x;
        this.pointCloud.rotation.y = this.userRotation.y + this.autoRotation.y;
        
        if (this.isThinking) {
          const pulse = Math.sin(time * 4) * 0.5 + 0.5;
          (this.pointCloud.material as THREE.PointsMaterial).opacity = 0.5 + pulse * 0.5;
          (this.pointCloud.material as THREE.PointsMaterial).size = 0.08 + pulse * 0.05;  // Thicker thinking animation
          
          if (Math.sin(time * 2) > 0.95) {
            this.scrambleDots();
          }
        } else if (!this.isPressed) {
          (this.pointCloud.material as THREE.PointsMaterial).opacity = 0.9;
          if (!this.hovering) {
            (this.pointCloud.material as THREE.PointsMaterial).size = 0.08;  // Thicker base size
          }
        }
        
        if (this.hovering && !this.isThinking && !this.isPressed) {
          (this.pointCloud.material as THREE.PointsMaterial).size = 0.10;  // Thicker hover size
        }
        
        const positions = this.pointCloud.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.originalPositions.length; i++) {
          const index = i * 3;
          const current = new THREE.Vector3(
            positions[index],
            positions[index + 1],
            positions[index + 2]
          );
          const target = this.targetPositions[i];
          
          const lerpSpeed = this.isThinking ? 0.05 : 0.1;
          current.lerp(target, lerpSpeed);
          
          positions[index] = current.x;
          positions[index + 1] = current.y;
          positions[index + 2] = current.z;
        }
        
        this.pointCloud.geometry.attributes.position.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
      }

      destroy() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }
        this.renderer.dispose();
        this.scene.clear();
      }
    }

    const orb = new AIOrb(containerRef.current, canvasRef.current);
    orbRef.current = orb;

    return () => {
      orb.destroy();
    };
  }, [size]);

  useEffect(() => {
    if (orbRef.current) {
      orbRef.current.setThinking(isThinking);
    }
  }, [isThinking]);

  useEffect(() => {
    if (orbRef.current) {
      orbRef.current.setHover(isHovered);
    }
  }, [isHovered]);

  const toggleThinking = () => {
    if (!externalIsThinking) {
      setInternalIsThinking(!internalIsThinking);
    }
  };

  const reset = () => {
    if (!externalIsThinking) {
      setInternalIsThinking(false);
    }
    if (orbRef.current) {
      orbRef.current.reset();
    }
  };

  return (
    <div className={`ai-orb-wrapper ${className}`}>
      <div 
        ref={containerRef}
        className="ai-orb-container"
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          cursor: 'grab',
          transition: 'transform 0.1s ease',
        }}
      >
        <canvas 
          ref={canvasRef}
          className="ai-orb-canvas"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
          }}
        />
        
        {showControls && (
          <>
            <div 
              className="ai-orb-instructions"
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              Click and drag to rotate the orb
            </div>
            
            <div 
              className="ai-orb-controls"
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={toggleThinking}
                className={`ai-orb-button ${isThinking ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  background: isThinking 
                    ? 'rgba(64, 224, 255, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: isThinking
                    ? '1px solid rgba(64, 224, 255, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  if (!isThinking) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isThinking) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {isThinking ? 'Stop Thinking' : 'Toggle Thinking'}
              </button>
              
              <button
                onClick={reset}
                className="ai-orb-button"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssistantOrb;