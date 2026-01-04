// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// 請把您剛剛在 Google 網站複製的那串 firebaseConfig 貼在下面取代這裡
// 注意：要保留 const firebaseConfig = 和後面的分號;
const firebaseConfig = {
  apiKey: "AIzaSyAtqc6vlNMJtPNWE1cAAhcVFgzTqhtSkj8",
  authDomain: "yeshan-pos.firebaseapp.com",
  projectId: "yeshan-pos",
  storageBucket: "yeshan-pos.firebasestorage.app",
  messagingSenderId: "541875991078",
  appId: "1:541875991078:web:ae36a51f875f736c8f2ce7"
};
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);