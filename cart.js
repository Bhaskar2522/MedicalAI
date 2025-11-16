// Shared cart functionality for all pages
// This file handles add-to-cart functionality and cart badge updates

// Function to add item to cart
function addToCart(productName, price) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        // Increment quantity if item exists
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            name: productName,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge();
    
    // Show success message
    alert(`✅ Added ${productName} to your cart!`);
}

// Function to update cart badge count
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find all cart buttons on the page
    const cartButtons = document.querySelectorAll('.cart-btn');
    
    cartButtons.forEach(cartBtn => {
        // Remove existing badge if any
        let existingBadge = cartBtn.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add badge if there are items
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = totalItems;
            cartBtn.appendChild(badge);
        }
    });
}

// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Handle add-to-cart-btn buttons (used in index.html and category pages)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productName = button.getAttribute('data-product-name');
            const price = button.getAttribute('data-price');
            if (productName && price) {
                addToCart(productName, price);
            }
        });
    });
    
    // Handle add-cart buttons (used in browsemedicines.html)
    document.querySelectorAll('.add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = button.closest('.medicine-card');
            if (!card) return;
            
            const productName = card.querySelector('.medicine-name')?.textContent;
            const priceElement = card.querySelector('.price');
            
            if (!productName || !priceElement) return;
            
            let priceText = priceElement.textContent;
            // Extract price (remove currency symbols, discount text, and whitespace)
            const priceMatch = priceText.match(/[\d.]+/);
            const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
            
            if (price > 0) {
                addToCart(productName, price);
            }
        });
    });
    
    // Update cart badge on page load
    updateCartBadge();
});


