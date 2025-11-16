// small helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// set year
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle: toggles `body.dark`. Persist in localStorage.
const themeBtn = $('#themeToggle');
const saved = localStorage.getItem('site-theme');
if (saved === 'dark') document.body.classList.add('dark');

function updateThemeUI(){
  const isDark = document.body.classList.contains('dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
}
updateThemeUI();

themeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('site-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeUI();
});

// Chat modal controls
const chatModal = $('#chatModal');
const openBtns = [$('#openChatBtn'), $('#startConsultBtn'), $('#learnMoreChat')].filter(Boolean);
const closeChat = $('#closeChatBtn');

openBtns.forEach(b => b.addEventListener('click', openChat));
closeChat.addEventListener('click', () => { closeChatModal(); });

function openChat(){
  chatModal.classList.add('open');
  chatModal.setAttribute('aria-hidden','false');
  // reset chat body to initial state each open
  const body = $('#chatBody');
  body.innerHTML = `
    <div class="bot-message">⚠️ <strong>Important:</strong> This is not medical advice. Always consult a healthcare professional.</div>
    <div class="bot-message">What symptoms are you experiencing? Please select one below.</div>
    <div class="options-row" id="symptomOptions">
      <button class="chip" data-symptom="Headache">Headache</button>
      <button class="chip" data-symptom="Fever">Fever</button>
      <button class="chip" data-symptom="Cough">Cough</button>
      <button class="chip" data-symptom="Stomach Pain">Stomach Pain</button>
      <button class="chip" data-symptom="Allergy">Allergy Symptoms</button>
    </div>`;
  wireChips();
}

function closeChatModal(){
  chatModal.classList.remove('open');
  chatModal.setAttribute('aria-hidden','true');
}

// Wire symptom chips to start a simple flow
function wireChips(){
  const chips = $$('#symptomOptions .chip');
  chips.forEach(ch => ch.addEventListener('click', handleSymptom));
}

function appendMsg(text, cls='bot-message'){
  const body = $('#chatBody');
  const el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function handleSymptom(e){
  const s = e.currentTarget.getAttribute('data-symptom');
  appendMsg(s, 'user-message');

  // remove options
  const options = $('#symptomOptions');
  if (options) options.remove();

  if (s === 'Fever'){
    appendMsg("I understand you're experiencing fever. Let me ask a few questions to better understand your condition.");
    setTimeout(()=> {
      appendMsg("What is your temperature?");
      const body = $('#chatBody');
      const tempDiv = document.createElement('div');
      tempDiv.className = 'options-row';
      tempDiv.innerHTML = `
        <button class="chip" data-temp="Below 100°F">Below 100°F</button>
        <button class="chip" data-temp="100-102°F">100-102°F</button>
        <button class="chip" data-temp="Above 102°F">Above 102°F</button>
      `;
      body.appendChild(tempDiv);
      body.scrollTop = body.scrollHeight;
      Array.from(tempDiv.querySelectorAll('.chip')).forEach(c => c.addEventListener('click', handleTemp));
    }, 700);
  } else {
    appendMsg(`You selected ${s}. For mild symptoms you can try rest, hydration, and OTC remedies. If symptoms persist, please consult a doctor.`, 'bot-message');
    // end: show restart option
    setTimeout(()=> showRestart(), 800);
  }
}

function handleTemp(e){
  const t = e.currentTarget.getAttribute('data-temp');
  appendMsg(t, 'user-message');

  appendMsg(`You selected ${t}. For temperatures ${t === 'Below 100°F' ? 'below 100°F, monitor and rest' : t === '100-102°F' ? 'use antipyretics such as paracetamol and see if it improves' : 'above 102°F, please seek medical attention promptly'}.`, 'bot-message');

  setTimeout(()=> showRestart(), 700);
}

function showRestart(){
  const body = $('#chatBody');
  const restart = document.createElement('div');
  restart.className = 'options-row';
  restart.style.marginTop = '12px';
  restart.innerHTML = `<button class="chip" id="restartBtn">Start Over</button> <button class="chip" id="closeBtn">Close</button>`;
  body.appendChild(restart);
  body.scrollTop = body.scrollHeight;
  $('#restartBtn').addEventListener('click', openChat);
  $('#closeBtn').addEventListener('click', closeChatModal);
}

// Accessibility: close chat on escape
document.addEventListener('keydown', (e)=> {
  if (e.key === 'Escape' && chatModal.classList.contains('open')) closeChatModal();
});


// Collapsible Card Logic
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    const header = card.querySelector('.card-header');
    const body = card.querySelector('.card-body');

    header.addEventListener('click', () => {
        const isActive = card.classList.contains('active');

        // Close all cards
        cards.forEach(c => {
            c.classList.remove('active');
            c.querySelector('.card-body').style.display = 'none';
        });

        // Toggle current card
        if (!isActive) {
            card.classList.add('active');
            body.style.display = 'block';
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Function to filter products based on search term and active category
    const filterProducts = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');

        productCards.forEach(card => {
            const cardName = card.getAttribute('data-name').toLowerCase();
            const cardCategory = card.getAttribute('data-category').toLowerCase();
            const cardDescription = card.querySelector('.product-description').textContent.toLowerCase();

            // 1. Check Category Match
            const categoryMatch = (activeCategory === 'all' || cardCategory === activeCategory);

            // 2. Check Search Match
            const searchMatch = (
                cardName.includes(searchTerm) ||
                cardCategory.includes(searchTerm) ||
                cardDescription.includes(searchTerm)
            );

            // Show or hide the card
            if (categoryMatch && searchMatch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    // --- Event Listeners ---

    // 1. Search Input Listener
    searchInput.addEventListener('input', filterProducts);

    // 2. Category Button Listener
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove 'active' class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add 'active' class to the clicked button
            button.classList.add('active');
            
            // Apply the new filter
            filterProducts();
        });
    });

    // Note: Add to Cart functionality is handled by cart.js
});

document.addEventListener('DOMContentLoaded', () => {
    const viewAllBtn = document.querySelector('.view-all-reviews-btn');

    viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        alert('Navigating to the full Reviews Page!'); // Placeholder action
        // In a real app, this would navigate to a dedicated reviews page
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    const submitBtn = document.querySelector('.submit-btn');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual form submission for this example

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate network request delay
        setTimeout(() => {
            // Check if form fields are valid (since we use 'required' in HTML, this is mostly for server simulation)
            const isValid = contactForm.checkValidity();

            if (isValid) {
                // Success feedback
                alert('Thank you! Your message has been sent successfully. We will respond within 24 hours.');
                
                // Clear the form
                contactForm.reset(); 
            } else {
                // Failure feedback (should ideally not happen if 'required' attributes are used)
                alert('Please ensure all fields are filled out correctly.');
            }

            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }, 1500); // 1.5 second delay
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const subscribeForm = document.querySelector('.subscribe-form');
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent page reload

            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Basic email validation check (browser handles most of it due to 'required' attribute)
            if (!emailInput.value || !emailInput.checkValidity()) {
                alert('Please enter a valid email address.');
                return;
            }

            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Joining...';

            // Simulate server-side subscription process
            setTimeout(() => {
                alert(`Success! You are now subscribed with: ${emailInput.value}`);
                
                // Reset state
                emailInput.value = '';
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
            }, 1000); // 1 second delay simulation
        });
    }
});