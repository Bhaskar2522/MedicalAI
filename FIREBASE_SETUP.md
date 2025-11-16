# Firebase Authentication Setup

Follow these steps to wire the static MED-AI project to your Firebase project.

1. **Create a Firebase project**
   - Visit [Firebase Console](https://console.firebase.google.com/).
   - Create a new project or choose an existing one.
   - In *Project settings → General*, scroll to **Your apps** and create a new Web app. You do **not** need Firebase Hosting for this step.

2. **Enable Email/Password Auth**
   - In the console navigate to **Build → Authentication → Sign-in method**.
   - Enable **Email/Password** and save.

3. **Copy your configuration**
   - From the web app you registered, copy the Firebase SDK config object.
   - Replace the placeholder values in `login.js`:
     ```js
     const firebaseConfig = {
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
       projectId: "YOUR_FIREBASE_PROJECT_ID",
       storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
       messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
       appId: "YOUR_FIREBASE_APP_ID"
     };
     ```

4. **Local development**
   - Run `python -m http.server 8000` (or any static server) from the project root.
   - Open `http://localhost:8000/login.html` to use the Firebase-backed signup form.

5. **Deployment**
   - Because the project is static, you can deploy it to any static host (Firebase Hosting, GitHub Pages, Netlify, Vercel, etc.).
   - Ensure the deployed origin is added to **Authentication → Settings → Authorized domains** in Firebase.

You’re ready to authenticate users! Once a user signs up, they’ll appear under **Authentication → Users** in the Firebase console. You can extend this flow with login, password reset, or profile management by importing the relevant Firebase Auth methods in `login.js`.

