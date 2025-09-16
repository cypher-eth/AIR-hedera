'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ConversationOrb } from './ConversationOrb';

type ConversationState = 'loading' | 'ready' | 'starting' | 'listening' | 'speaking' | 'stopping' | 'error';

interface ConvAIProps {
  conversationState: ConversationState;
  isSpeaking: boolean;
  audioAmplitude?: number;
  onMessage?: (message: string) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onConversationStateChange?: (state: ConversationState) => void;
  disabled?: boolean;
}

export function ConvAI({ 
  conversationState, 
  isSpeaking, 
  audioAmplitude,
  onMessage, 
  onSpeakingChange, 
  onConversationStateChange,
  disabled = false 
}: ConvAIProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const operationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      onConversationStateChange?.('listening');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      onConversationStateChange?.('ready');
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      if (message.message) {
        onMessage?.(message.message);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
      onConversationStateChange?.('error');
    },
  });

  // Debug logging for state and status
  console.log('ConvAI Debug:', {
    conversationState,
    conversationStatus: conversation.status,
    isSpeaking: conversation.isSpeaking,
    showCancelText: conversationState === 'listening' || conversationState === 'speaking' || conversationState === 'starting' || conversationState === 'stopping'
  });

  // Clear any pending timeouts
  const clearOperationTimeout = useCallback(() => {
    if (operationTimeoutRef.current) {
      clearTimeout(operationTimeoutRef.current);
      operationTimeoutRef.current = null;
    }
  }, []);

  // Force reset function - bulletproof state reset
  const forceReset = useCallback(() => {
    console.log('Force resetting conversation state');
    clearOperationTimeout();
    onConversationStateChange?.('ready');
  }, [clearOperationTimeout, onConversationStateChange]);

  // Determine UI state based solely on ConversationState
  const isReady = conversationState === 'ready';
  const isActive = conversationState === 'listening' || conversationState === 'speaking';
  const isStarting = conversationState === 'starting';
  const isStopping = conversationState === 'stopping';
  const canStart = isReady && signedUrl && !disabled;
  const canStop = isActive || isStarting || isStopping;
  const showCancelText = canStop;

  // Update speaking state and status based on conversation events
  useEffect(() => {
    onSpeakingChange?.(conversation.isSpeaking);
    
    console.log('Speaking state change:', { 
      conversationState, 
      isSpeaking: conversation.isSpeaking,
      conversationStatus: conversation.status 
    });
    
    // Handle state transitions based on conversation status and speaking state
    if (conversation.status === 'connected') {
      if (conversation.isSpeaking && conversationState !== 'speaking') {
        console.log('Transitioning to speaking state');
        onConversationStateChange?.('speaking');
      } else if (!conversation.isSpeaking && conversationState !== 'listening') {
        console.log('Transitioning to listening state');
        onConversationStateChange?.('listening');
      }
    }
  }, [conversation.isSpeaking, conversation.status, conversationState, onSpeakingChange, onConversationStateChange]);

  // Fetch signed URL on component mount
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const response = await fetch('/api/get-signed-url');
        if (!response.ok) {
          throw new Error('Failed to fetch signed URL');
        }
        const data = await response.json();
        setSignedUrl(data.signedUrl);
        onConversationStateChange?.('ready');
      } catch (error) {
        console.error('Failed to fetch signed URL:', error);
        onConversationStateChange?.('error');
      }
    };

    fetchSignedUrl();
  }, [onConversationStateChange]);

  // Auto-reset if stuck in starting/stopping state
  useEffect(() => {
    if (conversationState === 'starting' || conversationState === 'stopping') {
      operationTimeoutRef.current = setTimeout(() => {
        console.log('Operation timeout - forcing reset');
        forceReset();
      }, 10000); // 10 second timeout
    }

    return () => clearOperationTimeout();
  }, [conversationState, forceReset, clearOperationTimeout]);

  const startConversation = useCallback(async () => {
    console.log('startConversation called - state:', conversationState, 'conversation.status:', conversation.status);
    
    // If conversation is already connected, don't start again
    if (conversation.status === 'connected') {
      console.log('Conversation already connected, not starting');
      return;
    }
    
    if (!signedUrl) {
      console.log('Cannot start: no signed URL');
      return;
    }

    // Force reset to ready state if we're in a bad state
    if (conversationState !== 'ready' && conversationState !== 'error') {
      console.log('Forcing reset before start, current state:', conversationState);
      forceReset();
      return;
    }

    try {
      console.log('Starting conversation...');
      onConversationStateChange?.('starting');
      
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        signedUrl,
        connectionType: 'websocket'
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      forceReset();
    }
  }, [conversation, signedUrl, conversationState, onConversationStateChange, forceReset]);

  const stopConversation = useCallback(async () => {
    console.log('stopConversation called - state:', conversationState);
    
    if (!canStop) {
      console.log('Cannot stop: not in stoppable state, current state:', conversationState);
      return;
    }

    try {
      console.log('Stopping conversation...');
      onConversationStateChange?.('stopping');
      
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      forceReset();
    }
  }, [conversationState, canStop, onConversationStateChange, forceReset, conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOperationTimeout();
    };
  }, [clearOperationTimeout]);

  if (conversationState === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-white text-lg">Loading conversation...</p>
      </div>
    );
  }
  

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Conversation Orb */}
      <ConversationOrb
        status={isActive ? 'connected' : 'idle'}
        isSpeaking={isSpeaking}
        onClick={canStop ? stopConversation : canStart ? startConversation : () => {}}
        disabled={!canStart && !canStop}
        size="lg"
        audioAmplitude={audioAmplitude}
      />


      {/* Bottom text - always show something */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        {showCancelText ? (
          <span 
            onClick={stopConversation}
            className="text-[#6d28d9]/50 font-bold tracking-wide text-lg cursor-pointer hover:text-[#6d28d9]/70 transition-colors duration-200 select-none"
          >
            stop conversation
          </span>
        ) : (
          <span 
            onClick={() => {
              // This will trigger the orb click
              const orb = document.querySelector('[data-orb-button]') as HTMLButtonElement;
              if (orb && !orb.disabled) {
                orb.click();
              }
            }}
            className="text-[#6d28d9]/50 font-bold tracking-wide text-lg cursor-pointer hover:text-[#6d28d9]/70 transition-colors duration-200 select-none"
          >
            Talk to AIR
          </span>
        )}
      </div>


    </div>
  );
}
