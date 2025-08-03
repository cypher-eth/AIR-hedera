import React from 'react';

export function SaveButton() {
  const handleSaveClick = () => {
    console.log('Save button clicked');
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex items-end">
      <button
        onClick={handleSaveClick}
        className="focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        }}
      >
        <img
          src="/save.png"
          alt="Save"
          width={56}
          height={56}
          className="block"
          style={{ display: 'block' }}
        />
      </button>
    </div>
  );
} 