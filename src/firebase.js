// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClcomnV2qVu1M7NHWdvcufVRyx20YquCY",
  authDomain: "bilingues-placement-test.firebaseapp.com",
  projectId: "bilingues-placement-test",
  storageBucket: "bilingues-placement-test.firebasestorage.app",
  messagingSenderId: "1099401510278",
  appId: "1:1099401510278:web:ed5ec6ccadbd7c5736c007"
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app);

// Initialize Firestore Database
export const db = getFirestore(app);
console.log('Firestore db initialized:', db);

// Initialize Firebase Authentication
export const auth = getAuth(app);
console.log('Firebase auth initialized:', auth);

export default app; 