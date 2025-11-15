import React from 'react';
import type { GoodVibeCheck } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface GoodVibesChecklistProps {
  checks: GoodVibeCheck[];
}

export const GoodVibesChecklist: React.FC<GoodVibesChecklistProps> = ({ checks }) => {
  return (
    <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_#000]">
      <h3 className="text-2xl font-bold text-black mb-4">Good Vibes Checklist</h3>
      <ul className="space-y-3">
        {checks.map((check, index) => (
          <li key={index} className="flex items-center gap-3">
            {check.passed ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
            )}
            <span className={`text-base ${check.passed ? 'text-gray-800' : 'text-red-700 font-semibold'}`}>
              {check.check}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
