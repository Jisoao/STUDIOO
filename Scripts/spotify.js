// Spotify API Configuration
const SPOTIFY_CLIENT_ID = '6efa8e49fdf64e0c9c6161b3951d1e77'; 
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/homepage.html'; 
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read'
].join(' ');

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64urlencode(digest);
}

function base64urlencode(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Check if token is expired
function isTokenExpired() {
  const expiryTime = localStorage.getItem('spotifyTokenExpiry');
  if (!expiryTime) return true;
  return Date.now() > parseInt(expiryTime);
}

// Validate token without redirecting
async function validateToken() {
  const accessToken = localStorage.getItem('spotifyAccessToken');
  const expiryTime = localStorage.getItem('spotifyTokenExpiry');
  const currentTime = Date.now();

  console.log('validateToken called.');
  console.log('Stored accessToken:', accessToken ? 'Exists' : 'Does not exist');
  console.log('Stored expiryTime:', expiryTime);
  console.log('Current time:', currentTime);

  if (!accessToken || !expiryTime || currentTime > parseInt(expiryTime)) {
    console.log('Token is invalid or expired. Returning null.');
    return null;
  }
  console.log('Token is valid. Returning accessToken.');
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
    } else {
      // If we have a valid token and are not on the login page, render the music UI
      const floatingPlayer = document.getElementById('floating-spotify-player');
      if (floatingPlayer) {
        await renderMusicUI(floatingPlayer);
      }
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
  // Check for access token in URL first
  checkForAccessToken();
  
  // Then handle auth state
  const accessToken = await handleAuthState();
  
  // If no token, render the login UI immediately
  if (!accessToken) {
    const floatingPlayer = document.getElementById('floating-spotify-player');
    if (floatingPlayer) {
      floatingPlayer.innerHTML = `
        <button onclick="initiateSpotifyLogin()" class="spotify-bar-btn">
          <img src="Images/social.png" alt="Spotify"> Play some music?
        </button>
      `;
    }
  }
});
async function initiateSpotifyLogin() {
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = {
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'true',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  };
  
  Object.keys(params).forEach(key => {
    authUrl.searchParams.append(key, params[key]);
  });
  
  console.log('Generated Spotify login URL:', authUrl.toString());
  window.location.href = authUrl.toString();
}

async function exchangeCodeForTokens(code) {
  const codeVerifier = localStorage.getItem('spotify_code_verifier');

  const tokenUrl = new URL('https://accounts.spotify.com/api/token');

  const params = {
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_verifier: codeVerifier
  };

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString()
    });

    if (!response.ok) {
      throw new Error(`Spotify token exchange error: ${response.status}`);
    }

    const data = await response.json();
    
    // Store tokens and expiry
    localStorage.setItem('spotifyAccessToken', data.access_token);
    localStorage.setItem('spotifyRefreshToken', data.refresh_token);
    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('spotifyTokenExpiry', expiryTime.toString());

    // Remove code verifier
    localStorage.removeItem('spotify_code_verifier');

    console.log('Successfully exchanged code for tokens.', data);

    // --- Fetch User Profile to get product type ---
    try {
      const userProfile = await fetchSpotifyData('/me', data.access_token);
      console.log('Spotify user profile:', userProfile);
      if (userProfile && userProfile.product) {
        localStorage.setItem('spotifyProductType', userProfile.product);
        console.log('Stored Spotify product type:', userProfile.product);
      }
    } catch (profileError) {
      console.error('Failed to fetch Spotify user profile:', profileError);
      // Continue even if fetching profile fails, but product type won't be available
    }
    // -------------------------------------------------

    // Check for stored technique ID and navigate if found
    const lastTechniqueId = localStorage.getItem('lastTechniqueId');
    if (lastTechniqueId) {
        localStorage.removeItem('lastTechniqueId'); // Clean up stored ID
        // Find and trigger click on the corresponding technique button
        const techniqueButton = document.querySelector(`.technique-button[data-technique="${lastTechniqueId}"]`);
        if (techniqueButton) {
            techniqueButton.click(); // Simulate click to show the technique
        }
    }

    // Also render the music UI after successful token exchange
    const floatingPlayer = document.getElementById('floating-spotify-player');
    if (floatingPlayer) {
      await renderMusicUI(floatingPlayer);
    }

  } catch (error) {
    console.error('Token exchange failed:', error);
    // Handle error (e.g., show error message to user)
  }
}

