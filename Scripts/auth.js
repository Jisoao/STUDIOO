import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGsZGAaHR35zDa5KbdwPx8I0iMLppBv6A",
  authDomain: "studio-3645c.firebaseapp.com",
  projectId: "studio-3645c",
  storageBucket: "studio-3645c.appspot.com",
  messagingSenderId: "1089413503582",
  appId: "1:1089413503582:web:25338beefba4efbfb3b2cf",
  measurementId: "G-0MKBZ0WYM6"
};

// Initialize Firebase
let app;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  analytics = getAnalytics(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Toggle forms
function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  clearMessages();
  document.getElementById('switchLogin')?.classList.add('active');
  document.getElementById('switchRegister')?.classList.remove('active');
}

function showRegister() {
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
  clearMessages();
  document.getElementById('switchRegister')?.classList.add('active');
  document.getElementById('switchLogin')?.classList.remove('active');
}

function clearMessages() {
  document.getElementById('registerError').textContent = '';
  document.getElementById('registerSuccess').textContent = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginSuccess').textContent = '';
}

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;

// Registration form handler
document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');

  if (password !== confirm) {
    errorEl.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Send email verification
      return sendEmailVerification(auth.currentUser);
    })
    .then(() => {
      successEl.textContent = "Registration successful! Please check your email to verify your account before logging in.";
      // Optionally, clear the form or redirect after a longer delay
      // setTimeout(showLogin, 5000); // Redirect after 5 seconds
    })
    .catch((error) => {
      errorEl.textContent = error.message;
    });
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const successEl = document.getElementById('loginSuccess');

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        console.log('Login successful: User email is verified.');
        // Save the user's email to local storage before redirecting
        localStorage.setItem('loggedInUserEmail', user.email);
        console.log('User email saved to localStorage:', user.email);
        successEl.textContent = "Login successful! Redirecting...";
        setTimeout(() => {
          window.location.replace('homepage.html');
        }, 1000);
      } else {
        // If email is not verified, sign out the user and show error
        console.log('Login failed: User email is not verified.');
        auth.signOut(); // Sign out unverified user
        errorEl.textContent = "Please verify your email address before logging in. Check your inbox for the verification link.";
      }
    })
    .catch((error) => {
      console.error('Firebase Login Error:', error.message);
      errorEl.textContent = error.message;
    });
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.email);
    // If the user is signed in and email is verified
    if (user.emailVerified) {
      // If we're on the auth page and user is signed in AND verified, redirect to homepage
      if (window.location.pathname.includes('auth.html')) {
        console.log('User is verified, redirecting to homepage.');
        window.location.replace('homepage.html');
      }
    } else {
      // User is signed in but email not verified
      console.log('User signed in but email not verified.');
      // Keep them on the auth page or redirect to a verification prompt page
      // For now, we'll keep them on the auth page and show an error if they try to log in
      // You might want a dedicated page asking them to verify email.
    }
  } else {
    console.log('No user is signed in');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#signup') {
    showRegister();
  } else {
    showLogin();
  }
}); 