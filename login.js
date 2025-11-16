// Firebase imports with error handling
let app, auth;
let firebaseInitialized = false;

async function initializeFirebase() {
  try {
    console.log('Loading Firebase modules...');
    
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const {
      getAuth,
      createUserWithEmailAndPassword,
      updateProfile,
      GoogleAuthProvider,
      signInWithPopup,
      RecaptchaVerifier,
      signInWithPhoneNumber,
      signInWithEmailAndPassword,
    } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");

    // Make functions globally available
    window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    window.updateProfile = updateProfile;
    window.GoogleAuthProvider = GoogleAuthProvider;
    window.signInWithPopup = signInWithPopup;
    window.RecaptchaVerifier = RecaptchaVerifier;
    window.signInWithPhoneNumber = signInWithPhoneNumber;
    window.signInWithEmailAndPassword = signInWithEmailAndPassword;

    const firebaseConfig = {
      apiKey: "AIzaSyCuHVsd0jCHG83beNQE472OLiclD-rk3mo",
      authDomain: "pets-9c79f.firebaseapp.com",
      projectId: "pets-9c79f",
      storageBucket: "pets-9c79f.firebasestorage.app",
      messagingSenderId: "857858983979",
      appId: "1:857858983979:web:cb27dce518eb086e6e026e",
      measurementId: "G-RCCJ53E6NW"
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firebaseInitialized = true;
    
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    showFirebaseError(error);
    return false;
  }
}

function showFirebaseError(error) {
  const errorMessage = `
    <div style="position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 1rem; border-radius: 8px; z-index: 10000; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
      <strong>⚠️ Connection Error</strong>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
        Unable to connect to authentication service. Please check your internet connection and try again.
      </p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; opacity: 0.9;">
        Error: ${error.message || 'Network error'}
      </p>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', errorMessage);
  
  // Remove error after 10 seconds
  setTimeout(() => {
    const errorDiv = document.querySelector('div[style*="background: #ff4444"]');
    if (errorDiv) errorDiv.remove();
  }, 10000);
}

// Hide loading indicator when Firebase is ready
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById('firebaseLoading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

// Initialize Firebase
initializeFirebase().then((success) => {
  if (success) {
    hideLoadingIndicator();
  } else {
    // Keep loading indicator visible if Firebase fails
    const loadingIndicator = document.getElementById('firebaseLoading');
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
        <p style="color: #d32f2f; font-weight: 600; margin-bottom: 0.5rem;">Connection Error</p>
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">Unable to load authentication service.</p>
        <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #00796b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Retry
        </button>
      `;
    }
  }
});

// Element references (will be populated after DOM loads)
let signupForm, signinForm, submitBtn, signinSubmitBtn, googleBtn;
let sendCodeBtn, verifyCodeBtn, phoneInput, codeInput;
let phoneError, phoneSuccess;
let signinEmailInput, signinPasswordInput;
let signinEmailError, signinPasswordError;
let authTitle, authSubtitle;
let authToggleButtons, authSections;

let recaptchaVerifier;
let confirmationResult;
let activeMode = 'signup';

