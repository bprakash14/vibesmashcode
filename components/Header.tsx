
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-5xl md:text-6xl font-black text-black">
        VibeSmashCode
      </h1>
      <p className="mt-4 inline-block bg-yellow-400 p-3 px-4 border-2 border-black shadow-[4px_4px_0px_#000] text-lg md:text-xl font-bold text-black uppercase tracking-wide">AI Code Review for VibeCoders Who Like to Break Things and Fix ‘Em Fast</p>
    </header>
  );
};
