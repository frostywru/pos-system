import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ add this
import { getAnalytics } from "firebase/analytics";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ define and export db properly
const db = getFirestore(app);
export { db };
