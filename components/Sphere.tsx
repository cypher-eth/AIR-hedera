'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SphereProps {
  amplitude: number;
  onVoiceInput: (transcript: string, audioBlob?: Blob) => void;
  small?: boolean;
  disabled?: boolean;
  onStateChange?: (state: 'idle' | 'listening') => void;
}

function AnimatedSphere({ isIdle, isSpeaking, isListening, amplitude }: { isIdle: boolean; isSpeaking: boolean; isListening: boolean; amplitude: number; }) {
  // Torus rings (as before)
  const ringRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const ringParams: [number, number, string, number][] = [
    [0.80, 0.12, '#ede9fe', 0.22],
    [0.86, 0.15, '#c4b5fd', 0.13],
    [0.93, 0.18, '#a78bfa', 0.09],
    [1.02, 0.22, '#a21caf', 0.06],
  ];
  // Blurred, offset, swirling planes for painterly glow
  const planeRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  // [radius, color, baseOpacity, x, y, z]
  const planeParams: [number, string, number, number, number, number][] = [
    [1.16, '#ede9fe', 0.12, 0.08, -0.09, -0.18],
    [1.36, '#c4b5fd', 0.09, 0.13, 0.11, -0.22],
    [1.52, '#a78bfa', 0.07, -0.12, 0.18, -0.25],
    [1.68, '#a21caf', 0.05, 0.18, 0.22, -0.28],
    [1.84, '#fff', 0.04, 0.22, -0.18, -0.32], // faint white bloom
  ];
  // Central faint sphere
  const sphereRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Animate rings (as before, but add 3D tilt)
    ringRefs.forEach((ref, i) => {
      const mesh = ref.current;
      if (!mesh) return;
      let scale = 1 + Math.sin(time * (1.1 + i * 0.13) + i) * (0.01 + i * 0.01);
      if (isListening) scale *= 1.04 + Math.sin(time * (1.7 + i * 0.2)) * (0.03 + i * 0.01);
      if (isSpeaking) scale *= 1 + amplitude * (0.08 + i * 0.01);
      mesh.scale.setScalar(scale);
      mesh.rotation.z = time * (0.12 + i * 0.07) * (i % 2 === 0 ? 1 : -1);
      mesh.rotation.x = Math.sin(time * (0.3 + i * 0.11)) * (0.18 + i * 0.04); // more 3D tilt
      mesh.rotation.y = Math.cos(time * (0.2 + i * 0.09)) * (0.18 + i * 0.04); // more 3D tilt
      const geom = mesh.geometry as THREE.TorusGeometry;
      const pos = geom.attributes.position;
      const orig = geom.parameters;
      for (let j = 0; j < pos.count; j++) {
        const angle = (j / pos.count) * Math.PI * 2;
        const rMod = 1
          + 0.02 * Math.sin(angle * (2 + i) + time * (0.7 + i * 0.2))
          + 0.01 * Math.sin(angle * (5 + i) + time * (1.2 + i * 0.13));
        const x = Math.cos(angle) * orig.radius * rMod;
        const y = Math.sin(angle) * orig.radius * rMod;
        const z = pos.getZ(j);
        pos.setXYZ(j, x, y, z);
      }
      pos.needsUpdate = true;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = ringParams[i][3] * (isListening ? 1.25 : isSpeaking ? 1.1 : 1);
    });
    // Animate planes for swirling, painterly glow
    planeRefs.forEach((ref, i) => {
      const mesh = ref.current;
      if (!mesh) return;
      let scale = 1 + Math.sin(time * (0.7 + i * 0.17) + i) * (0.04 + i * 0.01);
      if (isListening) scale *= 1.08 + Math.sin(time * (1.2 + i * 0.13)) * (0.05 + i * 0.01);
      if (isSpeaking) scale *= 1 + amplitude * (0.06 + i * 0.01);
      mesh.scale.setScalar(scale);
      mesh.rotation.z = time * (0.09 + i * 0.05) * (i % 2 === 0 ? 1 : -1);
      mesh.rotation.x = Math.sin(time * (0.2 + i * 0.09)) * (0.07 + i * 0.01);
      mesh.position.x = planeParams[i][3] + Math.sin(time * (0.5 + i * 0.2)) * (0.04 + i * 0.01);
      mesh.position.y = planeParams[i][4] + Math.cos(time * (0.6 + i * 0.15)) * (0.04 + i * 0.01);
      mesh.position.z = planeParams[i][5];
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = planeParams[i][2] * (isListening ? 1.5 : isSpeaking ? 1.2 : 1);
    });
    // Animate faint sphere scale
    if (sphereRef.current) {
      let scale = 0.82 + Math.sin(time * 0.9) * 0.04;
      if (isListening) scale *= 1.04;
      if (isSpeaking) scale *= 1 + amplitude * 0.04;
      sphereRef.current.scale.setScalar(scale);
    }
  });
  return (
    <>
      {/* Central faint, glassy sphere for 3D volume */}
      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshPhysicalMaterial
          color="#fff"
          roughness={0.18}
          metalness={0.18}
          transmission={0.95}
          thickness={1.2}
          ior={1.4}
          transparent={true}
          opacity={0.18}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.7}
          emissive="#a78bfa"
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* Blurred, swirling, painterly planes */}
      {planeParams.map((params, i) => {
        const [radius, color, baseOpacity] = params;
        return (
          <mesh
            key={"plane-" + i}
            ref={planeRefs[i]}
            position={[0, 0, 0]}
          >
            <circleGeometry args={[radius, 64]} />
            <meshBasicMaterial color={color} transparent opacity={baseOpacity} depthWrite={false} />
          </mesh>
        );
      })}
      {/* Animated torus rings: innermost uses meshPhysicalMaterial for 3D lighting */}
      {ringParams.map((params, i) => {
        const [radius, tube, color, baseOpacity] = params;
        if (i === 0) {
          return (
            <mesh
              key={"ring-" + i}
              ref={ringRefs[i]}
              position={[0, 0, 0]}
            >
              <torusGeometry args={[radius, tube, 128, 256]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.18}
                metalness={0.18}
                transmission={0.85}
                thickness={0.7}
                ior={1.3}
                transparent={true}
                opacity={baseOpacity}
                clearcoat={1}
                clearcoatRoughness={0.08}
                reflectivity={0.7}
                emissive="#a78bfa"
                emissiveIntensity={0.12}
              />
            </mesh>
          );
        }
        return (
          <mesh
            key={"ring-" + i}
            ref={ringRefs[i]}
            position={[0, 0, 0]}
          >
            <torusGeometry args={[radius, tube, 128, 256]} />
            <meshBasicMaterial color={color} transparent opacity={baseOpacity} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
}

export function Sphere({ amplitude, onVoiceInput, small, disabled = false, onStateChange }: SphereProps) {
  const [isIdle, setIsIdle] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const isHoldingRef = useRef(false);
  const holdStartTimeRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        setIsListening(true);
        setIsIdle(false);
        finalTranscriptRef.current = '';
        onStateChange?.('listening');
      };
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        finalTranscriptRef.current = finalTranscript;
      };
      recognition.onend = () => {
        if (isHoldingRef.current) {
          // User is still holding, so restart recognition
          try {
            recognition.start();
          } catch (e) {
            // Optionally handle error
          }
          return;
        }
        setIsListening(false);
        setIsIdle(true);
        onStateChange?.('idle');
        onVoiceInput(finalTranscriptRef.current, audioBlobRef.current || undefined);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        setIsIdle(true);
        onStateChange?.('idle');
      };
      recognitionRef.current = recognition;
    }
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [onVoiceInput]);

  const startAudioRecording = useCallback(async () => {
    try {
      console.log('Starting audio recording...');
      
      // Prevent multiple recordings
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('Already recording audio, skipping');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got audio stream:', stream);
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available, size:', event.data.size);
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log('Audio recording stopped, blob size:', audioBlob.size);
        audioBlobRef.current = audioBlob;
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        console.log('Audio URL created:', audioUrlRef.current);
        stream.getTracks().forEach(track => track.stop());
        if (!isHoldingRef.current) {
          console.log('Calling onVoiceInput with transcript:', finalTranscriptRef.current, 'and audio blob size:', audioBlob.size);
          onVoiceInput(finalTranscriptRef.current, audioBlob);
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = audioChunks;
      mediaRecorder.start();
    } catch (error) {
      // handle error
    }
  }, [onVoiceInput]);

  const stopAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    console.log('Pointer down - starting recording');
    e.preventDefault();
    
    // Prevent interaction if disabled
    if (disabled) {
      console.log('Sphere is disabled, ignoring pointer down');
      return;
    }
    
    // Prevent multiple starts
    if (isHoldingRef.current) {
      console.log('Already recording, ignoring pointer down');
      return;
    }
    
    isHoldingRef.current = true;
    holdStartTimeRef.current = Date.now();
    setIsListening(true);
    setIsIdle(false);
    console.log('Sphere state: isListening=true, isIdle=false');
    
    if (recognitionRef.current && isSupported) {
      try {
        // Check if recognition is already active
        if (recognitionRef.current.state === 'inactive') {
          console.log('Starting speech recognition...');
          recognitionRef.current.start();
        }
        console.log('Starting audio recording...');
        startAudioRecording();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        setIsIdle(true);
        isHoldingRef.current = false;
        holdStartTimeRef.current = null;
      }
    } else if (!isSupported) {
      console.log('Speech recognition not supported, starting audio recording only...');
      startAudioRecording();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    console.log('Pointer up - stopping recording');
    e.preventDefault();
    isHoldingRef.current = false;
    const now = Date.now();
    const holdStart = holdStartTimeRef.current;
    holdStartTimeRef.current = null;
    const heldForMs = holdStart ? now - holdStart : 0;
    if (heldForMs < 1000) {
      // Too short, cancel everything and do not send
      setIsListening(false);
      setIsIdle(true);
      console.log('Hold was too short (' + heldForMs + 'ms), discarding recording.');
      // Stop audio and speech, but do not call onVoiceInput
      if (recognitionRef.current && isSupported) {
        try {
          recognitionRef.current.abort && recognitionRef.current.abort();
          stopAudioRecording();
        } catch (error) {
          setIsListening(false);
          setIsIdle(true);
        }
      } else {
        stopAudioRecording();
      }
      return;
    }
    setIsListening(false);
    setIsIdle(true);
    console.log('Sphere state: isListening=false, isIdle=true');
    
    if (recognitionRef.current && isSupported) {
      try {
        console.log('Stopping speech recognition...');
        recognitionRef.current.stop();
        console.log('Stopping audio recording...');
        stopAudioRecording();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
        setIsIdle(true);
      }
    } else {
      console.log('Stopping audio recording (no speech recognition)...');
      stopAudioRecording();
    }
  };

  return (
    <div
      className={small ? 'relative flex items-center justify-center select-none w-full h-full' : 'relative flex items-center justify-center select-none'}
      style={small ? {} : { width: 340, height: 340 }}
      {...(!small && !disabled && {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        onPointerCancel: handlePointerUp,
      })}
    >
      <Canvas camera={{ position: [0, 0, 3] }} shadows style={small ? { width: '100%', height: '100%' } : {}}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <AnimatedSphere isIdle={isIdle} isSpeaking={isSpeaking} isListening={isListening} amplitude={amplitude} />
      </Canvas>
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-xl -z-10 transition-all duration-500 ${
        disabled
          ? 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 opacity-50'
          : isListening 
            ? 'bg-gradient-to-r from-pink-200/40 to-pink-400/40 scale-110' 
            : isSpeaking 
              ? 'bg-gradient-to-r from-purple-400/20 to-blue-400/20' 
              : 'bg-gradient-to-r from-pink-200/20 to-pink-100/20'
      }`} />
      {/* Additional glow layers for listening state */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-pink-200/20 blur-2xl scale-125 -z-20 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-pink-100/15 blur-3xl scale-150 -z-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  );
} 