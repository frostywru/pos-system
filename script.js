let data;

fetch('cigarette-categories.json')
  .then(res => res.json())
  .then(json => {
    data = json.categories;
    showCategories();
  });

function showCategories() {
  const categoriesDiv = document.getElementById("categories");
  categoriesDiv.innerHTML = "";
  for (const categoryName in data) {
    const btn = document.createElement("button");
    btn.innerText = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    btn.onclick = () => showBrands(data[categoryName]);
    categoriesDiv.appendChild(btn);
  }
}

function showBrands(categoryData) {
  document.getElementById("category-screen").style.display = "none";
  document.getElementById("brand-screen").style.display = "block";

  const brandsDiv = document.getElementById("brands");
  brandsDiv.innerHTML = "";

  for (const brand in categoryData) {
    if (brand.startsWith("_")) continue;
    const btn = document.createElement("button");
    btn.innerText = brand;
    btn.onclick = () => showVariants(categoryData[brand]);
    brandsDiv.appendChild(btn);
  }
}

function showVariants(brandData) {
  document.getElementById("brand-screen").style.display = "none";
  document.getElementById("variant-screen").style.display = "block";

  const variantsDiv = document.getElementById("variants");
  variantsDiv.innerHTML = "";

  for (const variant in brandData) {
    if (variant.startsWith("_")) continue;
    const info = brandData[variant];
    const btn = document.createElement("button");
    btn.innerText = `${variant} - ₱${info.price}/${info.unit}`;
    btn.onclick = () => alert(`Added: ${variant} (${info.unit}) - ₱${info.price}`);
    variantsDiv.appendChild(btn);
  }
}
