# OpenAI API Setup for Symptom Checker

## Important: CORS Issue

⚠️ **OpenAI API does NOT allow direct browser calls** due to CORS (Cross-Origin Resource Sharing) restrictions. 

You have **3 options** to make it work:

---

## Option 1: Use a CORS Proxy (Development Only)

### Step 1: Request Temporary Access
1. Visit: https://cors-anywhere.herokuapp.com/corsdemo
2. Click "Request temporary access to the demo server"
3. This enables CORS proxy for 1 hour

### Step 2: Update the Code
The code already includes CORS proxy support. In `symptomcheck.js`, make sure:
```javascript
const useProxy = true; // Set to true for CORS proxy
```

### Step 3: Test
- Open `symptomcheck.html` in your browser
- Configure your API key
- Test the symptom checker

**Note**: This is only for development/testing. Not recommended for production.

---

## Option 2: Create a Backend Server (Recommended)

### Node.js/Express Example

1. **Install dependencies:**
```bash
npm init -y
npm install express cors dotenv openai
```

2. **Create `server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, apiKey } = req.body;
    
    // Use API key from request (client-side stored) or server env
    const clientOpenAI = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    
    const completion = await clientOpenAI.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7
    });
    
    res.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

3. **Create `.env` file:**
```
OPENAI_API_KEY=your_api_key_here
```

4. **Update `symptomcheck.js`:**
```javascript
const useProxy = false; // Set to false for backend
const backendUrl = 'http://localhost:3000/api/chat'; // Your backend URL

// Then modify getAIResponse to call your backend instead
const response = await fetch(backendUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [...],
    apiKey: apiKey // Send API key in request body
  })
});
```

---

## Option 3: Use a CORS Extension (Development Only)

### Chrome Extension:
1. Install "CORS Unblock" or similar extension
2. Enable it
3. Test your app

**Note**: This only works on your machine. Users will still face CORS issues.

---

## Testing Your Setup

### Step 1: Get API Key
1. Go to: https://platform.openai.com/api-keys
2. Create or copy your API key (starts with `sk-`)

### Step 2: Configure in App
1. Open `symptomcheck.html`
2. Click "⚙️ Configure API Key"
3. Enter your API key
4. Click "Save API Key"

### Step 3: Test
1. Select a symptom (e.g., "Fever")
2. Check browser console (F12) for any errors
3. If you see CORS error, use one of the solutions above

---

## Common Errors

### Error: "Failed to fetch" or CORS Error
**Solution**: Use Option 1 or 2 above. OpenAI blocks direct browser calls.

### Error: "401 Unauthorized"
**Solution**: Check your API key is correct and has credits.

### Error: "429 Too Many Requests"
**Solution**: You've hit rate limits. Wait a bit or upgrade your OpenAI plan.

### Error: "Invalid API key"
**Solution**: Make sure your key starts with `sk-` and is valid.

---

## Security Notes

⚠️ **IMPORTANT**: 
- Never expose your API key in frontend code that's committed to public repositories
- For production, always use a backend server
- API key should be stored securely (environment variables, not in code)
- Client-side stored keys are visible in browser DevTools (acceptable for demo)

---

## Quick Fix for Current Issue

If you're seeing CORS errors:

1. **Quick Solution** (for testing):
   - Visit: https://cors-anywhere.herokuapp.com/corsdemo
   - Click "Request temporary access"
   - The code already supports this

2. **Better Solution**:
   - Create a simple Node.js backend (Option 2 above)
   - Update the code to call your backend
   - This is production-ready

---

## Need Help?

- Check browser console (F12) for detailed error messages
- OpenAI API Docs: https://platform.openai.com/docs
- CORS Info: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

