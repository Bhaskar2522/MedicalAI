// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const medicineGrid = document.getElementById('medicineGrid');

  // Get cards after DOM is loaded
  let cards = Array.from(document.querySelectorAll('.medicine-card'));

  // Filter functionality
  if (searchInput) {
searchInput.addEventListener('input', () => filterCards());
  }
  
  if (categoryFilter) {
categoryFilter.addEventListener('change', () => filterCards());
  }

function filterCards() {
  const searchValue = searchInput.value.toLowerCase();
  const categoryValue = categoryFilter.value;

  cards.forEach(card => {
    const name = card.querySelector('.medicine-name').textContent.toLowerCase();
    const category = card.dataset.category;

    if ((name.includes(searchValue) || searchValue === '') &&
        (category === categoryValue || categoryValue === 'all')) {
      card.style.display = 'block';
      setTimeout(() => card.style.opacity = 1, 50);
    } else {
      card.style.display = 'none';
      card.style.opacity = 0;
    }
  });
}

// Add to cart functionality for browsemedicines.html
  function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
      const card = button.closest('.medicine-card');
    
    if (!card) {
      console.error('Could not find medicine card');
      return;
    }
    
    const productName = card.querySelector('.medicine-name')?.textContent;
    const priceElement = card.querySelector('.price');
    
    if (!productName) {
      console.error('Could not find product name');
      return;
    }
    
    if (!priceElement) {
      console.error('Could not find price element');
      return;
    }
    
    let priceText = priceElement.textContent;
    // Extract price (remove currency symbols, discount text, and whitespace)
    // Handle formats like "₹50 -10%", "₹120", etc.
    const priceMatch = priceText.match(/[\d.]+/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
    
    if (price === 0) {
      console.error('Could not parse price from:', priceText);
      alert('Error: Could not determine price. Please try again.');
      return;
    }
      
      // Use the shared addToCart function if available, otherwise add directly
      if (typeof addToCart === 'function') {
        addToCart(productName, price);
      } else {
        // Fallback if cart.js is not loaded
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            name: productName,
            price: price,
            quantity: 1
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart badge if function exists
      if (typeof updateCartBadge === 'function') {
        updateCartBadge();
      }
      
        alert(`✅ Added ${productName} to your cart!`);
      }
  }

  // Note: cart.js (which loads before this file) handles .add-cart buttons
  // This is kept as a fallback in case cart.js fails to load
  if (typeof addToCart !== 'function') {
    // cart.js not loaded, attach our own handlers as fallback
    const addCartButtons = document.querySelectorAll('.add-cart');
    addCartButtons.forEach(button => {
      button.addEventListener('click', handleAddToCart);
  });
    console.log(`Fallback: Attached cart listeners to ${addCartButtons.length} buttons`);
  } else {
    console.log('Cart functionality handled by cart.js');
  }
});