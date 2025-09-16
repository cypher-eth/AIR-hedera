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
  const [conversation, setConversation] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  
  // Cache for conversation state to avoid re-initialization delays
  const conversationCacheRef = useRef<{
    signedUrl: string | null;
    lastFetch: number;
    conversation: any;
  }>({
    signedUrl: null,
    lastFetch: 0,
    conversation: null
  });
  
  // Auth and wallet
  const { ready } = usePrivy();

  // Refs
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize app state and preload signed URL
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

    // Restore from cache if available
    const cache = conversationCacheRef.current;
    if (cache.signedUrl) {
      console.log('Restoring from cache');
      setSignedUrl(cache.signedUrl);
      setConversationState('ready');
      setStatus('Ready');
    }
    if (cache.conversation) {
      setConversation(cache.conversation);
    }

    // Preload signed URL with caching for faster conversation startup
    const preloadSignedUrl = async () => {
      const now = Date.now();
      const cache = conversationCacheRef.current;
      
      // Only fetch if not already cached or cache is expired
      if (!cache.signedUrl || (now - cache.lastFetch) >= 300000) {
        try {
          console.log('Fetching fresh signed URL');
          const response = await fetch('/api/get-signed-url');
          if (response.ok) {
            const data = await response.json();
            
            // Update cache
            cache.signedUrl = data.signedUrl;
            cache.lastFetch = now;
            
            setSignedUrl(data.signedUrl);
            setConversationState('ready');
            setStatus('Ready');
          } else {
            setConversationState('error');
            setStatus('Error');
          }
        } catch (error) {
          console.error('Failed to preload signed URL:', error);
          setConversationState('error');
          setStatus('Error');
        }
      } else {
        console.log('Using cached signed URL');
      }
    };

    preloadSignedUrl();
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

  // Real ElevenLabs output volume calculation
  useEffect(() => {
    if (!isSpeaking || !conversation) {
      setAudioAmplitude(0);
      return;
    }

    let rafId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 100; // Update every 100ms for smooth visualization

    const loop = (now: number) => {
      if (now - lastUpdate >= UPDATE_INTERVAL) {
        try {
          // Get real volume data from ElevenLabs
          if (conversation.getOutputByteFrequencyData) {
            const frequencyData = conversation.getOutputByteFrequencyData();
            if (frequencyData && frequencyData.length > 0) {
              // Calculate volume using arithmetic mean as specified
              const sum = Array.from(frequencyData).reduce((acc, byte) => acc + byte, 0);
              const volume = sum / frequencyData.length;
              // Normalize from 0-255 range to 0-1 range
              const normalizedVolume = volume / 255;
              setAudioAmplitude(normalizedVolume);
            } else {
              setAudioAmplitude(0);
            }
          } else {
            // Fallback if method not available
            setAudioAmplitude(0);
          }
        } catch (error) {
          console.warn('Error getting ElevenLabs volume data:', error);
          setAudioAmplitude(0);
        }
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [isSpeaking, conversation]);

  const handleMessage = useCallback((message: string) => {
    setCurrentResponse(message);
  }, []);

  const handleConversationReady = useCallback((conv: any) => {
    // Cache the conversation object to avoid re-initialization
    conversationCacheRef.current.conversation = conv;
    setConversation(conv);
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
            signedUrl={signedUrl}
            onMessage={handleMessage}
            onSpeakingChange={handleSpeakingChange}
            onConversationStateChange={handleConversationStateChange}
            onConversationReady={handleConversationReady}
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