// FIX: Add React import to use React.createElement.
import React from 'react';
import { VulnerabilityCategory, TrafficLightScore, SeverityLevel } from './types';
import type { ReactNode } from 'react';
import { ShieldExclamationIcon, ClockIcon, PuzzlePieceIcon, StarIcon } from './components/Icons';

export const VULNERABILITY_CATEGORY_STYLES: Record<VulnerabilityCategory, { color: string; icon: ReactNode }> = {
  [VulnerabilityCategory.Security]: {
    color: 'border-l-red-500',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(ShieldExclamationIcon, { className: "h-6 w-6 text-red-500" }),
  },
  [VulnerabilityCategory.Performance]: {
    color: 'border-l-yellow-400',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(ClockIcon, { className: "h-6 w-6 text-yellow-400" }),
  },
  [VulnerabilityCategory.Logic]: {
    color: 'border-l-blue-500',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(PuzzlePieceIcon, { className: "h-6 w-6 text-blue-500" }),
  },
  [VulnerabilityCategory.BestPractices]: {
    color: 'border-l-purple-500',
    icon: React.createElement(StarIcon, { className: "h-6 w-6 text-purple-500" }),
  }
};

export const SEVERITY_STYLES: Record<SeverityLevel, { className: string; text: string }> = {
  [SeverityLevel.Critical]: {
    className: 'bg-red-500 text-white',
    text: 'BIG YIKES',
  },
  [SeverityLevel.High]: {
    className: 'bg-orange-500 text-white',
    text: 'GLOW UP',
  },
  [SeverityLevel.Medium]: {
    className: 'bg-yellow-400 text-black',
    text: 'PRO-TIP',
  },
  [SeverityLevel.Low]: {
    className: 'bg-blue-500 text-white',
    text: 'TINY TWEAK',
  },
};

export const TRAFFIC_LIGHT_STYLES: Record<TrafficLightScore, { color: string; bgColor: string; text: string }> = {
  [TrafficLightScore.Green]: {
    color: 'text-black',
    bgColor: 'bg-green-500',
    text: 'OKAY OKAY we get it — you can code. Ship It Before Something Changes!',
  },
  [TrafficLightScore.Yellow]: {
    color: 'text-black',
    bgColor: 'bg-yellow-400',
    text: 'It Works… If You Don’t Look at It',
  },
  [TrafficLightScore.Red]: {
    color: 'text-black',
    bgColor: 'bg-red-500',
    text: 'Your Code Is on Fire (in the Bad Way)',
  },
};
