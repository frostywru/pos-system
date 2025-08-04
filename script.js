import { db, ref, get, child } from './firebase.js';

let cashierList = {};

async function loadCashiers() {
  const snapshot = await get(child(ref(db), 'cashiers'));
  if (snapshot.exists()) {
    cashierList = snapshot.val();
  } else {
    console.error("No cashiers found in database.");
  }
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

window.onload = async () => {
  await loadCashiers();
  const saved = localStorage.getItem("currentCashier");
  if (saved) {
    const cashier = JSON.parse(saved);
    showPOS(cashier);
  }
};

window.handleLogin = handleLogin;
window.changeCashier = changeCashier;
