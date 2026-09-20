// DOM References
const productContainer = document.getElementById("products");
const cartContainer = document.getElementById("cart");
const totalContainer = document.getElementById("total");
const cartSummary = document.getElementById("cart-summary");
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const addItemModal = document.getElementById("addItemModal");
const addItemForm = document.getElementById("addItemForm");
const addNewItemBtn = document.getElementById("addNewItemBtn");
const receiptModal = document.getElementById("receiptModal");
const receiptContainer = document.getElementById("receipt");
const customerModal = document.getElementById("customerModal");
const customerForm = document.getElementById("customerForm");
const ordersModal = document.getElementById("ordersModal");
const ordersList = document.getElementById("ordersList");
const ordersBtn = document.getElementById("ordersBtn");
const adminBtn = document.getElementById("adminBtn");
const searchInput = document.getElementById("searchInput");
const catalogStatus = document.getElementById("catalogStatus");
const categoryTabs = document.querySelector(".category-tabs");
const themeToggle = document.getElementById("themeToggle");

let activeCategory = "all";
let searchTerm = "";

// Admin session state
let isAdminLoggedIn = false;

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";
const ORDERS_STORAGE_KEY = "sariSariOrders";
const THEME_STORAGE_KEY = "sariSariTheme";

function applyTheme(theme) {
    const isNight = theme === "night";
    document.body.classList.toggle("night-mode", isNight);
    themeToggle.innerHTML = isNight
        ? '<span aria-hidden="true">☀️</span><span class="theme-toggle-label">Day</span>'
        : '<span aria-hidden="true">🌙</span><span class="theme-toggle-label">Night</span>';
    themeToggle.setAttribute("aria-label", isNight ? "Switch to day mode" : "Switch to night mode");
    themeToggle.title = isNight ? "Switch to day mode" : "Switch to night mode";
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains("night-mode") ? "day" : "night";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
}

// LocalStorage Functions
function saveProducts() {
    localStorage.setItem("sariSariProducts", JSON.stringify(products));
}

function loadProducts() {
    const saved = localStorage.getItem("sariSariProducts");
    if (saved) {
        return JSON.parse(saved);
    }
    return products;
}

function getCategoryIcon(category, productName = "") {
    const categoryText = `${category} ${productName}`.toLowerCase();

    if (/biscuit|cookie|cracker|wafer/.test(categoryText)) return "🍪";
    if (/bread|bakery|cake|pastry/.test(categoryText)) return "🍞";
    if (/drink|juice|soda|cola|water|beverage/.test(categoryText)) return "🥤";
    if (/snack|chip|candy|chocolate|popcorn/.test(categoryText)) return "🍿";
    if (/coffee|cafe|tea/.test(categoryText)) return "☕";
    if (/rice|grain|cereal|pasta|noodle|instant food|pantry/.test(categoryText)) return "🍜";
    if (/fruit|apple|banana|orange/.test(categoryText)) return "🍎";
    if (/vegetable|grocery|fresh/.test(categoryText)) return "🥬";
    if (/meat|chicken|fish|food/.test(categoryText)) return "🍗";
    if (/frozen|ice cream|cold/.test(categoryText)) return "❄️";
    if (/soap|clean|household/.test(categoryText)) return "🧼";
    if (/milk|dairy|cheese/.test(categoryText)) return "🥛";

    const categoryIcons = {
        Drinks: "🥤",
        Snacks: "🍿",
        "Instant food": "🍜",
        Coffee: "☕"
    };

    return categoryIcons[category] || "🛍";
}

function renderCategoryTabs() {
    const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

    if (activeCategory !== "all" && !categories.includes(activeCategory)) {
        activeCategory = "all";
    }

    categoryTabs.innerHTML = "";

    const allCategories = ["all", ...categories];
    allCategories.forEach(category => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `category-tab${activeCategory === category ? " active" : ""}`;
        button.innerHTML = `<span aria-hidden="true">${category === "all" ? "▦" : getCategoryIcon(category)}</span> ${category === "all" ? "All items" : category}`;
        button.addEventListener("click", () => filterProducts(category, button));
        categoryTabs.appendChild(button);
    });
}

// Display all products on the page
function displayProducts() {
    renderCategoryTabs();
    productContainer.innerHTML = "";

    const visibleProducts = products.filter(product => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    if (catalogStatus) {
        catalogStatus.textContent = `${visibleProducts.length} item${visibleProducts.length === 1 ? "" : "s"} showing`;
    }

    if (visibleProducts.length === 0) {
        productContainer.innerHTML = '<div class="empty-state product-empty-state">No products match your search.</div>';
        return;
    }

    visibleProducts.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";

        const deleteButton = isAdminLoggedIn ? `<button class="delete-btn" onclick="removeItem(${product.id})">Delete</button>` : "";

        const categoryIcon = getCategoryIcon(product.category, product.name);

        div.innerHTML = `
            <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="product-badge"><span aria-hidden="true">${categoryIcon}</span> ${product.category}</span>
            <h3>${product.name}</h3>
            <p class="price">₱${product.price}</p>
            <button class="add-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
            ${deleteButton}
        `;

        productContainer.appendChild(div);
    });
}

function handleSearch(event) {
    event.preventDefault();
    searchTerm = searchInput.value.trim().toLowerCase();
    displayProducts();
}

function filterProducts(category, button) {
    activeCategory = category;
    displayProducts();
}

