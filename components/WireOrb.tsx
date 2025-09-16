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
  const auraRefs = useRef<THREE.Mesh[]>([]); // Refs for multiple aura layers
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
      // Reset all aura layers
      const baseOpacities = [0.08, 0.12, 0.15]; // More transparent hint colors (teal, salmon, purple)
      auraRefs.current.forEach((aura, index) => {
        if (aura) {
          aura.scale.setScalar(1);
          (aura.material as THREE.MeshBasicMaterial).opacity = baseOpacities[index];
        }
      });
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

    // Use ultra-high-resolution sphere for perfectly smooth core orb
    const sphereGeometry = new THREE.SphereGeometry(config.radius * 0.8, 128, 128); // Ultra-high subdivision for maximum smoothness
    
    // Apply smoothing to the core orb
    sphereGeometry.computeVertexNormals();
    
    // Add subtle organic wave distortion to the core
    const positionAttribute = sphereGeometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Calculate distance from center
      const distance = Math.sqrt(x * x + y * y + z * z);
      const normalizedX = x / distance;
      const normalizedY = y / distance;
      const normalizedZ = z / distance;
      
      // Add subtle wave distortion for organic feel
      const wave1 = Math.sin(normalizedX * 2.0) * Math.cos(normalizedY * 3.0) * 0.05;
      const wave2 = Math.sin(normalizedY * 3.0) * Math.cos(normalizedZ * 2.0) * 0.04;
      const wave3 = Math.sin(normalizedZ * 2.5) * Math.cos(normalizedX * 3.5) * 0.03;
      
      const waveOffset = (wave1 + wave2 + wave3) * config.radius;
      const newDistance = distance + waveOffset;
      
      // Apply the wave distortion
      positions[i] = normalizedX * newDistance;
      positions[i + 1] = normalizedY * newDistance;
      positions[i + 2] = normalizedZ * newDistance;
    }
    
    positionAttribute.needsUpdate = true;
    sphereGeometry.computeVertexNormals();
    
    // Create a magical gradient material for the core orb
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        distortion: { value: 0 },
        color1: { value: new THREE.Color(0x8b5cf6) }, // Dark purple
        color2: { value: new THREE.Color(0x6b21a8) }, // Medium purple
        color3: { value: new THREE.Color(0x8b5cf6) }, // Soft violet
        opacity: { value: 0.10 } // Much more transparent
      },
      vertexShader: `
        uniform float time;
        uniform float distortion;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDistortion;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vDistortion = distortion;
          
          // No vertex displacement - keep perfectly smooth sphere
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float distortion;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float opacity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDistortion;
        
        void main() {
          // Create simple, smooth gradient based on Y position (no complex patterns)
          vec3 normal = normalize(vNormal);
          
          // Simple vertical gradient from top to bottom
          float gradient = (normal.y + 1.0) * 0.5;
          
          // Add gentle time-based color shifting
          float timeShift = sin(time * 0.3) * 0.1;
          gradient += timeShift;
          gradient = clamp(gradient, 0.0, 1.0);
          
          // Create smooth tri-color gradient
          vec3 color;
          if (gradient < 0.5) {
            float t = gradient * 2.0;
            color = mix(color1, color2, t);
          } else {
            float t = (gradient - 0.5) * 2.0;
            color = mix(color2, color3, t);
          }
          
          // Add very subtle energy shimmer (no position-based patterns)
          float shimmer = sin(time * 1.0) * 0.01 * vDistortion;
          color += vec3(shimmer);
          
          // Add subtle rim lighting for energy glow
          float rim = 1.0 - max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
          rim = smoothstep(0.7, 1.0, rim);
          color += rim * 0.03 * vDistortion;
          
          // Darken the overall color to prevent bright white appearance
          color *= 0.8;
          
          // Final opacity
          float finalOpacity = opacity * 0.8;
          
          gl_FragColor = vec4(color, finalOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const ball = new THREE.Mesh(sphereGeometry, gradientMaterial);
    ball.position.set(0, 0, 0);
    ballRef.current = ball;

    // Store the original positions of the vertices
    originalPositionsRef.current =
      ball.geometry.attributes.position.array.slice();

    group.add(ball);

    // Create multiple layered auras with hint colors (biggest to smallest)
    const auraLayers = [
      { 
        radius: 1.55, 
        color: '#9966f1', // Teal green - biggest, furthest
        opacity: 0.18, // More transparent
        geometry: 'sphere',
        rotationSpeed: { x: 0.002, y: -0.001, z: 0.0008 },
        zOffset: -0.6 // Furthest back
      },
      { 
        radius: 1.25, 
        color: '#ec4899', // Hot pink - medium, more saturated
        opacity: 0.12, // More transparent
        geometry: 'sphere',
        rotationSpeed: { x: -0.0005, y: 0.0015, z: 0.002 },
        zOffset: -0.3 // Pushed back
      },
      { 
        radius: 1.05, 
        color: '#8b5cf6', // Purple - smallest, closest
        opacity: 0.15, // More transparent
        geometry: 'sphere',
        rotationSpeed: { x: 0.001, y: 0.002, z: 0.0005 },
        zOffset: 0 // Closest to camera
      }
    ];

    auraRefs.current = [];
    auraLayers.forEach((layer, index) => {
      let auraGeometry;
      
      // Use smooth spheres for all aura layers to avoid geometric patterns and pole defects
      auraGeometry = new THREE.SphereGeometry(config.radius * layer.radius, 64, 64); // High subdivision for smooth energy spheres
      
      // Apply smoothing to remove hard edges
      auraGeometry.computeVertexNormals();
      
      // Add subtle noise to vertices for organic wavy effect
      const positionAttribute = auraGeometry.getAttribute('position');
      const positions = positionAttribute.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y + z * z);
        const normalizedX = x / distance;
        const normalizedY = y / distance;
        const normalizedZ = z / distance;
        
        // Add subtle wave distortion
        const wave1 = Math.sin(normalizedX * 3.0) * Math.cos(normalizedY * 2.0) * 0.1;
        const wave2 = Math.sin(normalizedY * 4.0) * Math.cos(normalizedZ * 3.0) * 0.08;
        const wave3 = Math.sin(normalizedZ * 2.0) * Math.cos(normalizedX * 4.0) * 0.06;
        
        const waveOffset = (wave1 + wave2 + wave3) * config.radius * layer.radius;
        const newDistance = distance + waveOffset;
        
        // Apply the wave distortion
        positions[i] = normalizedX * newDistance;
        positions[i + 1] = normalizedY * newDistance;
        positions[i + 2] = normalizedZ * newDistance;
      }
      
      positionAttribute.needsUpdate = true;
      auraGeometry.computeVertexNormals();
      
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(layer.color),
        transparent: true,
        opacity: layer.opacity,
        blending: THREE.AdditiveBlending, // Additive blending for energy glow effect
        depthWrite: false,
        side: THREE.DoubleSide,
        wireframe: false,
        alphaTest: 0.05 // Lower alpha test for smoother energy edges
      });
      
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      
      // Position the aura layer on the z-axis to prevent overlap
      aura.position.z = layer.zOffset;
      
      // Store rotation speed for this layer
      (aura as any).rotationSpeed = layer.rotationSpeed;
      
      auraRefs.current.push(aura);
      group.add(aura);
    });

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

    const time = Date.now() * 0.001;

    // Update shader uniforms for magical gradient effect
    if (ballRef.current.material && (ballRef.current.material as any).uniforms) {
      const material = ballRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = time;
      material.uniforms.distortion.value = distortion;
    }

    // Rotate the core ball
    ballRef.current.rotation.x += 0.01;
    ballRef.current.rotation.y += 0.01;

    // Rotate each aura layer individually at different speeds
    auraRefs.current.forEach((aura) => {
      if (aura && (aura as any).rotationSpeed) {
        const speed = (aura as any).rotationSpeed;
        aura.rotation.x += speed.x;
        aura.rotation.y += speed.y;
        aura.rotation.z += speed.z;
      }
    });

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
    
    // Scale up the distortion for more dramatic morphing (doubled)
    const scaledDistortion = clampedDistortion * 0.6;
    
    const time = Date.now() * 0.001;

    // Enhanced breathing/expansion for all aura layers with varied distortion patterns
    auraRefs.current.forEach((aura, index) => {
      if (aura) {
        // Each layer has unique distortion characteristics (reduced to prevent overlap)
        const distortionPatterns = [
          // Blue octahedron - subtle pulsing
          { 
            scaleMultiplier: 1.0, 
            scaleIntensity: 0.15, // Reduced from 0.2
            opacityMultiplier: 1.0, 
            opacityIntensity: 0.2, // Reduced from 0.3
            timeOffset: 0
          },
          // Purple dodecahedron - medium pulsing with rotation
          { 
            scaleMultiplier: 1.1, // Reduced from 1.2
            scaleIntensity: 0.25, // Reduced from 0.4
            opacityMultiplier: 1.2, // Reduced from 1.3
            opacityIntensity: 0.3, // Reduced from 0.5
            timeOffset: 1.5
          },
          // Pink icosahedron - dramatic pulsing
          { 
            scaleMultiplier: 1.3, // Reduced from 1.5
            scaleIntensity: 0.35, // Reduced from 0.6
            opacityMultiplier: 1.4, // Reduced from 1.8
            opacityIntensity: 0.4, // Reduced from 0.7
            timeOffset: 3.0
          }
        ];
        
        const pattern = distortionPatterns[index];
        
        // Add time-based variation for organic movement
        const timeVariation = Math.sin(time + pattern.timeOffset) * 0.1;
        const distortionWithTime = clampedDistortion + timeVariation;
        
        // Each layer scales with different intensity and patterns
        const auraScale = 1 + distortionWithTime * pattern.scaleIntensity * pattern.scaleMultiplier;
        aura.scale.setScalar(auraScale);
        
        // Each layer has different opacity response with time variation (hint colors)
        const baseOpacity = [0.08, 0.12, 0.15][index]; // More transparent hint colors (teal, salmon, purple)
        const opacityWithTime = baseOpacity + distortionWithTime * pattern.opacityIntensity * pattern.opacityMultiplier * 0.3; // Reduced intensity for subtle hints
        (aura.material as THREE.MeshBasicMaterial).opacity = Math.max(0.02, Math.min(0.25, opacityWithTime)); // Lower max opacity for subtle hints
        
        // Add slight rotation variation for more organic movement
        const rotationVariation = distortionWithTime * 0.02 * (index + 1);
        aura.rotation.x += rotationVariation * Math.sin(time * 0.5);
        aura.rotation.y += rotationVariation * Math.cos(time * 0.7);
        aura.rotation.z += rotationVariation * Math.sin(time * 0.3);
      }
    });

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
      
      // Enhanced morphing with doubled range
      const morphAmount = noiseValue * scaledDistortion * 4;
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
