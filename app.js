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

// Admin session state
let isAdminLoggedIn = false;

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";

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

// Display all products on the page
function displayProducts() {
    productContainer.innerHTML = "";

    products.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";

        const deleteButton = isAdminLoggedIn ? `<button class="delete-btn" onclick="removeItem(${product.id})">Delete</button>` : "";

        div.innerHTML = `
            <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="product-badge">${product.category}</span>
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

// Admin Login Functions
function openLoginModal() {
    loginModal.style.display = "block";
}

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
        displayProducts();
        alert("Login successful!");
        closeLoginModal();
    } else {
        alert("Invalid username or password!");
        loginForm.reset();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === addItemModal) {
        closeAddItemModal();
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
displayProducts();
renderCart();