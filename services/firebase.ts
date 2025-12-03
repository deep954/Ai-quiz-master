import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCa2xQdvan3TcC7l4U2WfAlqqk8MSWmXwc",
  authDomain: "daily1-better.firebaseapp.com",
  databaseURL: "https://daily1-better-default-rtdb.firebaseio.com",
  projectId: "daily1-better",
  storageBucket: "daily1-better.firebasestorage.app",
  messagingSenderId: "48297398536",
  appId: "1:48297398536:web:de6505a7c4cc95d89a9cbd",
  measurementId: "G-TN7DYENBDZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, analytics, database, auth };