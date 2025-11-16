# Stripe Payment Gateway Setup Guide

This guide will help you set up Stripe payment gateway for your MED-AI application.

## Prerequisites

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard

## Quick Setup (Test Mode)

### Step 1: Get Your Stripe Publishable Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. In `cart.html`, find this line (around line 736):
   ```javascript
   const stripePublishableKey = 'pk_test_51PYourKeyHere'; // REPLACE THIS
   ```
4. Replace `'pk_test_51PYourKeyHere'` with your actual publishable key

### Step 2: Testing the Payment Form

For testing purposes, use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code

### Step 3: For Production (Full Implementation)

**IMPORTANT**: The current implementation uses a mock payment. For production, you **MUST** create a backend server to securely handle payments.

#### Backend Server Requirements

You need to create a server endpoint that:

1. **Creates a Payment Intent** (using your Stripe Secret Key)
2. **Returns the client_secret** to the frontend
3. **Confirms the payment** securely

#### Example Backend Endpoint (Node.js/Express)

```javascript
// Install Stripe: npm install stripe
const stripe = require('stripe')('sk_test_your_secret_key');

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (e.g., 1000 = $10.00)
      currency: currency,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Update Frontend Code

In `cart.html`, uncomment and use this code in the `handlePaymentSubmit` function (around line 832):

```javascript
// Replace the mock payment code with this:
const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        amount: Math.round(parseFloat(calculateTotal()) * 100), // Amount in cents
        currency: 'usd',
        metadata: {
            email: email,
            name: nameOnCard,
        }
    }),
});

const { clientSecret } = await response.json();

const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
        card: cardElement,
        billing_details: {
            name: nameOnCard,
            email: email,
            address: {
                line1: billingAddress,
                city: city,
                postal_code: zipCode,
            },
        },
    },
});

if (error) {
    throw error;
}

// Payment successful!
```

## Security Notes

⚠️ **NEVER** put your Stripe Secret Key in frontend code!

- ✅ **Publishable Key** (pk_test_...) - Safe for frontend
- ❌ **Secret Key** (sk_test_...) - NEVER expose to frontend, only use in backend

## Features

✅ Secure card input using Stripe Elements
✅ Real-time card validation
✅ Payment modal with beautiful UI
✅ Loading states during payment processing
✅ Success/error handling
✅ Cart clearing after successful payment

## Support

For issues or questions:
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)

