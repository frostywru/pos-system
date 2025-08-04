// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDy2fDyamxeb7ojNUg-tYWh4AbcThuP6WY",
  authDomain: "pos-system-cf07b.firebaseapp.com",
  databaseURL: "https://pos-system-cf07b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pos-system-cf07b",
  storageBucket: "pos-system-cf07b.firebasestorage.app",
  messagingSenderId: "5282726169",
  appId: "1:5282726169:web:bbe36d10d506a1ad76c588",
  measurementId: "G-7GESCRCZRV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { db };