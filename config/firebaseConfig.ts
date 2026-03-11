// config/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGUkUfgve4HrWw5hgXxisO4q2-J1lKegI",
  authDomain: "dermia-cbd8e.firebaseapp.com",
  projectId: "dermia-cbd8e",
  storageBucket: "dermia-cbd8e.firebasestorage.app",
  messagingSenderId: "1045702613353",
  appId: "1:1045702613353:web:b4738a8b9a703e8bbc05f8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you will use in your FYP
export const auth = getAuth(app); // For Login/Signup
export const db = getFirestore(app); // For saving Diagnosis History
export const storage = getStorage(app); // For uploading skin lesion images
