
import React from 'react';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from './Icons';

interface VibeStatsProps {
  counts: {
    vibe: number;
    hmm: number;
    'not-my-vibe': number;
  };
}

export const VibeStats: React.FC<VibeStatsProps> = ({ counts }) => {
  return (
    <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_#000]">
      <h2 className="text-2xl font-black mb-4 text-center text-black">
        Overall Vibe Check
      </h2>
      <div className="flex justify-around items-center text-center">
        <div className="flex flex-col items-center gap-2">
          <CheckCircleIcon 
            className="h-8 w-8 text-green-500"
            style={{ filter: 'drop-shadow(0 0 5px #22c55e)' }}
          />
          <span 
            className="text-3xl font-black text-green-500"
            style={{ textShadow: '0 0 8px #22c55e' }}
          >
            {counts.vibe}
          </span>
          <span className="text-sm font-bold text-gray-600">Vibe!</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <InformationCircleIcon 
            className="h-8 w-8 text-yellow-500"
            style={{ filter: 'drop-shadow(0 0 5px #eab308)' }}
          />
          <span 
            className="text-3xl font-black text-yellow-500"
            style={{ textShadow: '0 0 8px #eab308' }}
          >
            {counts.hmm}
          </span>
          <span className="text-sm font-bold text-gray-600">Hmm...</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <XCircleIcon 
            className="h-8 w-8 text-red-500"
            style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }}
          />
          <span 
            className="text-3xl font-black text-red-500"
            style={{ textShadow: '0 0 8px #ef4444' }}
          >
            {counts['not-my-vibe']}
          </span>
          <span className="text-sm font-bold text-gray-600">Not my vibe</span>
        </div>
      </div>
    </div>
  );
};
