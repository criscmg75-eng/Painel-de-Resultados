import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrq_GmarCqbojTAM3Bx4rP7CcLzhDqk8k",
  authDomain: "painel-de-resultados.firebaseapp.com",
  projectId: "painel-de-resultados",
  storageBucket: "painel-de-resultados.firebasestorage.app",
  messagingSenderId: "226230140564",
  appId: "1:226230140564:web:feaddf6247f1ed3bcfbe81",
  measurementId: "G-L9KG5XWT8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
