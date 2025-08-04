// script.js

import {
  db,
  ref,
  get,
  child,
  push,
  runTransaction
} from "./firebase.js";

// MAIN UI ELEMENTS
const grid          = document.getElementById("grid");
const title         = document.getElementById("section-title");
const backBtn       = document.getElementById("backBtn");
const posSection    = document.getElementById("pos-section");
const loginSection  = document.getElementById("login-section");
const loginError    = document.getElementById("login-error");
const cashierNameEl = document.getElementById("cashier-name");
const cartTotalEl   = document.getElementById("cart-total");

let currentPath    = [];
let currentCashier = null;
let cart           = [];

// CIGARETTE-MODAL ELEMENTS
const brandSelect   = document.getElementById("brandSelect");
const variantSelect = document.getElementById("variantSelect");
const unitContainer = document.getElementById("unitContainer");
const unitStick     = document.getElementById("unitStick");
const unitPack      = document.getElementById("unitPack");
const quantityInput = document.getElementById("quantityInput");
const cigaretteForm = document.getElementById("cigaretteForm");

/**
 *  Initialize the cigarette modal:
 *   - Load brands from Firebase
 *   - Populate variants (skipping the “Pack” entry)
 *   - Enforce Winston-only-pack
 *   - Handle Marlboro pack discount on submit
 */
function initCigaretteModal() {
  // 1) Load brands
  get(ref(db, "products/Cigarettes/brands")).then(snap => {
    const brands = snap.val() || {};
    brandSelect.innerHTML = "";
    Object.keys(brands).forEach(brand => {
      const opt = document.createElement("option");
      opt.value = brand;
      opt.textContent = brand;
      brandSelect.appendChild(opt);
    });
    // fire off first variant load
    brandSelect.dispatchEvent(new Event("change"));
  });

  // 2) On brand change: load variants (filter out “Pack”)
  brandSelect.addEventListener("change", () => {
    const brand = brandSelect.value;
    get(child(ref(db), `products/Cigarettes/brands/${brand}/items`))
      .then(snap => {
        const items = snap.val() || {};
        variantSelect.innerHTML = "";
        Object.keys(items)
          .filter(v => v !== "Pack")
          .forEach(variant => {
            const opt = document.createElement("option");
            opt.value = variant;
            opt.textContent = variant;
            variantSelect.appendChild(opt);
          });
        // reset unit toggle
        unitContainer.style.display = "block";
        unitStick.checked = true;
        // enforce any variant rule
        variantSelect.dispatchEvent(new Event("change"));
      });
  });

  // 3) On variant change: Winston Mint Burst → pack only
  variantSelect.addEventListener("change", () => {
    const brand   = brandSelect.value;
    const variant = variantSelect.value;
    if (brand === "Winston" && variant === "Mint Burst") {
      unitContainer.style.display = "none";
      unitPack.checked = true;
    } else {
      unitContainer.style.display = "block";
    }
  });

  // 4) On form submit: apply Marlboro pack discount + push to cart
  cigaretteForm.addEventListener("submit", e => {
    e.preventDefault();
    const brand   = brandSelect.value;
    const variant = variantSelect.value;
    // stick vs pack
    let unit = (brand === "Winston" && variant === "Mint Burst")
               ? "pack"
               : document.querySelector('input[name="unit"]:checked').value;

    // fetch official price from Firebase
    get(child(ref(db), `products/Cigarettes/brands/${brand}/items/${variant}`))
      .then(itemSnap => {
        let { price } = itemSnap.val();

        // Marlboro discounted 190/pack
        if (brand === "Marlboro" && unit === "pack") {
          price = 190;
        }

        const qty   = parseInt(quantityInput.value, 10);
        cart.push({ category: "Cigarettes", brand, variant, unit, price, qty });
        alert(
          `Added ${qty} ${unit}(s) of ${brand} ${variant}\n` +
          `Subtotal: ₱${(price * qty).toFixed(2)}`
        );
        renderCartSummary();
        // hide bootstrap modal
        bootstrap.Modal.getInstance(
          document.getElementById("cigaretteModal")
        ).hide();
      });
  });
}

// 1. LOGIN
async function login() {
  const pin = document.getElementById("pin-input").value.trim();
  loginError.textContent = "";
  try {
    const snap     = await get(ref(db, "cashiers"));
    const cashiers = snap.val() || {};
    for (const key in cashiers) {
      if (cashiers[key].pin === pin) {
        currentCashier            = cashiers[key].name;
        cashierNameEl.textContent = `Cashier: ${currentCashier}`;
        loginSection.classList.add("d-none");
        posSection.classList.remove("d-none");
        loadCategories();
        return;
      }
    }
    loginError.textContent = "Invalid PIN";
  } catch {
    loginError.textContent = "Network error, try again.";
  }
}

