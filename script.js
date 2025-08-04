// script.js
import {
  db,
  ref,
  get,
  child,
  update,
  push,
  runTransaction
} from "./firebase.js";

// UI Elements
const grid = document.getElementById("grid");
const title = document.getElementById("section-title");
const backBtn = document.getElementById("backBtn");
const posSection = document.getElementById("pos-section");
const loginSection = document.getElementById("login-section");
const loginError = document.getElementById("login-error");

let currentPath = [];
let currentCashier = null;
let cart = [];

// 1. LOGIN
window.login = async function () {
  const pin = document.getElementById("pin-input").value.trim();
  loginError.textContent = "";
  try {
    const snap = await get(ref(db, "cashiers"));
    const cashiers = snap.val() || {};
    for (const key in cashiers) {
      if (cashiers[key].pin === pin) {
        currentCashier = cashiers[key].name;
        loginSection.style.display = "none";
        posSection.style.display = "block";
        loadCategories();
        return;
      }
    }
    loginError.textContent = "Invalid PIN";
  } catch (err) {
    loginError.textContent = "Network error, try again.";
  }
};

// 2. NAVIGATION
async function loadCategories() {
  currentPath = [];
  title.textContent = "Select Category";
  backBtn.style.display = "none";
  const snap = await get(ref(db, "products"));
  renderGrid(snap.val(), (cat) => loadBrands(cat));
}

async function loadBrands(category) {
  currentPath = [category];
  title.textContent = category;
  backBtn.style.display = "inline-block";
  const snap = await get(
    child(ref(db), `products/${category}/brands`)
  );
  renderGrid(snap.val(), (brand) =>
    loadItems(category, brand)
  );
}

async function loadItems(category, brand) {
  currentPath = [category, brand];
  title.textContent = brand;
  backBtn.style.display = "inline-block";
  const snap = await get(
    child(
      ref(db),
      `products/${category}/brands/${brand}/items`
    )
  );
  renderGrid(snap.val(), (itemName) =>
    promptQuantity(category, brand, itemName)
  );
}

window.goBack = function () {
  if (currentPath.length === 2)
    loadBrands(currentPath[0]);
  else if (currentPath.length === 1)
    loadCategories();
};

// 3. GRID RENDERER
function renderGrid(obj, onClickFactory) {
  grid.innerHTML = "";
  for (const key in obj) {
    const value = obj[key];
    const img = value.image || null;
    const color = value.color || "#eee";
    const div = document.createElement("div");
    div.className = "grid-item";
    div.style.backgroundColor = !img ? color : "";
    if (img) {
      const i = document.createElement("img");
      i.src = img;
      div.appendChild(i);
    }
    const p = document.createElement("p");
    p.textContent = key;
    div.appendChild(p);
    div.onclick = () => onClickFactory(key);
    grid.appendChild(div);
  }
}

// 4. ADD TO CART
async function promptQuantity(cat, brand, itemName) {
  const itemSnap = await get(
    child(
      ref(db),
      `products/${cat}/brands/${brand}/items/${itemName}`
    )
  );
  const item = itemSnap.val();
  const qty = parseInt(
    prompt(`Qty of ${brand} ${itemName}:`),
    10
  );
  if (!qty || qty <= 0) return;
  cart.push({
    cat,
    brand,
    itemName,
    unit: item.unit,
    price: item.price,
    qty
  });
  const lineTotal = item.price * qty;
  alert(
    `Added ${qty} × ${brand} ${itemName}\nSubtotal: ₱${lineTotal}`
  );
  renderCartSummary();
}

// 5. CART & CHECKOUT UI
function renderCartSummary() {
  const total = cart.reduce(
    (sum, x) => sum + x.price * x.qty,
    0
  );
  title.textContent = `Cart Total: ₱${total}`;
}

// 6. FINALIZE TRANSACTION
async function checkout() {
  if (!cart.length) return alert("Cart is empty.");
  const total = cart.reduce(
    (sum, x) => sum + x.price * x.qty,
    0
  );
  const paid = parseFloat(
    prompt(`Total ₱${total}\nAmount paid:`)
  );
  if (isNaN(paid) || paid < total)
    return alert("Insufficient amount.");

  // 6.1 Log sale
  await push(ref(db, "logs"), {
    cashier: currentCashier,
    timestamp: Date.now(),
    items: cart,
    total,
    paid,
    change: paid - total
  });

  // 6.2 Decrement inventory
  cart.forEach(({ cat, brand, itemName, qty }) => {
    const stockRef = ref(
      db,
      `products/${cat}/brands/${brand}/items/${itemName}/stock`
    );
    runTransaction(stockRef, (curr) =>
      curr != null ? curr - qty : curr
    );
  });

  alert(`Change: ₱${paid - total}\nThank you!`);
  cart = [];
  renderCartSummary();
  loadCategories();
}

// 7. ATTACH CHECKOUT BUTTON
const checkoutBtn = document.createElement("button");
checkoutBtn.textContent = "Checkout";
checkoutBtn.onclick = checkout;
posSection.appendChild(checkoutBtn);
