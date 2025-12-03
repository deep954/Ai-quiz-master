import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import { playAudio, stopAudio } from '../services/audioService';

interface SpeakerButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
  voice?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({ text, className = '', size = 'md', voice = 'Kore' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events (like selecting an option)

    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const base64Audio = await generateSpeech(text, voice);
      setIsLoading(false);
      setIsPlaying(true);
      await playAudio(base64Audio);
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to play audio", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-full p-2 transition-colors duration-200 flex-shrink-0 ${
        isPlaying 
          ? 'bg-indigo-100 text-indigo-600 animate-pulse' 
          : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
      } ${className}`}
      title="Pronounce"
      aria-label="Listen to pronunciation"
    >
      {isLoading ? (
        <svg className={`${iconSize} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isPlaying ? (
         <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
};