import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrq_GmarCqbojTAM3Bx4rP7CcLzhDqk8k",
  authDomain: "painel-de-resultados.firebaseapp.com",
  projectId: "painel-de-resultados",
  storageBucket: "painel-de-resultados.appspot.com",
  messagingSenderId: "226230140564",
  appId: "1:226230140564:web:feaddf6247f1ed3bcfbe81",
  measurementId: "G-L9KG5XWT8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
    
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