// Function to attach all event listeners
function attachEventListeners() {
  // Get all elements
  signupForm = document.getElementById('signupForm');
  signinForm = document.getElementById('signinForm');
  submitBtn = document.getElementById('emailSubmitBtn');
  signinSubmitBtn = document.getElementById('signinSubmitBtn');
  googleBtn = document.getElementById('googleSignInBtn');
  sendCodeBtn = document.getElementById('sendCodeBtn');
  verifyCodeBtn = document.getElementById('verifyCodeBtn');
  phoneInput = document.getElementById('phoneNumber');
  codeInput = document.getElementById('verificationCode');
  phoneError = document.getElementById('phoneError');
  phoneSuccess = document.getElementById('phoneSuccess');
  signinEmailInput = document.getElementById('signinEmail');
  signinPasswordInput = document.getElementById('signinPassword');
  signinEmailError = document.getElementById('signinEmailError');
  signinPasswordError = document.getElementById('signinPasswordError');
  authTitle = document.getElementById('authTitle');
  authSubtitle = document.getElementById('authSubtitle');
  authToggleButtons = document.querySelectorAll('[data-auth-toggle]');
  authSections = document.querySelectorAll('[data-auth-section]');

  // Attach toggle button handlers
  authToggleButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = button.dataset.authToggle;
      if (mode) {
        console.log('Toggle button clicked, switching to:', mode);
        setAuthMode(mode);
      }
    });
    console.log('Toggle button event listener attached:', button.dataset.authToggle);
  });

  // Sign Up form submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!firebaseInitialized) {
        alert('⚠️ Authentication service is not ready. Please wait a moment and try again.');
        return;
      }

      clearSignupErrors();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      const validationPassed = validateSignupFields({ name, email, password });
      if (!validationPassed) return;

      setButtonLoading(submitBtn, 'Creating account...');

      try {
        const { user } = await window.createUserWithEmailAndPassword(auth, email, password);

        if (name) {
          await window.updateProfile(user, { displayName: name });
        }

        alert('✅ Signup successful!');
        window.location.href = 'index.html';
      } catch (error) {
        handleFirebaseError(error);
      } finally {
        resetButtonState(submitBtn, 'Create Account');
      }
    });
  }

  // Sign In handler function
  window.handleSignIn = async function() {
    if (!firebaseInitialized) {
      alert('⚠️ Authentication service is not ready. Please wait a moment and try again.');
      return;
    }

    clearSigninErrors();

    const email = signinEmailInput?.value.trim() || '';
    const password = signinPasswordInput?.value.trim() || '';

    if (!email || !password) {
      if (signinEmailError) {
        signinEmailError.textContent = email ? '' : 'Email is required';
      }
      if (signinPasswordError) {
        signinPasswordError.textContent = password ? '' : 'Password is required';
      }
      return;
    }

    const validationPassed = validateSigninFields({ email, password });
    if (!validationPassed) return;

    if (!signinSubmitBtn) {
      console.error('Sign In button not found');
      return;
    }

    setButtonLoading(signinSubmitBtn, 'Signing in...');

    try {
      const userCredential = await window.signInWithEmailAndPassword(auth, email, password);
      console.log('Sign-in successful:', userCredential.user);
      alert('✅ Sign-in successful!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Sign-in error:', error);
      handleFirebaseError(error, 'signin');
    } finally {
      resetButtonState(signinSubmitBtn, 'Sign In');
    }
  };

  // Sign In form submission
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await window.handleSignIn();
    });
    console.log('✅ Sign In form event listener attached');
  } else {
    console.error('❌ Sign In form not found');
  }

  // Ensure button triggers form submission
  if (signinSubmitBtn && signinForm) {
    // The button is type="submit" so it will automatically submit the form
    // The form's submit event handler will catch it
    console.log('✅ Sign In button is properly connected to form');
  }

  // Google Sign-In handler
  window.handleGoogleSignIn = async function() {
    if (!firebaseInitialized) {
      alert('⚠️ Authentication service is not ready. Please wait a moment and try again.');
      return;
    }

    if (!googleBtn) {
      console.error('Google sign-in button not found');
      return;
    }

    setButtonLoading(googleBtn, 'Signing in with Google...');

    try {
      const provider = new window.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      console.log('Attempting Google sign-in...');
      const result = await window.signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user);
      
      alert('✅ Google sign-in successful!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/popup-blocked') {
        alert('⚠️ Popup blocked! Please allow popups for this site and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert('⚠️ Sign-in popup was closed. Please try again.');
      } else {
        handleFirebaseError(error);
      }
    } finally {
      resetButtonState(googleBtn, 'Continue with Google');
    }
  };

  // Attach Google sign-in event (works for both signup and signin)
  if (googleBtn) {
    googleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Google sign-in button clicked');
      await window.handleGoogleSignIn();
    });
    console.log('✅ Google sign-in button event listener attached');
  } else {
    console.error('❌ Google sign-in button not found in DOM');
  }

  // Phone authentication
  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', async () => {
      if (!phoneInput?.value) {
        if (phoneError) {
          phoneError.textContent = 'Enter a valid phone number with country code (e.g., +1XXXXXXXXXX).';
        }
        return;
      }

      clearPhoneMessages();
      setButtonLoading(sendCodeBtn, 'Sending code...');

      try {
        const verifier = await getRecaptchaVerifier();
        confirmationResult = await window.signInWithPhoneNumber(auth, phoneInput.value.trim(), verifier);
        if (phoneSuccess) {
          phoneSuccess.textContent = 'Verification code sent! Check your messages.';
        }
        verifyCodeBtn?.classList.remove('hidden');
        codeInput?.classList.remove('hidden');
      } catch (error) {
        handlePhoneError(error);
        resetRecaptcha();
      } finally {
        resetButtonState(sendCodeBtn, 'Send Code');
      }
    });
  }

  if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', async () => {
      if (!codeInput?.value) {
        if (phoneError) {
          phoneError.textContent = 'Please enter the verification code you received.';
        }
        return;
      }

      if (!confirmationResult) {
        if (phoneError) {
          phoneError.textContent = 'Request a new code before verifying.';
        }
        return;
      }

      clearPhoneMessages();
      setButtonLoading(verifyCodeBtn, 'Verifying...');

      try {
        await confirmationResult.confirm(codeInput.value.trim());
        if (phoneSuccess) {
          phoneSuccess.textContent = '✅ Phone sign-in successful!';
        }
        codeInput.value = '';
        window.location.href = 'index.html';
      } catch (error) {
        handlePhoneError(error);
      } finally {
        resetButtonState(verifyCodeBtn, 'Verify & Sign In');
      }
    });
  }
}

