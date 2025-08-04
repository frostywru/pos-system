import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let cashierList = {};

// Fetch cashier data from Firestore
async function loadCashiers() {
  const querySnapshot = await getDocs(collection(db, "cashiers"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    cashierList[data.pin] = { name: data.name, id: data.id };
  });
}

function showPOS(cashier) {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("pos-screen").style.display = "block";
  document.getElementById("cashier-name").innerText = cashier.name;
}

function handleLogin() {
  const pin = document.getElementById("pin-input").value;
  if (cashierList[pin]) {
    const cashier = cashierList[pin];
    localStorage.setItem("currentCashier", JSON.stringify(cashier));
    showPOS(cashier);
  } else {
    alert("Invalid PIN");
  }
}

function changeCashier() {
  localStorage.removeItem("currentCashier");
  location.reload();
}

// On page load
window.onload = async () => {
  await loadCashiers(); // fetch data from Firestore
  const saved = localStorage.getItem("currentCashier");
  if (saved) {
    const cashier = JSON.parse(saved);
    showPOS(cashier);
  }
};
