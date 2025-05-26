import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";

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

// Navigation elements (excluding old menu elements)
const loginBtn = document.querySelector('.login-btn');
const logoutBtn = document.getElementById('logout-button'); // Corrected ID based on HTML

// Handle logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
  } else {
    // User is signed out
    if (loginBtn) {
      loginBtn.style.display = 'block';
    }
  }
});


function navigateTo(url) {
  window.location.href = url;
}

// Function to display user email (kept for use in HTML and auth state observer)
function displayUserEmail() {
  const userEmailSpan = document.getElementById('user-email');
  const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

  if (userEmailSpan) {
    if (loggedInUserEmail && loggedInUserEmail !== '') {
      userEmailSpan.textContent = loggedInUserEmail;
    } else {
      userEmailSpan.textContent = ''; 
    }
  }
}

onAuthStateChanged(auth, (user) => {
  const logoutButton = document.getElementById('logout-button');
  const userEmailSpan = document.getElementById('user-email');

  if (user) {
    console.log('Auth state changed: User is signed in:', user.email);
    if (logoutButton) { logoutButton.style.display = 'block'; } // Show logout button
    if (userEmailSpan) { displayUserEmail(); } // Update email display
  } else {
    console.log('Auth state changed: No user is signed in.');
    if (logoutButton) { logoutButton.style.display = 'none'; } // Hide logout button
    if (userEmailSpan) { userEmailSpan.textContent = ''; } // Clear email display
  }
});

// Initial display email on page load
document.addEventListener('DOMContentLoaded', () => {
  displayUserEmail();
});

window.navigateTo = navigateTo;
window.logout = logout;
window.displayUserEmail = displayUserEmail;