function checkForAccessToken() {
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  const accessToken = hashParams.get('access_token'); // Still check for old token in hash for backward compatibility

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  
  // Clear parameters from URL
  if (code || error || accessToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (code) {
    console.log('Authorization code found in URL.', code);
    exchangeCodeForTokens(code);
  } else if (accessToken) { // Handle old implicit grant flow if necessary
    console.log('Old access token found in hash.', accessToken);
    // Process old token - store and update UI
    const expiresIn = hashParams.get('expires_in');
    localStorage.setItem('spotifyAccessToken', accessToken);
    const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
    localStorage.setItem('spotifyTokenExpiry', expiryTime.toString());
    alert('Successfully connected to Spotify (Implicit Grant)! Please consider updating to a newer flow.');
    
  } else if (error) {
    console.error('Spotify authorization error:', error);
    alert(`Spotify authorization failed: ${error}`);
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
window.renderMusicUI = renderMusicUI;
window.initiateSpotifyLogin = initiateSpotifyLogin;
window.searchSpotify = searchSpotify;
window.playSpotifyItem = playSpotifyItem;

async function renderMusicUI(container) {
  console.log('renderMusicUI called.', { container: !!container });
  const accessToken = await validateToken();
  console.log('renderMusicUI - AccessToken from validateToken:', accessToken ? 'Exists' : 'Does not exist');

  if (accessToken) {
    // Check if the music UI is already rendered
    if (container && !container.querySelector('.music-loggedin-ui')) {
      container.innerHTML = `
        <div class="music-loggedin-ui">
          <h3>Spotify</h3>
          <div class="search-section">
            <input type="text" id="spotifySearchInput" placeholder="Search Spotify..." />
            <button onclick="searchSpotify()">Search</button>
          </div>
          <div id="spotify-results-area">
            <!-- Search results or embedded player will go here -->
          </div>
        </div>
      `;
      
      // Add collapsed class initially
      container.classList.add('collapsed');
      
      // Add click handler to toggle expanded/collapsed state
      container.addEventListener('click', (e) => {
        if (container.classList.contains('collapsed')) {
          container.classList.remove('collapsed');
          container.classList.add('expanded');
        }
      });

      // Add click handler to collapse when clicking outside
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && container.classList.contains('expanded')) {
          container.classList.remove('expanded');
          container.classList.add('collapsed');
        }
      });

      console.log('renderMusicUI - Rendered logged-in UI.');
    }
  } else {
    // Check if the login button is already rendered
    if (container && !container.querySelector('.spotify-bar-btn')) {
      container.innerHTML = `
        <button onclick="initiateSpotifyLogin()" class="spotify-bar-btn">
          <img src="Images/social.png" alt="Spotify"> Play some music?
        </button>
      `;
      console.log('renderMusicUI - Rendered logged-out UI.');
    }
  }
}

async function searchSpotify() {
  const queryInput = document.getElementById('spotifySearchInput');
  const resultsArea = document.getElementById('spotify-results-area');
  if (!queryInput || !resultsArea) return;

  const query = queryInput.value.trim();
  if (!query) {
    resultsArea.innerHTML = '<p>Please enter a search term.</p>';
    return;
  }

  const accessToken = await validateToken();
  if (!accessToken) {
    resultsArea.innerHTML = '<p>Please log in to Spotify to search.</p>';
    return;
  }

  // Clear previous results
  resultsArea.innerHTML = '<p>Searching...</p>';

  try {
    // Search for tracks and playlists
    const data = await fetchSpotifyData(`/search?q=${encodeURIComponent(query)}&type=track,playlist&limit=10`, accessToken);
    console.log('Spotify search results:', data);

    // Check if tracks or playlists data and items exist and have items
    const hasTracks = data.tracks && data.tracks.items && data.tracks.items.length > 0;
    const hasPlaylists = data.playlists && data.playlists.items && data.playlists.items.length > 0;

    if (!hasTracks && !hasPlaylists) {
      resultsArea.innerHTML = '<p>No results found.</p>';
      return;
    }

    let resultsHtml = '<ul style="list-style: none; padding: 0;">';

    // Add track results
    if (hasTracks) {
        resultsHtml += '<li><strong>Tracks:</strong></li>';
        data.tracks.items.forEach(track => {
            if (track) {
                resultsHtml += `<li><a href="#" data-uri="${track.uri}" onclick="playSpotifyItem('${track.uri}'); return false;" style="color: white; text-decoration: none;">${track.name} by ${track.artists.map(artist => artist.name).join(', ')}</a></li>`;
            }
        });
    }

    // Add playlist results
    if (hasPlaylists) {
        resultsHtml += '<li><strong>Playlists:</strong></li>';
        data.playlists.items.forEach(playlist => {
            if (playlist) {
                resultsHtml += `<li><a href="#" data-uri="${playlist.uri}" onclick="playSpotifyItem('${playlist.uri}'); return false;" style="color: white; text-decoration: none;">${playlist.name} by ${playlist.owner.display_name}</a></li>`;
            }
        });
    }

    resultsHtml += '</ul>';
    resultsArea.innerHTML = resultsHtml;

  } catch (error) {
    resultsArea.innerHTML = '<p>Error searching Spotify.</p>';
    console.error('Spotify search error:', error);
    if (error.message.includes('Spotify API error')) {
      console.error('Spotify API responded with an error. Status:', error.message.split(':')[1]);
    } else {
      console.error('An unexpected error occurred during Spotify search.', error);
    }
  }
}

// Function to play a Spotify item using its URI (will be implemented next)
function playSpotifyItem(uri) {
    console.log('Attempting to play Spotify item:', uri);
    const resultsArea = document.getElementById('spotify-results-area');
    if (!resultsArea) return;

    // Clear previous content and embed the Spotify player
    resultsArea.innerHTML = `
        <iframe src="https://open.spotify.com/embed/${uri.split(':')[1]}/${uri.split(':')[2]}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    `;
}