function validateSignupFields({ name, email, password }) {
  let valid = true;

  if (name.length < 3) {
    document.getElementById('nameError').textContent = 'Enter at least 3 characters';
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById('emailError').textContent = 'Enter a valid email';
    valid = false;
  }

  if (password.length < 6) {
    document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
    valid = false;
  }

  return valid;
}

function validateSigninFields({ email, password }) {
  let valid = true;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (signinEmailError) {
      signinEmailError.textContent = 'Enter a valid email';
    }
    valid = false;
  }

  if (password.length < 6) {
    if (signinPasswordError) {
      signinPasswordError.textContent = 'Password must be at least 6 characters';
    }
    valid = false;
  }

  return valid;
}

function clearSignupErrors() {
  document.getElementById('nameError').textContent = '';
  document.getElementById('emailError').textContent = '';
  document.getElementById('passwordError').textContent = '';
}

function clearSigninErrors() {
  if (signinEmailError) signinEmailError.textContent = '';
  if (signinPasswordError) signinPasswordError.textContent = '';
}

function clearPhoneMessages() {
  if (phoneError) phoneError.textContent = '';
  if (phoneSuccess) phoneSuccess.textContent = '';
}

function setAuthMode(mode, force = false) {
  if (!mode || (!force && mode === activeMode)) return;

  activeMode = mode;
  console.log('🔄 Setting auth mode to:', mode);

  // Update toggle buttons
  authToggleButtons.forEach((button) => {
    const buttonMode = button.dataset.authToggle;
    const isActive = buttonMode === mode;
    button.classList.toggle('active', isActive);
    console.log(`Toggle button "${buttonMode}": ${isActive ? 'active' : 'inactive'}`);
  });

  // Update sections visibility
  authSections.forEach((section) => {
    const sectionMode = section.dataset.authSection;
    if (!sectionMode) return;
    const shouldShow = sectionMode === mode;
    section.classList.toggle('hidden', !shouldShow);
    console.log(`Section "${sectionMode}": ${shouldShow ? '✅ shown' : '❌ hidden'}`);
  });

  // Update title and subtitle
  if (authTitle) {
    authTitle.textContent = mode === 'signup' ? 'Create Account' : 'Welcome Back';
  }

  if (authSubtitle) {
    authSubtitle.textContent =
      mode === 'signup'
        ? 'Choose how you want to get started.'
        : 'Sign in to continue with your workspace.';
  }

  // Clear errors
  clearSignupErrors();
  clearSigninErrors();
  clearPhoneMessages();

  // Reset forms
  signupForm?.reset();
  signinForm?.reset();

  // Reset phone inputs
  if (phoneInput) phoneInput.value = '';
  if (codeInput) {
    codeInput.value = '';
    codeInput.classList.add('hidden');
  }

  verifyCodeBtn?.classList.add('hidden');
  resetRecaptcha();
  confirmationResult = null;

  // CRITICAL: Ensure form is visible when switching to signin
  if (mode === 'signin') {
    if (signinForm) {
      signinForm.classList.remove('hidden');
      signinForm.style.display = 'flex'; // Force display
      console.log('✅ Sign In form is now visible');
    } else {
      console.error('❌ Sign In form not found when switching to signin mode');
    }
    
    // Also ensure signup form is hidden
    if (signupForm) {
      signupForm.classList.add('hidden');
    }
  } else {
    // Signup mode
    if (signupForm) {
      signupForm.classList.remove('hidden');
      signupForm.style.display = 'flex';
    }
    if (signinForm) {
      signinForm.classList.add('hidden');
    }
  }
}

