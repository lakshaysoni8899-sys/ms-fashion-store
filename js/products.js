// Import Firebase core and Firestore database
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// We store the fetched products here so your Cart can access them later
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('product-grid');

    // Only run on pages with the product grid (e.g. index.html)
    if (!productGrid) return;

    async function loadProducts() {
        try {
            // Show loading text
            productGrid.innerHTML = '<h3 style="text-align: center; width: 100%; padding: 40px 0;">Loading latest collections...</h3>';

            // 1. Fetch from Firebase instead of localStorage
            const querySnapshot = await getDocs(collection(db, "products"));

            if (querySnapshot.empty) {
                productGrid.innerHTML = '<h3 style="text-align: center; width: 100%; padding: 40px 0;">New collections coming soon!</h3>';
                return;
            }

            allProducts = []; // Reset array

            // 2. Loop through Firebase data and format it
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                allProducts.push({
                    id: doc.id, // The unique Firebase ID
                    ...data
                });
            });

            // Clear loading text
            productGrid.innerHTML = '';

            // Generate dynamic HTML for each product
            // Reverse array so newest products show first
            const displayProducts = [...allProducts].reverse();

            displayProducts.forEach(product => {
                const isOutOfStock = product.inventoryStatus === "Out of Stock" || product.status === "Out of Stock";

                // Generate product card HTML
                const card = document.createElement('div');
                card.className = 'product-card';

                // Generate sizes HTML
                let sizesHtml = '<div class="product-sizes">';
                // Check if sizes is a string (from our old old code) or an array
                let sizesArray = [];
                if (Array.isArray(product.sizes)) {
                    sizesArray = product.sizes;
                } else if (typeof product.availableSizes === 'string') {
                    // Fallback if you saved sizes as a comma-separated string
                    sizesArray = product.availableSizes.split(',').map(s => s.trim());
                }

                if (sizesArray.length > 0 && sizesArray[0] !== "") {
                    sizesArray.forEach(size => {
                        sizesHtml += `<span class="size-badge">${size}</span>`;
                    });
                } else {
                    sizesHtml += `<span class="size-badge" style="visibility: hidden;">-</span>`;
                }
                sizesHtml += '</div>';

                // Out of stock overlay/badge HTML
                const badgeHtml = isOutOfStock
                    ? `<div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; font-weight: bold; z-index: 2;">SOLD OUT</div>`
                    : '';

                // Generate Carousel HTML
                // Ensure we have at least an empty array if no images exist
                let imagesArray = (product.images && product.images.length > 0) ? product.images : [];
                if (imagesArray.length === 0 && product.image) {
                    imagesArray = [product.image]; // Fallback to single image
                }
                if (imagesArray.length === 0) {
                    imagesArray = ["https://via.placeholder.com/400x500?text=No+Image"]; // Ultimate fallback
                }

                let carouselHtml = `<div class="product-carousel">`;
                imagesArray.forEach((imgSrc, index) => {
                    carouselHtml += `<img src="${imgSrc}" class="carousel-img ${index === 0 ? 'active' : ''}" ${isOutOfStock ? 'style="opacity: 0.6; filter: grayscale(50%);"' : ''}>`;
                });
                if (imagesArray.length > 1) {
                    carouselHtml += `
                        <button class="carousel-btn carousel-prev"><i class='bx bx-chevron-left'></i></button>
                        <button class="carousel-btn carousel-next"><i class='bx bx-chevron-right'></i></button>
                    `;
                }
                carouselHtml += `</div>`;

                // Handle Colors
                let colorHtml = '';
                let colorsArray = [];
                if (Array.isArray(product.colors)) {
                    colorsArray = product.colors;
                } else if (typeof product.availableColors === 'string') {
                    colorsArray = product.availableColors.split(',').map(c => c.trim());
                }

                if (colorsArray.length > 0 && colorsArray[0] !== "") {
                    colorHtml = `<select class="color-dropdown" style="margin-right: 10px;">`;
                    colorsArray.forEach(c => {
                        colorHtml += `<option value="${c}">${c}</option>`;
                    });
                    colorHtml += `</select>`;
                } else {
                    colorHtml = `<select class="color-dropdown" style="display:none;"><option value="Default">Default</option></select>`;
                }

                // Handle Size Dropdown for Cart
                let sizeSelectHtml = '';
                if (sizesArray.length > 0 && sizesArray[0] !== "") {
                    sizeSelectHtml = `<select class="size-dropdown">`;
                    sizesArray.forEach(s => {
                        sizeSelectHtml += `<option value="${s}">${s}</option>`;
                    });
                    sizeSelectHtml += `</select>`;
                } else {
                    sizeSelectHtml = `
                        <select class="size-dropdown">
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                    `;
                }

                card.innerHTML = `
                    <div class="product-image-wrapper">
                        ${badgeHtml}
                        ${carouselHtml}
                        <div class="product-actions">
                            <button class="action-btn"><i class='bx bx-heart'></i></button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="category">${product.category || 'New Arrival'}</span>
                        <h3 class="product-title">${product.title}</h3>
                        ${sizesHtml}
                        <div class="product-price">₹ ${product.price}</div>
                        ${colorHtml}${sizeSelectHtml}
                        <input type="number" class="qty-input" value="1" min="1" style="width: 50px; margin-left: 10px;">
                        <button class="btn btn-outline full-width mt-2 add-to-cart-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                            ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                `;

                productGrid.appendChild(card);
            });
        } catch (error) {
            console.error("Error loading products:", error);
            productGrid.innerHTML = "<h3 style='text-align: center; width: 100%; color: red; padding: 40px 0;'>Error connecting to store. Please check your internet.</h3>";
        }
    }

    // Initial load from Firebase
    await loadProducts();

    // Event delegation for Add to Cart
    productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn && !btn.disabled) {
            const productId = btn.getAttribute('data-id');

            // Read from our new allProducts array instead of localStorage
            const product = allProducts.find(p => p.id === productId);
            if (product && window.addToCart) {
                const productCard = e.target.closest('.product-card');

                const size = productCard.querySelector('.size-dropdown')?.value || 'M';
                const qty = parseInt(productCard.querySelector('.qty-input')?.value) || 1;
                const color = productCard.querySelector('.color-dropdown')?.value || 'Standard';

                console.log("Captured for Cart:", { size, qty, color });

                window.addToCart(product, size, color, qty);
            }
        }

        // Handle Carousel Navigation
        const prevBtn = e.target.closest('.carousel-prev');
        const nextBtn = e.target.closest('.carousel-next');

        if (prevBtn || nextBtn) {
            const carousel = e.target.closest('.product-carousel');
            const images = carousel.querySelectorAll('.carousel-img');
            if (images.length <= 1) return;

            let currentIndex = 0;
            images.forEach((img, index) => {
                if (img.classList.contains('active')) {
                    currentIndex = index;
                    img.classList.remove('active');
                }
            });

            if (nextBtn) {
                currentIndex = (currentIndex + 1) % images.length;
            } else {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
            }

            images[currentIndex].classList.add('active');
        }
    });
});