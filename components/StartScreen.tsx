import React, { useState } from 'react';
import { Difficulty, QuizSettings, GameMode } from '../types';
import { Button } from './Button';
import { CATEGORIES, FLATTENED_CATEGORIES } from '../categories';
import { LANGUAGES } from '../languages';
import { playClickSound } from '../services/audioService';

interface StartScreenProps {
  onStart: (settings: QuizSettings) => void;
  pendingQuizTopic?: string;
  onStartPendingQuiz?: () => void;
  userLevel: number;
  userPoints: number;
}

type InputMode = 'custom' | 'select';

const VOICES = [
  { id: 'Kore', name: 'Kore (Female - Balanced)' },
  { id: 'Zephyr', name: 'Zephyr (Female - Energetic)' },
  { id: 'Puck', name: 'Puck (Male - Balanced)' },
  { id: 'Charon', name: 'Charon (Male - Deep)' },
  { id: 'Fenrir', name: 'Fenrir (Male - Energetic)' },
];

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, pendingQuizTopic, onStartPendingQuiz, userLevel, userPoints }) => {
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [mode, setMode] = useState<InputMode>('select');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [count, setCount] = useState(5);
  const [language, setLanguage] = useState('English');
  const [voice, setVoice] = useState('Kore');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStart({ 
        topic, 
        difficulty, 
        count: gameMode === 'CAMPAIGN' ? 5 : count, 
        language, 
        voice,
        mode: gameMode,
        level: gameMode === 'CAMPAIGN' ? userLevel : undefined
      });
    }
  };

  const handleModeChange = (newMode: InputMode) => {
    playClickSound();
    setMode(newMode);
    setTopic('');
  };

  const handleRandomTopic = () => {
    playClickSound();
    const randomTopic = FLATTENED_CATEGORIES[Math.floor(Math.random() * FLATTENED_CATEGORIES.length)];
    setTopic(randomTopic);
  };

  const handleGameModeSwitch = (newGameMode: GameMode) => {
    playClickSound();
    setGameMode(newGameMode);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden glass-panel p-8">
      <div className="text-center mb-6">
        <div className="flex justify-between items-start">
           {/* Points Badge */}
           <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
             <span>🏆</span>
             <span>{userPoints.toLocaleString()} Pts</span>
           </div>
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">AI Quiz Master</h1>
        
        {/* Game Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mt-4 mx-auto max-w-[280px]">
          <button
            onClick={() => handleGameModeSwitch('CLASSIC')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${gameMode === 'CLASSIC' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Quick Play
          </button>
          <button
            onClick={() => handleGameModeSwitch('CAMPAIGN')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${gameMode === 'CAMPAIGN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Career Mode
          </button>
        </div>
      </div>

      {gameMode === 'CAMPAIGN' && (
        <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
           </div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-indigo-100 text-sm uppercase tracking-wider">Current Level</span>
                <span className="font-bold text-2xl">{userLevel} / 100</span>
             </div>
             <div className="w-full bg-black/20 rounded-full h-3">
               <div 
                  className="bg-white h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(userLevel / 100) * 100}%` }}
               ></div>
             </div>
             <p className="text-xs text-indigo-100 mt-2">
               Win quizzes to level up and unlock harder questions!
             </p>
           </div>
        </div>
      )}

      {/* New Quiz Notification Button */}
      {pendingQuizTopic && onStartPendingQuiz && gameMode === 'CLASSIC' && (
        <button
          onClick={() => {
            playClickSound();
            onStartPendingQuiz();
          }}
          className="w-full mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all transform hover:-translate-y-1 flex items-center justify-between group relative overflow-hidden ring-4 ring-emerald-50/50"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <span className="bg-white/20 p-2 rounded-lg animate-pulse">✨</span>
            <div className="text-left">
              <p className="text-xs font-bold uppercase text-emerald-100 tracking-wider">Freshly Generated</p>
              <p className="font-bold text-lg leading-tight">{pendingQuizTopic}</p>
            </div>
          </div>
          <div className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm group-hover:bg-emerald-50 transition-colors relative z-10 whitespace-nowrap">
            Play Now
          </div>
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Narrator Voice</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleModeChange('select')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'select' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('custom')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Custom
              </button>
            </div>
          </div>

          {mode === 'custom' ? (
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 90s Hip Hop, String Theory..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
              autoFocus
            />
          ) : (
            <div className="relative">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                required
              >
                <option value="" disabled>Select a category...</option>
                {Object.entries(CATEGORIES).map(([category, items]) => (
                  <optgroup label={category} key={category}>
                    {items.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          <button 
            type="button" 
            onClick={handleRandomTopic}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <span className="text-lg">🎲</span> Surprise Me!
          </button>
        </div>

        {gameMode === 'CLASSIC' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {Object.values(Difficulty).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>
        )}

        {gameMode === 'CAMPAIGN' && (
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
              <p className="text-indigo-900 font-medium">Career Mode Settings</p>
              <p className="text-indigo-600 text-sm mt-1">
                Difficulty is set to <span className="font-bold">Level {userLevel}</span>.
                <br />
                Win 3/5 questions to Level Up!
              </p>
           </div>
        )}

        <Button type="submit" className="w-full text-lg" disabled={!topic}>
          {gameMode === 'CAMPAIGN' ? `Play Level ${userLevel}` : 'Generate Quiz'}
        </Button>
      </form>
    </div>
  );
};