// Initialize cart from the browser's memory, or start with an empty cart
let cart = JSON.parse(localStorage.getItem('ms_fashion_cart')) || [];

// Grab the HTML elements we need to update
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountElements = document.querySelectorAll('.cart-count');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const cartShippingElement = document.getElementById('cart-shipping');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartIcons = document.querySelectorAll('.cart-icon');
const checkoutBtn = document.getElementById('checkout-btn');

// --- 1. Add to Cart (Triggered from products.js) ---
window.addToCart = function (product, size, color, qty) {
    // Check if this exact Kurti (same ID, size, and color) is already in the cart
    const existingItemIndex = cart.findIndex(item =>
        item.id === product.id && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
        // If it's already there, just add to the quantity
        cart[existingItemIndex].qty += qty;
    } else {
        // If it's a new item, add the full details to the cart
        cart.push({
            id: product.id,
            title: product.title,
            price: parseFloat(product.price),
            image: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150',
            size: size,
            color: color,
            qty: qty
        });
    }

    saveCart();
    updateCartUI();
    openCartDrawer();
};

// --- 2. Remove an Item ---
window.removeFromCart = function (index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

// --- 3. Change Quantity (+ / - buttons) ---
window.updateQuantity = function (index, newQty) {
    if (newQty < 1) return; // Don't let them go below 1
    cart[index].qty = newQty;
    saveCart();
    updateCartUI();
};

// --- 4. Save to Browser Memory ---
function saveCart() {
    localStorage.setItem('ms_fashion_cart', JSON.stringify(cart));
}

// --- 5. Update the Screen (Totals, Badges, HTML) ---
function updateCartUI() {
    cartItemsContainer.innerHTML = ''; // Clear out the old list

    let subtotal = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 30px 20px; color: #777;">Your cart is currently empty.</p>';
    } else {
        // Build the HTML for each item sitting in the cart
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            totalItems += item.qty;

            cartItemsContainer.innerHTML += `
                <div class="cart-item" style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 100px; object-fit: cover; border-radius: 8px;">
                    <div class="item-details" style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; font-size: 1rem; color: #333;">${item.title}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: #666;">Size: ${item.size} | Color: ${item.color}</p>
                        <p style="margin: 5px 0; font-weight: bold; color: #800000;">₹${item.price}</p>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                            <div style="display: flex; align-items: center; border: 1px solid #ccc; border-radius: 4px;">
                                <button onclick="updateQuantity(${index}, ${item.qty - 1})" style="border: none; background: #f9f9f9; padding: 5px 10px; cursor: pointer;">-</button>
                                <span style="padding: 0 10px; font-size: 0.9rem;">${item.qty}</span>
                                <button onclick="updateQuantity(${index}, ${item.qty + 1})" style="border: none; background: #f9f9f9; padding: 5px 10px; cursor: pointer;">+</button>
                            </div>
                            <button onclick="removeFromCart(${index})" style="border: none; background: none; color: red; cursor: pointer; font-size: 1.2rem;"><i class='bx bx-trash'></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Update Prices (Adding flat ₹99 shipping rate if cart has items)
    const shipping = subtotal > 0 ? 99 : 0;
    const finalTotal = subtotal + shipping;

    if (cartSubtotalElement) cartSubtotalElement.innerText = `₹ ${subtotal}`;
    if (cartShippingElement) cartShippingElement.innerText = subtotal > 0 ? `₹ ${shipping}` : `₹ 0`;
    if (cartTotalPriceElement) cartTotalPriceElement.innerText = `₹ ${finalTotal}`;

    // Update Notification Badges on the Shopping Bag icon
    cartCountElements.forEach(el => el.innerText = totalItems);
}

// --- 6. Open / Close Drawer Animations ---
function openCartDrawer() {
    cartDrawer.style.right = '0'; // Slide in
    cartDrawer.style.boxShadow = '-5px 0 15px rgba(0,0,0,0.1)';
}

function closeCartDrawer() {
    cartDrawer.style.right = '-400px'; // Slide out
}

// Connect the close button and bag icons
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

cartIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
    });
});

// --- 7. Checkout to WhatsApp ---
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Build the text message
        let message = "Hello MS Fashion! I would like to place an order:%0A%0A";

        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.title} (Size: ${item.size}, Color: ${item.color}) - Qty: ${item.qty} - ₹${item.price * item.qty}%0A`;
        });

        const finalTotal = cartTotalPriceElement.innerText;
        message += `%0A*Total Amount: ${finalTotal}* (including shipping)%0A%0APlease let me know how to proceed with the payment.`;

        // REPLACE THIS NUMBER WITH YOUR REAL BUSINESS WHATSAPP NUMBER (including country code, e.g., 91 for India)
        const whatsappNumber = "919876543210";

        // Open WhatsApp in a new tab!
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    });
}

// Run this once when the page loads to show any saved items
updateCartUI();