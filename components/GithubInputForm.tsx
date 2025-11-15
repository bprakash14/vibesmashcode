
import React, { useState } from 'react';

interface GithubInputFormProps {
  onReview: (url: string) => void;
  isLoading: boolean;
}

export const GithubInputForm: React.FC<GithubInputFormProps> = ({ onReview, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReview(url);
  };

  return (
    <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_#000]">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your GitHub repo URL here..."
          className="flex-grow bg-white border-2 border-black px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-yellow-400 text-black uppercase font-extrabold py-3 px-6 border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_#999]"
          disabled={isLoading}
        >
          {isLoading ? 'Smashing...' : 'Smash Code'}
        </button>
      </form>
    </div>
  );
};