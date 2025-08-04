// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  update,
  push,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDy2fDyamxeb7ojNUg-tYWh4AbcThuP6WY",
  authDomain: "pos-system-cf07b.firebaseapp.com",
  databaseURL:
    "https://pos-system-cf07b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pos-system-cf07b",
  storageBucket: "pos-system-cf07b.appspot.com",
  messagingSenderId: "5282726169",
  appId: "1:5282726169:web:bbe36d10d506a1ad76c588",
  measurementId: "G-7GESCRCZRV"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, child, update, push, runTransaction };
