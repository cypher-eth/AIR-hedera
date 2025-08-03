'use client';

import React from 'react';

export function GMButton() {
  const handleGMClick = () => {
    // Keep the original click logic if needed
  };

  return (
    <div className="fixed bottom-6 left-6 z-30 flex items-end">
      <button
        onClick={handleGMClick}
        className="focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        }}
      >
        <img
          src="/morning.png"
          alt="GM"
          width={56}
          height={56}
          className="block"
          style={{ display: 'block' }}
        />
      </button>
    </div>
  );
}