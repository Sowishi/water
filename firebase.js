// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy-05Qz1zhtUWXThGV5wtXjWD1YzL41vw",
  authDomain: "water-e2f87.firebaseapp.com",
  projectId: "water-e2f87",
  storageBucket: "water-e2f87.firebasestorage.app",
  messagingSenderId: "156285227451",
  appId: "1:156285227451:web:2ac97d575db54b55f1f49e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
