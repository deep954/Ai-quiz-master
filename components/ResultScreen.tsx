import React, { useState } from 'react';
import { QuizResult } from '../types';
import { Button } from './Button';
import { saveFeedback } from '../services/storageService';
import { playClickSound } from '../services/audioService';

interface ResultScreenProps {
  result: QuizResult;
  onRestart: () => void;
  topic: string;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onRestart, topic }) => {
  const percentage = Math.round((result.score / result.total) * 100);
  
  // Feedback State
  const [starRating, setStarRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState<'Too Easy' | 'Just Right' | 'Too Hard' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  let message = "";
  let emoji = "";
  
  if (percentage === 100) {
    message = "Perfect Score! You're a Genius!";
    emoji = "🏆";
  } else if (percentage >= 80) {
    message = "Great Job! You know your stuff.";
    emoji = "🌟";
  } else if (percentage >= 50) {
    message = "Good effort! Keep learning.";
    emoji = "👍";
  } else {
    message = "Don't give up! Try again.";
    emoji = "📚";
  }

  const handleSubmitFeedback = () => {
    if (starRating === 0 || !difficultyRating) return;

    playClickSound();
    
    saveFeedback({
      topic,
      score: result.score,
      totalQuestions: result.total,
      difficultyRating,
      starRating,
      comment
    });

    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      
      {/* Level Up Notification */}
      {result.levelUp && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl p-6 text-white text-center animate-bounce-slow relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold uppercase tracking-widest mb-2">Level Up!</h2>
            <p className="text-lg opacity-90">You are now Level {result.newLevel}</p>
            <div className="text-5xl mt-2">🔥</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl glass-panel p-8 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        
        <div className="flex justify-center items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-gray-900">{result.score}</h2>
            <span className="text-gray-400 text-xl font-medium mb-1">/ {result.total} Correct</span>
        </div>

        <div className="inline-block bg-indigo-50 px-4 py-2 rounded-xl mb-6 border border-indigo-100">
           <span className="text-indigo-900 font-bold uppercase tracking-wide text-xs">Points Earned</span>
           <div className="text-3xl font-black text-indigo-600">+{result.points.toLocaleString()}</div>
        </div>

        <p className="text-xl font-medium text-indigo-600 mb-8">{message}</p>
        
        <Button onClick={onRestart} className="w-full md:w-auto min-w-[200px]">
          {result.levelUp ? 'Next Level' : 'Play Again'}
        </Button>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-3xl shadow-xl glass-panel p-6 md:p-8">
        {!isSubmitted ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 text-center">Rate this Quiz</h3>
            
            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-600">How was the quality?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { playClickSound(); setStarRating(star); }}
                    className={`text-3xl transition-transform hover:scale-110 ${star <= starRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Rating */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-600">How was the difficulty?</label>
              <div className="flex gap-2 w-full max-w-md">
                {(['Too Easy', 'Just Right', 'Too Hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => { playClickSound(); setDifficultyRating(level); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      difficultyRating === level 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Any comments? (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What was wrong?"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm min-h-[80px]"
              />
            </div>

            <Button 
              onClick={handleSubmitFeedback} 
              disabled={starRating === 0 || !difficultyRating}
              className="w-full"
              variant="secondary"
            >
              Submit Feedback
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-500">Your feedback helps us improve the AI generation.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl glass-panel p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Review Answers</h3>
        <div className="space-y-6">
          {result.history.map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border-l-4 ${item.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">{idx + 1}. {item.question}</p>
                  
                  <div className="space-y-1 text-sm">
                     <p className={`${item.isCorrect ? 'text-green-700' : 'text-red-700 font-medium'}`}>
                      Your Answer: {item.userAnswer} 
                      {item.isCorrect ? ' ✅' : ' ❌'}
                    </p>
                    {!item.isCorrect && (
                      <p className="text-green-700 font-medium">
                        Correct Answer: {item.correctAnswer}
                      </p>
                    )}
                  </div>
                  
                  <p className="text-gray-500 text-xs mt-3 italic">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};