import { useState, useCallback } from 'react';

interface UseWebRTCAudioSessionReturn {
  currentVolume: number;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
}

export default function useWebRTCAudioSession(voiceId: string): UseWebRTCAudioSessionReturn {
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleStartStopClick = useCallback(() => {
    setIsSessionActive(prev => !prev);
    
    // Simulate volume changes for demo purposes
    if (!isSessionActive) {
      const interval = setInterval(() => {
        setCurrentVolume(Math.random() * 0.5 + 0.1);
      }, 100);
      
      // Store interval ID to clear it later
      (window as any).volumeInterval = interval;
    } else {
      if ((window as any).volumeInterval) {
        clearInterval((window as any).volumeInterval);
        (window as any).volumeInterval = null;
      }
      setCurrentVolume(0);
    }
  }, [isSessionActive]);

  return {
    currentVolume,
    isSessionActive,
    handleStartStopClick
  };
}
