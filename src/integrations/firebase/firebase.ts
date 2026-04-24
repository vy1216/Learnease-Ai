// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3MDqY_-lKpj54cGccJ5tdJyuIXuDN2y0",
  authDomain: "learnease-a5f93.firebaseapp.com",
  projectId: "learnease-a5f93",
  storageBucket: "learnease-a5f93.appspot.com",
  messagingSenderId: "225763336828",
  appId: "1:225763336828:web:ac8ae0ad32aa3e28dedff9",
  measurementId: "G-LKMX83Z7G4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, analytics, db, storage, auth };
