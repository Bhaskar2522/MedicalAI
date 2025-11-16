# MED-AI Healthcare Website - Quick Prompt

## Project Description

**MED-AI** is a comprehensive healthcare web application featuring an AI-powered symptom checker, medicine recommendations, and an online pharmacy platform. Built with HTML5, CSS3, and Vanilla JavaScript, it provides users with instant health information, personalized medicine suggestions, and seamless shopping for over-the-counter medications.

## Core Features

### 1. AI-Powered Symptom Checker (symptomcheck.html)
- Interactive chat interface (MediBot)
- Real-time medicine recommendations for 9 symptom categories
- 30+ medicines with prices, dosages, and safety information
- Keyword-based intelligent responses
- Suggestion buttons for quick queries

**Symptom Categories:** Headache, Fever, Cough, Cold & Flu, Stomach Pain, Allergies, Muscle Pain, Stress, Vitamin Deficiency

### 2. Medicine Catalog (browsemedicines.html)
- 30+ medicines across 5 categories
- Search and filter functionality
- Flip card design with detailed information
- Prices in Indian Rupees (₹)
- Add to cart functionality

**Categories:** Pain Relief, Fever & Cold, Respiratory, Heart & BP, Herbal

### 3. Shopping Cart (cart.html)
- Add/remove items with quantity controls
- Price calculations with 10% tax
- Stripe payment integration (test mode)
- LocalStorage persistence
- Cart badge counter

### 4. Symptom Assessment Tool (Symptom Severity.html)
- Interactive severity slider (Mild to Progressive)
- Duration tracking (Acute to Persistent)
- Visual pain scale (0-10 with emojis)
- Frequency selector
- Trigger factors (8 options)
- Personalized recommendations
- Save assessments to localStorage

### 5. Homepage (index.html)
- Hero section with animated counters
- Feature showcase
- Medicine catalog preview
- Testimonials
- Contact form
- Navigation to all features

## Design Theme

**Colors:**
- Background: #e0f7fa (Soft Medical Blue)
- Primary: #00796b, #26a69a, #00695c (Teal shades)
- Text: #004d40 (Dark Teal)
- Accents: #00bfa5, #b2dfdb

**Typography:** Nunito (Google Fonts)

**Style:** Modern, clean, medical aesthetic with card-based layouts, smooth animations, and responsive design

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** LocalStorage API
- **Payment:** Stripe.js (Test Mode)
- **Icons:** Font Awesome
- **Fonts:** Google Fonts (Nunito)

## Key Pages

1. **index.html** - Homepage with navigation
2. **symptomcheck.html** - AI chatbot for symptom checking
3. **browsemedicines.html** - Medicine catalog with search/filter
4. **cart.html** - Shopping cart and checkout
5. **login.html** - User authentication
6. **Symptom Severity.html** - Detailed symptom assessment
7. **Category Pages** - pain-relief.html, cold-flu.html, allergy.html, digestive.html, vitamins.html
8. **Additional Pages** - Symptom Categories, Symptom Matrix, lifestyle-factors, fun-symptoms, Reviews, Map

## How to Use

1. Open `index.html` in a web browser
2. Click "Start Symptom Check" for AI chatbot
3. Click "Browse Medicines" to view catalog
4. Add items to cart and proceed to checkout
5. Use "Symptom Severity" page for detailed assessment

## Key JavaScript Functions

- `addToCart(productName, price)` - Add item to cart
- `updateCartBadge()` - Update cart counter
- `getBotResponse(message)` - Generate AI responses
- `getRecommendations()` - Generate symptom recommendations
- `saveAssessment()` - Save symptom assessment

## Data Structure

**Cart (LocalStorage):**
```javascript
[
  { name: "Product Name", price: 50, quantity: 1 }
]
```

**Symptom Assessment:**
```javascript
{
  severity: "Mild",
  duration: "Acute (0-3 days)",
  painLevel: "4/10",
  frequency: "Daily",
  triggers: ["Stress", "Diet"],
  notes: "Additional information"
}
```

## Features Summary

✅ AI-powered symptom checker with medicine recommendations  
✅ 30+ medicines catalog with search and filter  
✅ Shopping cart with Stripe payment integration  
✅ Interactive symptom assessment tool  
✅ Responsive design for all devices  
✅ LocalStorage for data persistence  
✅ Modern UI/UX with smooth animations  
✅ Medical disclaimers and safety information  

## Medical Disclaimer

⚠️ This website provides general information only and is NOT a substitute for professional medical advice. Always consult healthcare professionals for proper diagnosis and treatment.

---

**Quick Start:** Open `index.html` in a browser - no server required!