function handleFirebaseError(error, mode = activeMode) {
  const mappedMessage = mapFirebaseError(error.code);
  console.error('Firebase error:', error.code, mappedMessage);

  if (mode === 'signin') {
    // For sign-in, show error in appropriate field
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
      if (signinEmailError) {
        signinEmailError.textContent = mappedMessage;
      }
    } else if (error.code === 'auth/wrong-password') {
      if (signinPasswordError) {
        signinPasswordError.textContent = mappedMessage;
      }
    } else {
      if (signinEmailError) {
        signinEmailError.textContent = mappedMessage;
      }
    }
  } else {
    // For sign-up
    const targetError = document.getElementById('emailError');
    if (targetError) {
      targetError.textContent = mappedMessage;
    }
  }

  alert(mappedMessage);
}

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'The email address is invalid. Double-check and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are disabled in Firebase Console.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/invalid-phone-number':
      return 'Enter a valid phone number with country code.';
    case 'auth/missing-phone-number':
      return 'Provide a phone number to continue.';
    case 'auth/invalid-verification-code':
      return 'The verification code is incorrect or expired.';
    case 'auth/missing-verification-code':
      return 'Enter the SMS verification code.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Try again later.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/popup-blocked':
      return 'Popup blocked. Allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Popup closed before completing sign-in.';
    case 'auth/user-not-found':
      return 'No account found for that email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Try again or reset it.';
    case 'auth/invalid-credential':
      return 'The provided credentials are invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please try again.';
    default:
      return 'Unable to create account right now. Please try again later.';
  }
}

function handlePhoneError(error) {
  const mappedMessage = mapFirebaseError(error.code);
  if (phoneError) {
    phoneError.textContent = mappedMessage || 'Unable to verify phone number. Try again later.';
  }
}

function resetButtonState(button, fallbackLabel) {
  if (!button) return;
  button.disabled = false;
  button.classList.remove('loading');

  if (button.dataset.originalContent) {
    button.innerHTML = button.dataset.originalContent;
  } else if (fallbackLabel) {
    button.textContent = fallbackLabel;
  }
}

function setButtonLoading(button, loadingLabel) {
  if (!button) return;
  if (!button.dataset.originalContent) {
    button.dataset.originalContent = button.innerHTML;
  }
  button.disabled = true;
  button.classList.add('loading');
  button.innerHTML = loadingLabel;
}

async function getRecaptchaVerifier() {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }

  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }

  recaptchaVerifier = new window.RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {
      if (phoneSuccess) {
        phoneSuccess.textContent = 'reCAPTCHA verified. Sending code...';
      }
    },
    'expired-callback': () => {
      if (phoneError) {
        phoneError.textContent = 'reCAPTCHA expired. Please try again.';
      }
    },
  });

  await recaptchaVerifier.render();
  return recaptchaVerifier;
}

function resetRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

// Initialize function
function initializeAuth() {
  console.log('🔧 Initializing authentication system...');
  
  // First, attach all event listeners (this populates the element references)
  attachEventListeners();
  
  // Initialize auth mode
  setAuthMode('signup', true);
  
  // Debug: Log all elements
  console.log('=== Authentication Elements Check ===');
  console.log('Sign Up Form:', signupForm);
  console.log('Sign In Form:', signinForm);
  console.log('Sign In Submit Button:', signinSubmitBtn);
  console.log('Google Sign-In Button:', googleBtn);
  console.log('Sign In Email Input:', signinEmailInput);
  console.log('Sign In Password Input:', signinPasswordInput);
  console.log('=====================================');
  
  // Verify all critical elements exist
  if (!signinForm) {
    console.error('❌ Sign In form not found in DOM');
  } else {
    console.log('✅ Sign In form found');
  }
  
  if (!signinSubmitBtn) {
    console.error('❌ Sign In submit button not found in DOM');
  } else {
    console.log('✅ Sign In submit button found');
  }
  
  if (!googleBtn) {
    console.error('❌ Google sign-in button not found in DOM');
  } else {
    console.log('✅ Google sign-in button found');
  }
  
  // Test if forms are accessible
  if (signinForm && signinSubmitBtn) {
    console.log('✅ Sign In form and button are properly connected');
  }
  
  console.log('✅ Authentication system initialized');
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
  console.log('⏳ Waiting for DOM to load...');
} else {
  // DOM is already loaded
  console.log('✅ DOM already loaded, initializing immediately...');
  initializeAuth();
}

window.addEventListener('unload', resetRecaptcha);
