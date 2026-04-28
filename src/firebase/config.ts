import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBslt_-hUP5GRR3PHSAVwUr9sn8RsSCQVM",
  authDomain: "stock-portal-1a8a0.firebaseapp.com",
  projectId: "stock-portal-1a8a0",
  storageBucket: "stock-portal-1a8a0.firebasestorage.app",
  messagingSenderId: "502024687081",
  appId: "1:502024687081:web:b49aade6a62f6fefc80f78"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);