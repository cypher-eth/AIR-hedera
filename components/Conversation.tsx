'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useState, useRef } from 'react';

interface ConversationProps {
  onUpdate: (data: { message?: string; isSpeaking?: boolean; status?: string }) => void;
  disabled?: boolean;
}

export function Conversation({ onUpdate, disabled = false }: ConversationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const hasStartedRef = useRef(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setIsConnected(true);
      onUpdate({ status: 'Connected' });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      setIsConnected(false);
      onUpdate({ status: 'Ready' });
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      if (message.message) {
        onUpdate({ message: message.message });
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
      onUpdate({ status: 'Error' });
    },
  });

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/get-signed-url");
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    if (isStarting || isConnected) {
      console.log('Conversation already starting or connected, skipping...');
      return;
    }

    setIsStarting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL for the conversation
      const signedUrl = await getSignedUrl();
      
      // Start the conversation with signed URL
      await conversation.startSession({
        signedUrl: signedUrl,
        connectionType: 'websocket'
      });
      
      onUpdate({ status: 'Starting...' });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      onUpdate({ status: 'Failed to start...' });
    } finally {
      setIsStarting(false);
    }
  }, [conversation, onUpdate]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setIsConnected(false);
      setIsStarting(false);
      hasStartedRef.current = false;
      onUpdate({ status: 'Stopping...' });
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  }, [conversation, onUpdate]);

  // Update speaking state when conversation status changes
  useEffect(() => {
    onUpdate({ isSpeaking: conversation.isSpeaking });
  }, [conversation.isSpeaking, onUpdate]);

  // Auto-start conversation when not disabled
  useEffect(() => {
    if (!disabled && !isConnected && !isStarting && !hasStartedRef.current) {
      console.log('Auto-starting conversation...');
      hasStartedRef.current = true;
      startConversation();
    }
  }, [disabled, isConnected, isStarting, startConversation]);

  // Auto-stop conversation when disabled
  useEffect(() => {
    if (disabled && isConnected) {
      stopConversation();
    }
  }, [disabled, isConnected, stopConversation]);

  return null; // This component doesn't render anything visible
}
