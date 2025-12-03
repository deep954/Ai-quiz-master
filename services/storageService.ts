import { database, auth } from './firebase';
import { ref, set, push, child, get } from 'firebase/database';

export interface QuizFeedback {
  id: string;
  timestamp: number;
  topic: string;
  score: number;
  totalQuestions: number;
  difficultyRating: 'Too Easy' | 'Just Right' | 'Too Hard';
  starRating: number;
  comment: string;
}

const STORAGE_KEY = 'ai_quiz_master_feedback';
const LEVEL_KEY = 'ai_quiz_master_level';
const POINTS_KEY = 'ai_quiz_master_points';
const USER_ID_KEY = 'ai_quiz_master_user_id';

// Helper to get or create a persistent User ID
// Now prioritizes Firebase Auth ID if logged in
const getUserId = (): string => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const saveFeedback = (feedback: Omit<QuizFeedback, 'id' | 'timestamp'>) => {
  try {
    const userId = getUserId();
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    // 1. Save to LocalStorage (Legacy/Offline support)
    const existingDataStr = localStorage.getItem(STORAGE_KEY);
    const existingData: QuizFeedback[] = existingDataStr ? JSON.parse(existingDataStr) : [];

    const newFeedback: QuizFeedback = {
      ...feedback,
      id,
      timestamp,
    };

    const updatedData = [newFeedback, ...existingData];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    // 2. Save to Firebase
    const feedbackRef = ref(database, 'feedback');
    const newFeedbackRef = push(feedbackRef);
    set(newFeedbackRef, {
      ...newFeedback,
      userId
    }).catch(err => console.error("Firebase write failed", err));

    return true;
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return false;
  }
};

export const getFeedbackHistory = (): QuizFeedback[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// --- Level Logic ---

// Get level from Cloud (if logged in) or Local
export const fetchUserLevel = async (): Promise<number> => {
    if (auth.currentUser) {
        try {
            const snapshot = await get(child(ref(database), `users/${auth.currentUser.uid}/level`));
            if (snapshot.exists()) {
                const val = snapshot.val();
                localStorage.setItem(LEVEL_KEY, val.toString()); // Sync cloud to local
                return val;
            }
        } catch (e) {
            console.warn("Failed to fetch level from cloud", e);
        }
    }
    // Fallback to local
    const level = localStorage.getItem(LEVEL_KEY);
    return level ? parseInt(level, 10) : 1;
};

// Sync convenience wrapper for immediate local access
export const getUserLevel = (): number => {
  try {
    const level = localStorage.getItem(LEVEL_KEY);
    return level ? parseInt(level, 10) : 1;
  } catch (error) {
    return 1;
  }
};

export const saveUserLevel = (level: number): void => {
  try {
    localStorage.setItem(LEVEL_KEY, level.toString());
    
    // Sync to Firebase
    const userId = getUserId();
    set(ref(database, `users/${userId}/level`), level)
      .catch(err => console.warn("Firebase sync level failed", err));

  } catch (error) {
    console.error("Failed to save user level:", error);
  }
};

// --- Points Logic ---

// Get points from Cloud (if logged in) or Local
export const fetchUserPoints = async (): Promise<number> => {
    if (auth.currentUser) {
        try {
            const snapshot = await get(child(ref(database), `users/${auth.currentUser.uid}/points`));
            if (snapshot.exists()) {
                const val = snapshot.val();
                localStorage.setItem(POINTS_KEY, val.toString()); // Sync cloud to local
                return val;
            }
        } catch (e) {
            console.warn("Failed to fetch points from cloud", e);
        }
    }
    // Fallback to local
    const points = localStorage.getItem(POINTS_KEY);
    return points ? parseInt(points, 10) : 0;
};

// Sync convenience wrapper for immediate local access
export const getUserPoints = (): number => {
  try {
    const points = localStorage.getItem(POINTS_KEY);
    return points ? parseInt(points, 10) : 0;
  } catch (error) {
    return 0;
  }
};

export const saveUserPoints = (points: number): void => {
  try {
    localStorage.setItem(POINTS_KEY, points.toString());
    
    // Sync to Firebase
    const userId = getUserId();
    set(ref(database, `users/${userId}/points`), points)
       .catch(err => console.warn("Firebase sync points failed", err));

  } catch (error) {
    console.error("Failed to save user points:", error);
  }
};