import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { Button } from './Button';
import { SpeakerButton } from './SpeakerButton';
import { playClickSound } from '../services/audioService';

interface QuizScreenProps {
  questions: QuizQuestion[];
  onFinish: (result: QuizResult) => void;
  voice: string;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onFinish, voice }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [history, setHistory] = useState<QuizResult['history']>([]);
  const [score, setScore] = useState(0);
  
  // Scoring State
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIdx];

  // Reset timer on new question
  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIdx]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    const timeTakenSeconds = (Date.now() - startTime) / 1000;
    playClickSound();
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    
    let earnedPoints = 0;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      
      // Points Logic
      const basePoints = 100;
      // Speed Bonus: 50 points if < 5s, drops linearly to 0 at 15s
      const speedBonus = Math.max(0, Math.round(50 - (timeTakenSeconds * 3))); 
      // Streak Bonus: 20 points per consecutive correct answer
      const streakBonus = streak * 20;

      earnedPoints = basePoints + speedBonus + streakBonus;
      setPoints((prev) => prev + earnedPoints);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setHistory((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: option,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        explanation: currentQuestion.explanation,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onFinish({
        score,
        total: questions.length,
        points,
        history,
      });
    }
  };

  const handleSkip = () => {
    playClickSound();
    
    // Reset streak on skip
    setStreak(0);

    // Record skipped question in history
    const skippedEntry = {
      question: currentQuestion.question,
      userAnswer: "Skipped",
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      explanation: currentQuestion.explanation,
    };

    const newHistory = [...history, skippedEntry];
    setHistory(newHistory);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // If skipping the last question, finish the quiz
      onFinish({
        score,
        total: questions.length,
        points,
        history: newHistory,
      });
    }
  };

  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 bg-white/30 rounded-full h-4 overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden glass-panel p-6 md:p-8 relative">
        
        {/* Score & Streak Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wide">Points</span>
            <span className="text-xl font-bold text-indigo-600">{points.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col items-center">
             <span className="text-gray-400 text-xs font-medium">Question {currentIdx + 1}/{questions.length}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wide">Streak</span>
            <div className="flex items-center gap-1">
               <span className={`text-xl font-bold ${streak > 1 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`}>
                 🔥 {streak}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-8">
            <h2 dir="auto" className="flex-1 text-2xl font-bold text-gray-800 leading-relaxed">
            {currentQuestion.question}
            </h2>
            <SpeakerButton text={currentQuestion.question} className="mt-1" voice={voice} />
        </div>

        <div className="grid gap-4 mb-8">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium w-full flex items-center gap-3 group ";
            
            if (isAnswered) {
              if (option === currentQuestion.correctAnswer) {
                btnClass += "bg-green-100 border-green-500 text-green-800";
              } else if (option === selectedOption) {
                btnClass += "bg-red-100 border-red-500 text-red-800";
              } else {
                btnClass += "border-gray-100 text-gray-400 opacity-50";
              }
            } else {
              btnClass += "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 cursor-pointer";
            }

            return (
              <div key={idx} className="relative">
                <button
                    onClick={() => handleOptionClick(option)}
                    disabled={isAnswered}
                    className={btnClass}
                >
                    <span className="inline-block w-8 h-8 text-center leading-8 rounded-full bg-white/50 border border-gray-200 text-sm font-bold flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                    </span>
                    <span dir="auto" className="flex-1">{option}</span>
                </button>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <SpeakerButton text={option} size="sm" voice={voice} />
                </div>
              </div>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-5 rounded-xl animate-fade-in relative">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Explanation
                </h3>
                <SpeakerButton text={currentQuestion.explanation} size="sm" className="text-blue-400 hover:text-blue-700" voice={voice} />
            </div>
            <p dir="auto" className="text-blue-800 text-base leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center gap-4 mt-8">
          {!isAnswered ? (
             <Button 
               onClick={handleSkip} 
               variant="secondary"
               className="w-full md:w-auto"
             >
               Skip Question
             </Button>
          ) : (
             <div /> // Spacer to keep Next button on the right
          )}

          <Button 
            onClick={handleNext} 
            disabled={!isAnswered}
            className="w-full md:w-auto"
          >
            {currentIdx + 1 === questions.length ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  );
};