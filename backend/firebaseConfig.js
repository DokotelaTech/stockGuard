import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "blockchain-uj-hackthon.firebaseapp.com",
    projectId: "blockchain-uj-hackthon",
    storageBucket: "blockchain-uj-hackthon.firebasestorage.app",
    messagingSenderId: "328506086658",
    appId: "1:328506086658:web:1583a61ccade4a9040de1b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);