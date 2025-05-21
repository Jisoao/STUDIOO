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

// Navigation elements
const navContainer = document.querySelector('.nav-container');
const hamburgerBtn = document.querySelector('.hamburger-btn');
const menuDropdown = document.querySelector('.menu-dropdown');
const loginBtn = document.querySelector('.login-btn');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle menu
function toggleMenu() {
  hamburgerBtn.classList.toggle('active');
  menuDropdown.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', (event) => {
  if (!navContainer.contains(event.target)) {
    hamburgerBtn.classList.remove('active');
    menuDropdown.classList.remove('show');
  }
});

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

// Handle auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
    if (hamburgerBtn) {
      hamburgerBtn.style.display = 'flex';
    }
  } else {
    // User is signed out
    if (loginBtn) {
      loginBtn.style.display = 'block';
    }
    if (hamburgerBtn) {
      hamburgerBtn.style.display = 'none';
    }
    menuDropdown.classList.remove('show');
    hamburgerBtn.classList.remove('active');
  }
});

// Add event listeners
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });
}

// Handle menu item clicks
document.querySelectorAll('.menu-item').forEach(item => {
  if (item.id !== 'logoutBtn') {
    item.addEventListener('click', () => {
      toggleMenu();
    });
  }
});

// --- Centralized Slide Menu Logic ---
function openProfileMenu() {
  const menu = document.getElementById('profileSlideMenu');
  const overlay = document.getElementById('profileOverlay');
  if (menu && overlay) {
    menu.classList.add('open');
    overlay.classList.add('open');
  }
}

function closeProfileMenu() {
  const menu = document.getElementById('profileSlideMenu');
  const overlay = document.getElementById('profileOverlay');
  if (menu && overlay) {
    menu.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function setupProfileMenuEvents() {
  const profileIcon = document.querySelector('.profile-icon-img');
  const overlay = document.getElementById('profileOverlay');
  const closeBtn = document.querySelector('.close-profile-menu');
  if (profileIcon) {
    profileIcon.onclick = openProfileMenu;
  }
  if (overlay) {
    overlay.onclick = closeProfileMenu;
  }
  if (closeBtn) {
    closeBtn.onclick = closeProfileMenu;
  }
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('profileSlideMenu');
    const icon = document.querySelector('.profile-icon-img');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && e.target !== icon) {
      closeProfileMenu();
    }
  });
}

// Only run on non-auth, non-index pages
if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.includes('auth')) {
  window.addEventListener('DOMContentLoaded', setupProfileMenuEvents);
} 