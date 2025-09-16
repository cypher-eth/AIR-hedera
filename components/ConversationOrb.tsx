'use client';

import React, { useEffect, useState } from "react";
import WireOrb from './WireOrb';

interface ConversationOrbProps {
  status: 'idle' | 'connected' | 'connecting' | 'disconnected';
  isSpeaking: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  audioAmplitude?: number;
}

export function ConversationOrb({ 
  status, 
  isSpeaking, 
  onClick, 
  disabled = false,
  size = 'lg',
  audioAmplitude = 0
}: ConversationOrbProps) {
  const [currentVolume, setCurrentVolume] = useState(0);

  // Convert audioAmplitude to distortion metric for the orb
  useEffect(() => {
    if (isSpeaking && audioAmplitude > 0) {
      setCurrentVolume(audioAmplitude);
    } else {
      setCurrentVolume(0);
    }
  }, [isSpeaking, audioAmplitude]);


  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      <WireOrb
        distortion={currentVolume}
        isActive={status === 'connected'}
        size={size}
        onClick={onClick}
        disabled={disabled}
      />
    </div>
  );
}