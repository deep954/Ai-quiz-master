import React, { useState, useEffect } from 'react';
import { GameState, QuizQuestion, QuizResult, QuizSettings, GameMode } from './types';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { generateQuiz } from './services/geminiService';
import { Button } from './components/Button';
import { playClickSound } from './services/audioService';
import { FLATTENED_CATEGORIES } from './categories';
import { Difficulty } from './types';
import { 
  getUserLevel, saveUserLevel, getUserPoints, saveUserPoints,
  fetchUserLevel, fetchUserPoints 
} from './services/storageService';
import { AdBanner } from './components/AdBanner';
import { AdsterraNativeAd } from './components/AdsterraNativeAd';
import { AuthModal } from './components/AuthModal';
import { subscribeToAuthChanges, logOut } from './services/authService';
import { User } from 'firebase/auth';

const AUTO_GEN_INTERVAL_SECONDS = 300; // 5 minutes

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentVoice, setCurrentVoice] = useState<string>('Kore');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('CLASSIC');
  
  // User Stats
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userPoints, setUserPoints] = useState<number>(0);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // State for background quiz generation
  const [pendingQuiz, setPendingQuiz] = useState<{ topic: string, questions: QuizQuestion[] } | null>(null);
  const [nextQuizTimer, setNextQuizTimer] = useState<number>(AUTO_GEN_INTERVAL_SECONDS);

  // Load Initial Local Stats
  useEffect(() => {
    setUserLevel(getUserLevel());
    setUserPoints(getUserPoints());
  }, []);

  // Subscribe to Auth Changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch cloud data when user logs in
        const level = await fetchUserLevel();
        const points = await fetchUserPoints();
        setUserLevel(level);
        setUserPoints(points);
      } else {
        // Fallback to local data if logged out
        setUserLevel(getUserLevel());
        setUserPoints(getUserPoints());
      }
    });
    return () => unsubscribe();
  }, []);

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Background Timer & Generator Logic
  useEffect(() => {
    const handleBackgroundGen = async () => {
      try {
        // Pick a random topic
        const randomTopic = FLATTENED_CATEGORIES[Math.floor(Math.random() * FLATTENED_CATEGORIES.length)];
        console.log(`Auto-generating background quiz for topic: ${randomTopic}`);

        // Generate 10 questions
        const newQuestions = await generateQuiz(randomTopic, Difficulty.MEDIUM, 10, 'English');

        // Update state
        setPendingQuiz({ topic: randomTopic, questions: newQuestions });

        // Send System Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🧠 AI Quiz Master', {
            body: `New Quiz Ready: ${randomTopic}! Click to play now.`,
            icon: '/favicon.ico'
          });
          playClickSound(); 
        }
      } catch (error) {
        console.error("Background quiz generation failed:", error);
      }
    };

    const timerId = setInterval(() => {
      setNextQuizTimer((prev) => {
        if (prev <= 1) {
          // Trigger generation and reset
          handleBackgroundGen();
          return AUTO_GEN_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDifficultyForLevel = (level: number): Difficulty => {
    if (level <= 20) return Difficulty.EASY;
    if (level <= 50) return Difficulty.MEDIUM;
    if (level <= 80) return Difficulty.HARD;
    return Difficulty.EXTREME;
  };

  const startGame = async (settings: QuizSettings) => {
    setGameState('LOADING');
    setErrorMsg('');
    setCurrentVoice(settings.voice);
    setCurrentTopic(settings.topic);
    setCurrentGameMode(settings.mode);
    setPendingQuiz(null); // Clear pending if user starts manual game
    
    try {
      // If Career Mode, override difficulty based on level
      let difficulty = settings.difficulty;
      let levelParam: number | undefined = undefined;

      if (settings.mode === 'CAMPAIGN') {
        difficulty = getDifficultyForLevel(settings.level || 1);
        levelParam = settings.level;
      }

      const generatedQuestions = await generateQuiz(
        settings.topic, 
        difficulty, 
        settings.count,
        settings.language,
        levelParam
      );
      setQuestions(generatedQuestions);
      setGameState('PLAYING');
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to generate quiz. Please check your API key or try a different topic.');
      setGameState('ERROR');
    }
  };

  const startPendingQuiz = () => {
    if (pendingQuiz) {
      playClickSound();
      if (gameState === 'PLAYING') {
        const confirmSwitch = window.confirm("Abandon current quiz to play the new one?");
        if (!confirmSwitch) return;
      }
      setQuestions(pendingQuiz.questions);
      setCurrentTopic(pendingQuiz.topic);
      setCurrentGameMode('CLASSIC'); // Pending quizzes are always classic/custom
      setGameState('PLAYING');
      setPendingQuiz(null);
    }
  };

  const finishGame = (finalResult: QuizResult) => {
    let resultToSave = { ...finalResult };

    // Update Global Points
    const newTotalPoints = userPoints + finalResult.points;
    setUserPoints(newTotalPoints);
    saveUserPoints(newTotalPoints);

    // Leveling Logic for Career Mode
    if (currentGameMode === 'CAMPAIGN') {
      const percentage = (finalResult.score / finalResult.total);
      // If score is 60% or higher, level up
      if (percentage >= 0.6 && userLevel < 100) {
        const newLevel = userLevel + 1;
        setUserLevel(newLevel);
        saveUserLevel(newLevel);
        resultToSave.levelUp = true;
        resultToSave.newLevel = newLevel;
      }
    }

    setResult(resultToSave);
    setGameState('RESULT');
  };

  const restartGame = () => {
    setGameState('START');
    setQuestions([]);
    setResult(null);
    setCurrentTopic('');
  };

  const goHome = () => {
    playClickSound();
    if (gameState === 'PLAYING') {
      const confirmExit = window.confirm("Are you sure you want to quit the quiz? Your progress will be lost.");
      if (!confirmExit) return;
    }
    restartGame();
  };

  const handleAuthClick = () => {
    playClickSound();
    if (currentUser) {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        logOut();
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative pb-20">
      
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Top Header Area */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50 pointer-events-none">
        
        {/* Left: Home Button (Only when not start) */}
        <div className="pointer-events-auto">
          {gameState !== 'START' && (
            <button 
              onClick={goHome}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/20 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium hidden md:inline">Menu</span>
            </button>
          )}
        </div>

        {/* Right: Auth Button */}
        <div className="pointer-events-auto">
          <button 
            onClick={handleAuthClick}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/20"
          >
            {currentUser ? (
              <>
                 <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs border border-white/50">
                    {currentUser.email?.charAt(0).toUpperCase()}
                 </div>
                 <span className="font-medium hidden md:inline text-sm">Logout</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium hidden md:inline text-sm">Login</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Next Drop Timer Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-md text-indigo-900 px-4 py-2 rounded-full shadow-xl border border-white/50 flex items-center gap-2 text-sm font-bold animate-fade-in-up">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          Next Drop: {formatTime(nextQuizTimer)}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto z-10 flex flex-col gap-6 pt-12 md:pt-0">
        {gameState === 'START' && (
          <StartScreen 
            onStart={startGame} 
            pendingQuizTopic={pendingQuiz?.topic}
            onStartPendingQuiz={startPendingQuiz}
            userLevel={userLevel}
            userPoints={userPoints}
          />
        )}

        {gameState === 'LOADING' && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center glass-panel max-w-lg mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Quiz...</h2>
            {currentGameMode === 'CAMPAIGN' && (
              <p className="text-indigo-600 font-bold mb-2">Level {userLevel}</p>
            )}
            <p className="text-gray-500">Our AI is crafting unique questions about <span className="font-bold text-indigo-600">{currentTopic}</span> just for you.</p>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <QuizScreen 
            questions={questions} 
            onFinish={finishGame}
            voice={currentVoice}
          />
        )}

        {gameState === 'RESULT' && result && (
          <ResultScreen 
            result={result} 
            onRestart={restartGame}
            topic={currentTopic}
          />
        )}

        {gameState === 'ERROR' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center glass-panel max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{errorMsg || "We couldn't generate a quiz right now."}</p>
            <Button onClick={restartGame}>Try Again</Button>
          </div>
        )}

        {/* Ads */}
        <div className="flex flex-col gap-4">
            <AdBanner />
            <AdsterraNativeAd />
        </div>
      </div>

      {/* Footer / Credits */}
      <div className="fixed bottom-4 text-center w-full pointer-events-none text-white/40 text-xs z-0">
        Powered by Google Gemini 2.5
      </div>
    </div>
  );
};