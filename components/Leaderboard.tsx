import React, { useState, useRef, useCallback } from 'react';
import type { LeaderboardEntry } from '../types';
import { TrafficLightScore } from '../types';

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

const ScoreIndicator: React.FC<{ score: TrafficLightScore }> = ({ score }) => {
  const colorClass = {
    [TrafficLightScore.Green]: 'bg-green-500',
    [TrafficLightScore.Yellow]: 'bg-yellow-400',
    [TrafficLightScore.Red]: 'bg-red-500',
  }[score];

  return <div className={`w-4 h-4 border-2 border-black ${colorClass}`} title={`Score: ${score}`}></div>;
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  const ROW_HEIGHT = 44; // Fixed height for each row is crucial for virtualization
  const BUFFER_ROWS = 5; // Render extra rows above and below the viewport

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Calculate which items to render
  const totalHeight = data.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const visibleRows = containerRef.current ? Math.ceil(containerRef.current.clientHeight / ROW_HEIGHT) : 0;
  const endIndex = Math.min(data.length, startIndex + visibleRows + 2 * BUFFER_ROWS);

  const visibleItems = data.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  return (
    <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_#000] h-full flex flex-col">
      <h2 className="text-2xl font-black mb-4 text-center text-black flex-shrink-0">
        Top Smashed Repos
      </h2>
      
      {/* Header */}
      <div className="flex items-center border-b-2 border-black text-sm text-gray-600 uppercase font-bold flex-shrink-0">
          <div className="p-2 w-2/5">Repo</div>
          <div className="p-2 text-center w-1/5">Reviews</div>
          <div className="p-2 text-center w-1/5">Bugs</div>
          <div className="p-2 text-center w-1/5">Vibe</div>
      </div>
      
      {/* Virtualized List Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto flex-grow"
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${offsetY}px)` }}>
              {visibleItems.map((entry, index) => {
                 const actualIndex = startIndex + index;
                 return (
                    <div key={actualIndex} className="flex items-center border-b border-black last:border-b-0" style={{ height: `${ROW_HEIGHT}px` }}>
                        <div className="p-2 text-sm truncate max-w-[150px] font-semibold text-blue-600 w-2/5">
                            <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" title={entry.repoUrl}>
                                {entry.repoUrl.replace('https://github.com/', '')}
                            </a>
                        </div>
                        <div className="p-2 text-center font-mono w-1/5">{entry.reviewCount}</div>
                        <div className="p-2 text-center font-mono w-1/5">{entry.bugsFound}</div>
                        <div className="p-2 flex justify-center items-center w-1/5">
                            <ScoreIndicator score={entry.score} />
                        </div>
                    </div>
                 );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};