'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ResponseModal } from '@/components/ResponseModal';
import { usePrivy } from '@privy-io/react-auth';

import { Header } from '@/components/Header';
import { GMButton } from '@/components/GMButton';
import { SaveButton } from '@/components/SaveButton';
import { BuyCreditsModal } from '@/components/BuyCreditsModal';
import { ConvAI } from '@/components/ConvAI';

// Types
export type ConversationState = 'loading' | 'ready' | 'starting' | 'listening' | 'speaking' | 'stopping' | 'error';

export default function Home() {
  // Conversation state management (source of truth)
  const [conversationState, setConversationState] = useState<ConversationState>('loading');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Loading...');
  
  // Other state
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [audioAmplitude, setAudioAmplitude] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  
  // Auth and wallet
  const { ready } = usePrivy();

  // Refs
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize app state
  useEffect(() => {
    setIsSpeaking(false);
    setConversationState('loading');
    setAudioAmplitude(0);
    setStatus('Loading...');
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  }, []);

  // Audio control
  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Conversation state handlers
  const handleConversationStateChange = useCallback((newState: ConversationState) => {
    console.log('Conversation state changed:', newState);
    setConversationState(newState);
    
    // Update status based on state
    switch (newState) {
      case 'loading':
        setStatus('Loading...');
        break;
      case 'ready':
        setStatus('Ready');
        break;
      case 'starting':
        setStatus('Starting...');
        break;
      case 'listening':
        setStatus('Listening...');
        break;
      case 'speaking':
        setStatus('Speaking...');
        break;
      case 'stopping':
        setStatus('Stopping...');
        break;
      case 'error':
        setStatus('Error');
        break;
    }
  }, []);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    console.log('Speaking changed:', speaking);
    setIsSpeaking(speaking);
    
    // Reset amplitude when stopping
    if (!speaking) {
      setAudioAmplitude(0);
    }
    
    // Update conversation state based on speaking
    if (speaking && conversationState === 'listening') {
      setConversationState('speaking');
    } else if (!speaking && conversationState === 'speaking') {
      setConversationState('listening');
    }
  }, [conversationState]);

  // Temporary output volume source (to be replaced with ElevenLabs real data)
  useEffect(() => {
    if (!isSpeaking) {
      setAudioAmplitude(0);
      return;
    }

    let rafId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 300; // Update every 100ms instead of every frame

    const loop = (now: number) => {
      if (now - lastUpdate >= UPDATE_INTERVAL) {
        // Temporary fake volume calculation
        const t = now * 0.001;
        const v = 0.35 + 0.25 * Math.sin(t * 2.2) + 0.15 * Math.sin(t * 5.3);
        const volume = Math.max(0, Math.min(1, v));
        setAudioAmplitude(volume);
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [isSpeaking]);

  const handleMessage = useCallback((message: string) => {
    setCurrentResponse(message);
  }, []);

  // Modal handlers
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    if (conversationState === 'speaking') {
      stopCurrentAudio();
      setConversationState('listening');
    }
  }, [conversationState, stopCurrentAudio]);

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Computed values based on conversation state
  const isConvAIDisabled = conversationState === 'loading' || conversationState === 'starting' || conversationState === 'stopping';
  
  return (
    <>
      <Header status={status} onOpenTopUp={() => setShowWaterModal(true)} />

      <main className="h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* ElevenLabs Conversational AI */}
        <div className="flex-1 flex items-center justify-center w-full max-w-4xl px-4">
          <ConvAI 
            conversationState={conversationState}
            isSpeaking={isSpeaking}
            audioAmplitude={audioAmplitude}
            onMessage={handleMessage}
            onSpeakingChange={handleSpeakingChange}
            onConversationStateChange={handleConversationStateChange}
            disabled={isConvAIDisabled}
          />
        </div>

        {/* Action Buttons - Mobile responsive */}
        <div className="flex gap-4 mt-4 mb-2.5 flex-shrink-0">
          <GMButton />
          <SaveButton />
        </div>

        {/* Modals */}
        <ResponseModal
          isOpen={showModal}
          onClose={handleCloseModal}
          responseText={currentResponse}
          isSpeaking={isSpeaking}
        />
        
        <BuyCreditsModal 
          isOpen={showWaterModal} 
          onClose={() => setShowWaterModal(false)} 
        />
        
      </main>
    </>
  );
}