import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Navigation function
function navigateTo(url) {
  window.location.href = url;
}

// Get DOM elements using IDs
const loginBtn = document.getElementById('login-btn');
const createAccountBtn = document.getElementById('create-account-btn');
const logoutBtn = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');

// Display user email
function displayUserEmail(user) {
  if (user && userEmailSpan) {
    userEmailSpan.textContent = user.email;
    userEmailSpan.style.display = 'inline-block';
  }
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log('User signed in:', user.email);
    if (loginBtn) loginBtn.style.display = 'none';
    if (createAccountBtn) createAccountBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    displayUserEmail(user);
  } else {
    // No user is signed in
    console.log('No user signed in.');
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (createAccountBtn) createAccountBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userEmailSpan) {
      userEmailSpan.textContent = '';
      userEmailSpan.style.display = 'none';
    }
    
    // Clear Spotify tokens when website user logs out
    localStorage.removeItem('spotifyAccessToken');
    localStorage.removeItem('spotifyRefreshToken');
    localStorage.removeItem('spotifyTokenExpiry');
  }
});

// Logout event
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      try {
        // Clear Spotify tokens
        localStorage.removeItem('spotifyAccessToken');
        localStorage.removeItem('spotifyRefreshToken');
        localStorage.removeItem('spotifyTokenExpiry');
        
        await signOut(auth);
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  });
}

// Expose navigation function and auth state globally
window.navigateTo = navigateTo;
window.getAuthState = () => auth.currentUser;