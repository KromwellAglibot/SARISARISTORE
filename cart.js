const cart = [];

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    renderCart();
}

function updateQuantity(id, change) {
    const item = cart.find(entry => entry.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        const index = cart.findIndex(entry => entry.id === id);
        cart.splice(index, 1);
    }

    renderCart();
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart.splice(index, 1);
    }
    renderCart();
}
