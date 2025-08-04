let cashier = JSON.parse(localStorage.getItem("currentCashier"));
document.getElementById("cashier-name").innerText = cashier.name;

let currentView = "categories";
let currentCategory = "";
let currentBrand = "";
let currentItem = null;

fetch('items.json')
  .then(res => res.json())
  .then(data => {
    setupCategories(data);
  });

function setupCategories(data) {
  const screen = document.getElementById("selection-screen");
  screen.innerHTML = "<h2>Select Category</h2>";
  currentView = "categories";

  const categories = Object.keys(data);
  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-box";
    div.innerHTML = `<img src="images/${cat.toLowerCase()}.png" style="max-width: 100%; height: 50px;"><br>${cat}`;
    div.onclick = () => showBrands(cat, data[cat]);
    screen.appendChild(div);
  });
}

function showBrands(category, brands) {
  const screen = document.getElementById("selection-screen");
  screen.innerHTML = `<h2>${category} - Select Brand</h2>`;
  currentView = "brands";
  currentCategory = category;

  Object.keys(brands).forEach(brand => {
    const div = document.createElement("div");
    div.className = "category-box";
    div.innerHTML = `<img src="images/${brand.toLowerCase()}.png" style="max-width: 100%; height: 50px;"><br>${brand}`;
    div.onclick = () => showItems(brand, brands[brand]);
    screen.appendChild(div);
  });
}

function showItems(brand, items) {
  const screen = document.getElementById("selection-screen");
  screen.innerHTML = `<h2>${brand} - Select Item</h2>`;
  currentView = "items";
  currentBrand = brand;

  items.forEach(item => {
    const div = document.createElement("div");
    const colorClass = getColorClass(item.name);
    div.className = `category-box ${colorClass}`;
    div.innerHTML = `<strong>${item.name}</strong><br>₱${item.price} ${item.unit}`;
    div.onclick = () => showQuantityInput(item);
    screen.appendChild(div);
  });
}

function showQuantityInput(item) {
  currentItem = item;
  const screen = document.getElementById("selection-screen");
  screen.innerHTML = `
    <h2>Enter Quantity</h2>
    <div class="category-box">
      <strong>${item.name}</strong><br>₱${item.price} ${item.unit}
    </div>
    <input id="quantity-input" type="number" min="1" placeholder="Quantity" style="width: 100%; font-size: 1.5em; padding: 10px; margin: 10px 0;">
    <button onclick="addToCart()" style="width: 100%; font-size: 1.5em;">Add to Cart</button>
  `;
}

function addToCart() {
  const qty = parseInt(document.getElementById("quantity-input").value);
  if (!qty || qty < 1) {
    alert("Enter valid quantity");
    return;
  }

  const cart = document.getElementById("cart");
  const item = currentItem;
  const line = document.createElement("div");
  line.innerText = `${item.name} x${qty} = ₱${item.price * qty}`;
  cart.appendChild(line);

  // Reset view
  showItems(currentBrand, JSON.parse(localStorage.getItem("itemData"))[currentCategory][currentBrand]);
}

function getColorClass(name) {
  name = name.toLowerCase();
  if (name.includes("red")) return "variant-red";
  if (name.includes("blue")) return "variant-blue";
  if (name.includes("black")) return "variant-black";
  if (name.includes("green")) return "variant-green";
  if (name.includes("burst") || name.includes("yellow")) return "variant-yellow";
  return "";
}
