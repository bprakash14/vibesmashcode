
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { GithubInputForm } from './components/GithubInputForm';
import { ReviewResult } from './components/ReviewResult';
import { Leaderboard } from './components/Leaderboard';
import { reviewCode } from './services/geminiService';
import type { CodeReviewResult, LeaderboardEntry } from './types';
// FIX: Import TrafficLightScore enum to use its values.
import { TrafficLightScore } from './types';
import { SpinnerIcon } from './components/Icons';
import { VibeStats } from './components/VibeStats';

const App: React.FC = () => {
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([
    // FIX: Use TrafficLightScore enum member instead of string literal to match the expected type.
    { repoUrl: 'https://github.com/user/cool-project', reviewCount: 28, bugsFound: 12, score: TrafficLightScore.Yellow },
    // FIX: Use TrafficLightScore enum member instead of string literal to match the expected type.
    { repoUrl: 'https://github.com/user/another-app', reviewCount: 19, bugsFound: 5, score: TrafficLightScore.Green },
    // FIX: Use TrafficLightScore enum member instead of string literal to match the expected type.
    { repoUrl: 'https://github.com/user/risky-code', reviewCount: 15, bugsFound: 45, score: TrafficLightScore.Red },
  ]);
  const [vibeCounts, setVibeCounts] = useState({
    vibe: 25,
    hmm: 7,
    'not-my-vibe': 2,
  });

  const handleVibeChange = useCallback((newVibe: string | null, oldVibe: string | null) => {
    setVibeCounts(counts => {
      const newCounts = { ...counts };
      if (oldVibe) {
        newCounts[oldVibe as keyof typeof newCounts] = Math.max(0, newCounts[oldVibe as keyof typeof newCounts] - 1);
      }
      if (newVibe) {
        newCounts[newVibe as keyof typeof newCounts] = (newCounts[newVibe as keyof typeof newCounts] || 0) + 1;
      }
      return newCounts;
    });
  }, []);


  const handleReview = useCallback(async (url: string) => {
    if (!url) {
      setError('Gotta drop a GitHub URL, friend.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReviewResult(null);

    try {
      const result = await reviewCode(url);
      setReviewResult(result);

      // Update leaderboard
      setLeaderboardData(prevData => {
        const existingEntryIndex = prevData.findIndex(entry => entry.repoUrl === url);
        let newData = [...prevData];

        if (existingEntryIndex !== -1) {
          const existingEntry = newData[existingEntryIndex];
          newData[existingEntryIndex] = {
            ...existingEntry,
            reviewCount: existingEntry.reviewCount + 1,
            bugsFound: existingEntry.bugsFound + result.vulnerabilities.length,
            score: result.overallScore,
          };
        } else {
          newData.push({
            repoUrl: url,
            reviewCount: 1,
            bugsFound: result.vulnerabilities.length,
            score: result.overallScore,
          });
        }

        // Sort by review count descending
        return newData.sort((a, b) => b.reviewCount - a.reviewCount);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <GithubInputForm onReview={handleReview} isLoading={isLoading} />
            {isLoading && (
              <div className="flex justify-center items-center p-8 bg-white border-2 border-black">
                <SpinnerIcon className="h-12 w-12 text-blue-500" />
                <p className="ml-4 text-lg font-semibold">Smashing code... checking vibes... </p>
              </div>
            )}
            {error && <div className="p-4 bg-red-300 text-red-900 border-2 border-red-900 font-semibold">{error}</div>}
            {reviewResult && <ReviewResult result={reviewResult} onVibeChange={handleVibeChange} />}
          </div>
          <div className="lg:col-span-1 space-y-8">
            <VibeStats counts={vibeCounts} />
            <Leaderboard data={leaderboardData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;