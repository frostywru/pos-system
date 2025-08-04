import { db, ref, get, child } from './firebase.js';

let cashierList = {};
let data = {};
let currentCashier = null;
let cart = [];
let navigationStack = [];

async function loadCashiers() {
  try {
    const snapshot = await get(child(ref(db), 'cashiers'));
    if (snapshot.exists()) {
      cashierList = snapshot.val();
    } else {
      alert("No cashiers found.");
    }
  } catch (error) {
    alert("Failed to load cashiers.");
  }
}

function handleLogin() {
  const pin = document.getElementById("pin-input").value;
  const found = Object.values(cashierList).find(c => c.pin === pin);

  if (found) {
    localStorage.setItem("cashier", JSON.stringify(found));
    showPOS(found);
  } else {
    alert("Invalid PIN");
  }
}

function showPOS(cashier) {
  currentCashier = cashier;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("pos-screen").style.display = "block";
  document.getElementById("cashier-name").innerText = `Cashier: ${cashier.name}`;
  loadItemData();
}

function changeCashier() {
  localStorage.removeItem('cashier');
  currentCashier = null;
  document.getElementById('pos-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  loadCashiers();
}

async function loadItemData() {
  const res = await fetch("data.json");
  data = await res.json();
  showCategories();
}

function showCategories() {
  navigationStack = [];
  const container = document.getElementById("selection-screen");
  container.innerHTML = "";
  for (const [category, brands] of Object.entries(data)) {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.innerHTML = `<img src="images/${category}.png" /><span>${category}</span>`;
    div.onclick = () => {
      if (category === "Cigarettes") {
        navigationStack.push(showCategories);
        showBrands(category);
      }
    };
    container.appendChild(div);
  }
}

function showBrands(category) {
  const container = document.getElementById("selection-screen");
  container.innerHTML = `<button onclick="goBack()">← Back</button>`;
  for (const [brand, items] of Object.entries(data[category])) {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.innerHTML = `<img src="images/${brand}.png" /><span>${brand}</span>`;
    div.onclick = () => {
      navigationStack.push(() => showBrands(category));
      showItems(category, brand);
    };
    container.appendChild(div);
  }
}

function showItems(category, brand) {
  const container = document.getElementById("selection-screen");
  container.innerHTML = `<button onclick="goBack()">← Back</button>`;
  for (const [variant, item] of Object.entries(data[category][brand])) {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.style.backgroundColor = item.color || "#ddd";
    div.innerHTML = `<span>${variant}<br>₱${item.price}</span>`;
    div.onclick = () => {
      navigationStack.push(() => showItems(category, brand));
      promptQuantity(category, brand, variant, item);
    };
    container.appendChild(div);
  }
}

function promptQuantity(category, brand, variant, item) {
  document.getElementById("selection-screen").style.display = "none";
  document.getElementById("quantity-screen").style.display = "block";
  document.getElementById("selected-item-name").innerText = `${brand} ${variant}`;
  document.getElementById("quantity-input").value = 1;

  document.getElementById("add-to-cart").onclick = () => {
    const qty = parseInt(document.getElementById("quantity-input").value);
    cart.push({ category, brand, variant, price: item.price, qty });
    updateCart();
    document.getElementById("quantity-screen").style.display = "none";
    document.getElementById("selection-screen").style.display = "grid";
    goBack(); // back to item selection
  };
}

function updateCart() {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = `<h3>Cart</h3>`;
  let total = 0;
  for (const item of cart) {
    const subtotal = item.price * item.qty;
    total += subtotal;
    const div = document.createElement("div");
    div.textContent = `${item.brand} ${item.variant} x${item.qty} - ₱${subtotal}`;
    cartDiv.appendChild(div);
  }
  cartDiv.innerHTML += `<hr><strong>Total: ₱${total}</strong>`;
}

function goBack() {
  if (navigationStack.length > 0) {
    const previous = navigationStack.pop();
    previous();
  }
}

window.onload = async () => {
  await loadCashiers();
  const saved = localStorage.getItem("cashier");
  if (saved) {
    showPOS(JSON.parse(saved));
  } else {
    document.getElementById("login-screen").style.display = "flex";
  }
};

window.handleLogin = handleLogin;
window.changeCashier = changeCashier;
window.goBack = goBack;
