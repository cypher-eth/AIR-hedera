'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ResponseModal } from '@/components/ResponseModal';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract } from 'wagmi';
import { parseAbiItem } from 'viem';
import { Header } from '@/components/Header';
import { GMButton } from '@/components/GMButton';
import { SaveButton } from '@/components/SaveButton';
import { BuyCreditsModal } from '@/components/BuyCreditsModal';
import { ConvAI } from '@/components/ConvAI';
import { CREDIT_ADDRESS } from '@/app/constants/contracts';

// Types
export type AppState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export default function Home() {
  // State management
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [audioAmplitude, setAudioAmplitude] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready');
  const [showModal, setShowModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [isAIAudioPlaying, setIsAIAudioPlaying] = useState(false);
  const [isConversationReady, setIsConversationReady] = useState(false);
  
  // Auth and wallet
  const { ready } = usePrivy();

  // Refs
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize app state
  useEffect(() => {
    setIsAIAudioPlaying(false);
    setAppState('idle');
    setAudioAmplitude(0);
    setStatus('Ready');
    
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
    setIsAIAudioPlaying(false);
  }, []);

  // Simple conversation handlers
  const handleMessage = useCallback((message: string) => {
    setCurrentResponse(message);
  }, []);

  const handleSpeakingChange = useCallback((isSpeaking: boolean) => {
    setIsAIAudioPlaying(isSpeaking);
    setAppState(isSpeaking ? 'speaking' : 'idle');
    setAudioAmplitude(isSpeaking ? 0.5 : 0);
  }, []);

  const handleStatusChange = useCallback((newStatus: string) => {
    console.log('Status changing from', status, 'to', newStatus);
    setStatus(newStatus);
  }, [status]);

  // Modal handlers
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    if (appState === 'speaking') {
      stopCurrentAudio();
      setAppState('idle');
      setAudioAmplitude(0);
      setStatus('Ready');
    }
  }, [appState, stopCurrentAudio]);


  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Computed values
  const isConvAIDisabled = appState === 'processing' || appState === 'speaking';
  const isSpeaking = isAIAudioPlaying;
  
  return (
    <>
      <Header status={status} onOpenTopUp={() => setShowWaterModal(true)} />
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* ElevenLabs Conversational AI */}
        <div className="flex-1 flex items-center justify-center w-full max-w-4xl px-4">
          <ConvAI 
            onMessage={handleMessage}
            onSpeakingChange={handleSpeakingChange}
            onStatusChange={handleStatusChange}
            disabled={isConvAIDisabled}
          />
        </div>

        {/* Response Box placeholder */}
        <div className="w-full max-w-4xl px-4 mb-40">
          {/* ResponseBox component can be uncommented when needed */}
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
        
        {/* Action Buttons */}
        <GMButton />
        <SaveButton />
        
        {/* Instruction Text - only show when ready */}
        {status === 'Ready' && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <span 
              onClick={() => {
                // This will trigger the orb click in ConvAI component
                const orb = document.querySelector('[data-orb-button]') as HTMLButtonElement;
                if (orb && !orb.disabled) {
                  orb.click();
                }
              }}
              className="text-[#6d28d9]/50 font-bold tracking-wide text-lg cursor-pointer hover:text-[#6d28d9]/70 transition-colors duration-200 select-none"
            >
              speak to the AI
            </span>
          </div>
        )}
      </main>
    </>
  );
}