// 2. CHANGE CASHIER
function changeCashier() {
  currentCashier = null;
  cart           = [];
  title.textContent = "";
  grid.innerHTML    = "";
  posSection.classList.add("d-none");
  loginSection.classList.remove("d-none");
  document.getElementById("pin-input").value = "";
  renderCartSummary();
}

// 3. NAVIGATION
async function loadCategories() {
  currentPath = [];
  title.textContent = "Select Category";
  backBtn.style.display = "none";
  const snap = await get(ref(db, "products"));
  renderGrid(snap.val(), cat => loadBrands(cat));
}

async function loadBrands(category) {
  currentPath = [category];
  title.textContent = category;
  backBtn.style.display = "inline-block";
  const snap = await get(child(ref(db), `products/${category}/brands`));
  renderGrid(snap.val(), brand => loadItems(category, brand));
}

async function loadItems(category, brand) {
  currentPath = [category, brand];
  title.textContent = brand;
  backBtn.style.display = "inline-block";
  const snap = await get(child(ref(db), `products/${category}/brands/${brand}/items`));
  renderGrid(
    snap.val(),
    itemName => {
      if (category === "Cigarettes") {
        showCigaretteModal(category, brand, itemName);
      } else {
        showQuantityModal(category, brand, itemName);
      }
    }
  );
}

function goBack() {
  if (currentPath.length === 2) loadBrands(currentPath[0]);
  else if (currentPath.length === 1) loadCategories();
}

// 4. GRID RENDERER
function renderGrid(obj, onClick) {
  grid.innerHTML = "";
  const keys = Object.keys(obj);
  while (keys.length < 16) keys.push(null);

  keys.forEach(key => {
    const div = document.createElement("div");
    div.className = "grid-item";
    if (key) {
      const data = obj[key];
      div.style.backgroundColor = data.image ? "" : (data.color || "#eee");
      if (data.image) {
        const img = document.createElement("img");
        img.src = data.image;
        div.appendChild(img);
      }
      const p = document.createElement("p");
      p.textContent = key;
      div.appendChild(p);
      div.onclick = () => onClick(key);
    } else {
      div.style.visibility = "hidden";
    }
    grid.appendChild(div);
  });
}

// 5. SHOW CIGARETTE MODAL
function showCigaretteModal(cat, brand, variant) {
  // pre-select brand → triggers variant list
  brandSelect.value = brand;
  brandSelect.dispatchEvent(new Event("change"));

  // once variants loaded, pick yours + enforce rules
  variantSelect.value = variant;
  variantSelect.dispatchEvent(new Event("change"));

  // reset qty/unit
  quantityInput.value = 1;
  unitStick.checked   = true;

  // show Bootstrap modal
  new bootstrap.Modal(
    document.getElementById("cigaretteModal")
  ).show();
}

// 6. QUANTITY MODAL (non-cigarettes)
function showQuantityModal(cat, brand, itemName) {
  get(child(ref(db), `products/${cat}/brands/${brand}/items/${itemName}`)).then(snap => {
    const item = snap.val();
    // your old overlay logic goes here…
  });
}

// 7. CART SUMMARY
function renderCartSummary() {
  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);
  cartTotalEl.textContent = `₱${total.toFixed(2)}`;
}

// 8. CHECKOUT & LOG
async function checkout() {
  if (!cart.length) { alert("Cart is empty."); return; }
  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);
  const paid  = parseFloat(prompt(`Total ₱${total.toFixed(2)}\nAmount paid:`));
  if (isNaN(paid) || paid < total) { alert("Insufficient amount."); return; }

  // log sale
  await push(ref(db, "logs"), {
    cashier: currentCashier,
    timestamp: Date.now(),
    items: cart,
    total, paid, change: paid - total
  });

  // decrement stock
  cart.forEach(({ category, brand, itemName, qty }) => {
    const stockRef = ref(db, `products/${category}/brands/${brand}/items/${itemName}/stock`);
    runTransaction(stockRef, curr => (curr != null ? curr - qty : curr));
  });

  alert(`Change: ₱${(paid - total).toFixed(2)}\nThank you!`);
  cart = [];
  renderCartSummary();
  loadCategories();
}

// 9. INITIALIZE
renderCartSummary();
initCigaretteModal();

// 10. EXPOSE FOR INLINE ONCLICK
window.login         = login;
window.changeCashier = changeCashier;
window.goBack        = goBack;
window.checkout      = checkout;
