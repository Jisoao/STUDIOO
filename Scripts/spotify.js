// Scripts/spotify.js - Updated with proper Spotify OAuth implementation

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = '6efa8e49fdf64e0c9c6161b3951d1e77'; // Replace with your Spotify app client ID
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5502/homepage.html'; // Must match your Spotify app settings
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read'
].join(' ');

// Check if token is expired
function isTokenExpired() {
  const expiryTime = localStorage.getItem('spotifyTokenExpiry');
  if (!expiryTime) return true;
  return Date.now() > parseInt(expiryTime);
}

// Validate token without redirecting
async function validateToken() {
  const accessToken = localStorage.getItem('spotifyAccessToken');
  if (!accessToken || isTokenExpired()) {
    return null;
  }
  return accessToken;
}

// Handle authentication state
async function handleAuthState() {
  const accessToken = await validateToken();
  const isLoginPage = window.location.pathname.includes('spotify.html');
  
  if (accessToken) {
    if (isLoginPage) {
      // If we're on login page and have valid token, redirect to homepage
      window.location.href = 'homepage.html';
    }
  } else {
    // Only redirect to login if we're on a page that requires Spotify
    const requiresSpotify = window.location.pathname.includes('spotify.html');
    
    if (requiresSpotify && !isLoginPage) {
      window.location.href = 'spotify.html';
    }
  }
  
  return accessToken;
}

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.querySelector('.spotify-login-form');
  
  // Handle form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('input[type="email"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;
      
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }
      
      initiateSpotifyLogin();
    });
  }

  // Handle back button
  const backBtn = document.querySelector('.back-arrow');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });
  }

  // Check for access token in URL (callback from Spotify)
  checkForAccessToken();
  
  // Handle initial auth state
  await handleAuthState();
});

function initiateSpotifyLogin() {
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  
  const params = {
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'token',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'true'
  };
  
  Object.keys(params).forEach(key => {
    authUrl.searchParams.append(key, params[key]);
  });
  
  window.location.href = authUrl.toString();
}

function checkForAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  
  if (accessToken) {
    // Store token and expiry
    localStorage.setItem('spotifyAccessToken', accessToken);
    const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
    localStorage.setItem('spotifyTokenExpiry', expiryTime.toString());
    
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Notify user
    alert('Successfully connected to Spotify!');
    
    // Redirect to homepage after successful login
    window.location.href = 'homepage.html';
  } else if (window.location.search.includes('error')) {
    const error = new URLSearchParams(window.location.search).get('error');
    alert(`Spotify authentication failed: ${error}`);
  }
}

// Helper function to make authenticated API calls
async function fetchSpotifyData(endpoint, accessToken) {
  try {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Spotify API request failed:', error);
    throw error;
  }
}

// Make functions available globally
window.validateToken = validateToken;
window.fetchSpotifyData = fetchSpotifyData;
window.handleAuthState = handleAuthState;