// Render cart UI
function renderCart() {
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-state">Your cart is empty. Add a few essentials to get started.</div>';
        totalContainer.textContent = "₱0";
        cartSummary.textContent = "0 items selected";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <div class="cart-item-top">
                <span class="cart-item-name">${item.name}</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
            <div class="cart-item-price">₱${item.price * item.quantity}</div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        `;

        cartContainer.appendChild(div);
    });

    totalContainer.textContent = `₱${total}`;
    cartSummary.textContent = `${cart.reduce((sum, item) => sum + item.quantity, 0)} items selected`;
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add an item before checking out.");
        return;
    }

    customerModal.style.display = "block";
}

function completeCheckout(event) {
    event.preventDefault();

    const orderItems = cart.map(item => ({ ...item }));
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `RC-${Date.now().toString().slice(-6)}`;
    const orderDate = new Date().toLocaleString();
    const customer = {
        name: document.getElementById("customerName").value.trim(),
        contact: document.getElementById("customerContact").value.trim(),
        address: document.getElementById("customerAddress").value.trim()
    };
    const order = { orderNumber, orderDate, customer, items: orderItems, total };
    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    receiptContainer.innerHTML = `
        <div class="receipt-meta">
            <span>Order #${orderNumber}</span>
            <span>${orderDate}</span>
        </div>
        <div class="receipt-customer">
            <strong>${customer.name}</strong>
            <span>${customer.contact}</span>
            <span>${customer.address}</span>
        </div>
        <div class="receipt-items">
            ${orderItems.map(item => `
                <div class="receipt-item">
                    <span>${item.name} x${item.quantity}</span>
                    <strong>₱${item.price * item.quantity}</strong>
                </div>
            `).join("")}
        </div>
        <div class="receipt-total">
            <span>Total paid</span>
            <strong>₱${total}</strong>
        </div>
        <p class="receipt-thanks">Thank you for shopping at RC Sari-Sari Store!</p>
    `;

    cart.length = 0;
    renderCart();
    closeCustomerModal();
    receiptModal.style.display = "block";
}

function closeCustomerModal() {
    customerModal.style.display = "none";
    customerForm.reset();
}

function closeReceiptModal() {
    receiptModal.style.display = "none";
}

function printReceipt() {
    window.print();
}

// Admin Login Functions
function openLoginModal() {
    loginModal.style.display = "block";
}

adminBtn.addEventListener("click", openLoginModal);

function closeLoginModal() {
    loginModal.style.display = "none";
    loginForm.reset();
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        addNewItemBtn.style.display = "block";
        ordersBtn.style.display = "block";
        displayProducts();
        alert("Login successful!");
        closeLoginModal();
    } else {
        alert("Invalid username or password!");
        loginForm.reset();
    }
}

function openOrdersModal() {
    if (!isAdminLoggedIn) return;

    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    ordersList.innerHTML = orders.length === 0
        ? '<div class="empty-state">No customer orders yet.</div>'
        : orders.map(order => `
            <details class="order-card">
                <summary class="order-summary">${order.customer.name}</summary>
                <div class="order-details">
                    <div class="order-card-header">
                        <strong>Order #${order.orderNumber}</strong>
                        <span>${order.orderDate}</span>
                    </div>
                    <div class="order-customer">
                        <span>${order.customer.contact}</span>
                        <span>${order.customer.address}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `<div><span>${item.name} x${item.quantity}</span><strong>₱${item.price * item.quantity}</strong></div>`).join("")}
                    </div>
                    <div class="order-total"><span>Total</span><strong>₱${order.total}</strong></div>
                    <button class="delete-order-btn" type="button" onclick="deleteOrder('${order.orderNumber}')">Delete Customer Order</button>
                </div>
            </details>
        `).join("");

    ordersModal.style.display = "block";
}

function deleteOrder(orderNumber) {
    if (!isAdminLoggedIn) return;

    if (!confirm("Delete this customer order permanently?")) return;

    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    const remainingOrders = orders.filter(order => order.orderNumber !== orderNumber);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(remainingOrders));
    openOrdersModal();
}

function clearAllOrders() {
    if (!isAdminLoggedIn) return;

    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    if (orders.length === 0) return;

    if (!confirm("Delete all customer orders permanently?")) return;

    localStorage.removeItem(ORDERS_STORAGE_KEY);
    openOrdersModal();
}

function closeOrdersModal() {
    ordersModal.style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === addItemModal) {
        closeAddItemModal();
    }
    if (event.target === receiptModal) {
        closeReceiptModal();
    }
    if (event.target === customerModal) {
        closeCustomerModal();
    }
    if (event.target === ordersModal) {
        closeOrdersModal();
    }
}

// Add Item Functions
function openAddItemModal() {
    addItemModal.style.display = "block";
}

function closeAddItemModal() {
    addItemModal.style.display = "none";
    addItemForm.reset();
}

function handleAddItem(event) {
    event.preventDefault();

    const imageFile = document.getElementById("itemImage").files[0];
    
    if (!imageFile) {
        alert("Please select an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const newItem = {
            id: newId,
            name: document.getElementById("itemName").value,
            price: parseInt(document.getElementById("itemPrice").value),
            category: document.getElementById("itemCategory").value,
            image: e.target.result // Base64 encoded image
        };

        products.push(newItem);
        saveProducts();
        displayProducts();
        closeAddItemModal();
        alert(`Item "${newItem.name}" added successfully!`);
    };
    
    reader.readAsDataURL(imageFile);
}

// Remove Item Function
function removeItem(id) {
    const itemToRemove = products.find(p => p.id === id);
    if (confirm(`Are you sure you want to delete "${itemToRemove.name}"?`)) {
        products.splice(products.findIndex(p => p.id === id), 1);
        saveProducts();
        displayProducts();
        alert("Item deleted successfully!");
    }
}

// Initialize
const savedProducts = loadProducts();
if (savedProducts !== products) {
    products.splice(0, products.length, ...savedProducts);
}
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "day");
displayProducts();
renderCart();