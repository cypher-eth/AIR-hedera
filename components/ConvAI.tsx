'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useState } from 'react';
import { ConversationOrb } from './ConversationOrb';

interface ConvAIProps {
  onMessage?: (message: string) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onStatusChange?: (status: string) => void;
  disabled?: boolean;
}

export function ConvAI({ onMessage, onSpeakingChange, onStatusChange, disabled = false }: ConvAIProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setIsActive(true);
      onStatusChange?.('Listening...');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      setIsActive(false);
      onStatusChange?.('Ready');
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      if (message.message) {
        onMessage?.(message.message);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
      setIsActive(false);
      onStatusChange?.('Ready');
    },
  });

  // Update speaking state and status
  useEffect(() => {
    onSpeakingChange?.(conversation.isSpeaking);
    
    if (isActive) {
      if (conversation.isSpeaking) {
        onStatusChange?.('Speaking...');
      } else {
        onStatusChange?.('Listening...');
      }
    }
  }, [conversation.isSpeaking, isActive, onSpeakingChange, onStatusChange]);

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
      } catch (error) {
        console.error('Failed to fetch signed URL:', error);
        onStatusChange?.('Ready');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [onStatusChange]);

  const startConversation = useCallback(async () => {
    if (!signedUrl || isActive) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        signedUrl,
        connectionType: 'websocket'
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      onStatusChange?.('Ready');
    }
  }, [conversation, signedUrl, isActive, onStatusChange]);

  const stopConversation = useCallback(async () => {
    if (!isActive) return;

    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      setIsActive(false);
      onStatusChange?.('Ready');
    }
  }, [conversation, isActive, onStatusChange]);

  if (isLoading) {
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
        status={isActive ? (conversation.isSpeaking ? 'connected' : 'connected') : 'idle'}
        isSpeaking={conversation.isSpeaking}
        onClick={isActive ? stopConversation : startConversation}
        disabled={!signedUrl || disabled}
        size="lg"
      />

      {/* Stop text - only show when active */}
      {isActive && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <span 
            onClick={stopConversation}
            className="text-[#6d28d9]/50 font-bold tracking-wide text-lg cursor-pointer hover:text-[#6d28d9]/70 transition-colors duration-200 select-none"
          >
            stop conversation
          </span>
        </div>
      )}
    </div>
  );
}
