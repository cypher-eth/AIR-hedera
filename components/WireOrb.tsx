"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

interface WireOrbProps {
  /** Distortion intensity (0-1) */
  distortion?: number;
  /** Whether the orb is active/speaking */
  isActive?: boolean;
  /** Size of the orb */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Whether the orb is disabled */
  disabled?: boolean;
}

const Orb: React.FC<{ 
  distortion: number; 
  isActive: boolean; 
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}> = ({ distortion = 0, isActive = false, size = 'lg', onClick, disabled = false }) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const ballRef = useRef<THREE.Mesh | null>(null);
  const auraRef = useRef<THREE.Mesh | null>(null);
  const originalPositionsRef = useRef<any | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const noise = createNoise3D();

  // Size configuration
  const sizeConfig = {
    sm: { width: 200, height: 200, radius: 8 },
    md: { width: 300, height: 300, radius: 10 },
    lg: { width: 400, height: 400, radius: 12 }
  };
  const config = sizeConfig[size];

  useEffect(() => {
    initViz();
    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (isActive && ballRef.current) {
      updateBallMorph(ballRef.current, distortion);
    } else if (
      !isActive &&
      ballRef.current &&
      originalPositionsRef.current
    ) {
      resetBallMorph(ballRef.current, originalPositionsRef.current);
    }
  }, [distortion, isActive]);

  const initViz = () => {
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    const camera = new THREE.PerspectiveCamera(
      20,
      1,
      1,
      100,
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);

    scene.add(camera);
    sceneRef.current = scene;
    groupRef.current = group;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(config.width, config.height);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current) {
      mountRef.current.innerHTML = ""; // Clear any existing renderer
      mountRef.current.appendChild(renderer.domElement);
    }

    rendererRef.current = renderer;

    const icosahedronGeometry = new THREE.IcosahedronGeometry(config.radius, 4);
    const lambertMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3b82f6'), // blue
      transparent: true,
      opacity: 0.7,
      roughness: 0.35,
      metalness: 0.15
    });

    const ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    ball.position.set(0, 0, 0);
    ballRef.current = ball;

    // Store the original positions of the vertices
    originalPositionsRef.current =
      ball.geometry.attributes.position.array.slice();

    group.add(ball);

    // Aura (soft outer glow)
    const auraGeometry = new THREE.SphereGeometry(config.radius * 1.15, 32, 32);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#60a5fa'),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    auraRef.current = aura;
    group.add(aura);

    // Base scale to keep extra headroom for high distortion
    group.scale.setScalar(0.5);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    scene.add(group);

    render();
  };

  const render = () => {
    if (
      !groupRef.current ||
      !ballRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !sceneRef.current
    ) {
      return;
    }

    // Rotate the ball
    ballRef.current.rotation.x += 0.01;
    ballRef.current.rotation.y += 0.01;

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(render);
  };

  const onWindowResize = () => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    rendererRef.current.setSize(config.width, config.height);
    cameraRef.current.aspect = 1;
    cameraRef.current.updateProjectionMatrix();
  };

  const updateBallMorph = (mesh: THREE.Mesh, distortionLevel: number) => {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute("position");
    const originalPositions = originalPositionsRef.current;
    
    if (!originalPositions) return;

    // Clamp distortion to a reasonable range (0-1)
    const clampedDistortion = Math.max(0, Math.min(1, distortionLevel));
    
    // Scale down the distortion for more subtle morphing
    const scaledDistortion = clampedDistortion * 0.3;
    
    const time = Date.now() * 0.001;

    // Subtle breathing/expansion for the aura based on distortion
    if (auraRef.current) {
      const auraScale = 1 + clampedDistortion * 0.15;
      auraRef.current.scale.setScalar(auraScale);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + clampedDistortion * 0.25;
    }
    
    for (let i = 0; i < positionAttribute.count; i++) {
      // Get original vertex position
      const originalX = originalPositions[i * 3];
      const originalY = originalPositions[i * 3 + 1];
      const originalZ = originalPositions[i * 3 + 2];
      
      // Create vector from origin
      const vertex = new THREE.Vector3(originalX, originalY, originalZ);
      vertex.normalize();
      
      // Calculate distance with noise and distortion
      const noiseValue = noise(
        vertex.x + time * 0.01,
        vertex.y + time * 0.01,
        vertex.z + time * 0.01
      );
      
      // More controlled morphing with better range
      const morphAmount = noiseValue * scaledDistortion * 2;
      const distance = config.radius + morphAmount;
      vertex.multiplyScalar(distance);
      
      // Update position
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positionAttribute.needsUpdate = true;
  };

  const resetBallMorph = (
    mesh: THREE.Mesh,
    originalPositions: Float32Array,
  ) => {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute("position");

    for (let i = 0; i < positionAttribute.count; i++) {
      positionAttribute.setXYZ(
        i,
        originalPositions[i * 3],
        originalPositions[i * 3 + 1],
        originalPositions[i * 3 + 2],
      );
    }

    positionAttribute.needsUpdate = true;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef}
      className={`cursor-pointer transition-transform duration-300 hover:scale-105 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{ 
        width: config.width,
        height: config.height,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    />
  );
};

const WireOrb: React.FC<WireOrbProps> = ({ 
  distortion = 0, 
  isActive = false, 
  size = 'lg', 
  onClick, 
  disabled = false 
}) => {
  return (
    <Orb 
      distortion={distortion}
      isActive={isActive}
      size={size}
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export default WireOrb;
