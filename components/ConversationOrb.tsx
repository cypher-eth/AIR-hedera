'use client';

interface ConversationOrbProps {
  status: 'idle' | 'connected' | 'connecting' | 'disconnected';
  isSpeaking: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConversationOrb({ 
  status, 
  isSpeaking, 
  onClick, 
  disabled = false,
  size = 'lg'
}: ConversationOrbProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-4xl'
  };

  const getOrbStyles = () => {
    if (status === 'connected') {
      if (isSpeaking) {
        return 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 animate-pulse';
      }
      return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50';
    }
    return 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg shadow-gray-500/50';
  };

  const getIcon = () => {
    if (status === 'connected') {
      return isSpeaking ? '' : '';
    }
    return '';
  };

  return (
    <div className="relative">
      <button
        data-orb-button
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getOrbStyles()}`}
      >
        <div className="text-white">
          {getIcon()}
        </div>
      </button>
      
      {/* Speaking animation rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-ping animation-delay-200"></div>
        </>
      )}
      
      {/* Listening animation */}
      {status === 'connected' && !isSpeaking && (
        <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-pulse"></div>
      )}
    </div>
  );
}
