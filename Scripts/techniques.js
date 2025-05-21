function navigateTo(url) {
  window.location.href = url;
}

const cards = document.querySelectorAll('.flashcard');

function showCardById(cardId) {
  cards.forEach(card => {
    card.style.display = card.id === cardId ? 'block' : 'none';
  });
}

async function isUserLoggedIn() {
  try {
    const spotifyToken = localStorage.getItem('spotifyAccessToken');
    const expiryTime = localStorage.getItem('spotifyTokenExpiry');
    
    if (!spotifyToken || !expiryTime) {
      return false;
    }
    
    // Check if token is expired
    if (Date.now() > parseInt(expiryTime)) {
      // Clear expired token
      localStorage.removeItem('spotifyAccessToken');
      localStorage.removeItem('spotifyTokenExpiry');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

async function renderMusicUI() {
  try {
    const container = document.getElementById("music-ui");
    if (!container) return; // Exit if container doesn't exist
    
    container.innerHTML = ""; // Clear previous content

    const isLoggedIn = await isUserLoggedIn();
    if (!isLoggedIn) {
      // Not logged in – show the "Play some music?" button
      container.innerHTML = `
        <button onclick="navigateTo('spotify.html')" class="spotify-bar-btn">
          <img src="Images/social.png" alt="Spotify"> Play some music?
        </button>
      `;
    } else {
      // Logged in – show both search and genre selection
      container.innerHTML = `
        <div class="music-loggedin-ui">
          <div class="search-section">
            <input type="text" id="songSearch" placeholder="Search for a song..." />
            <button onclick="searchMusic()">Search</button>
          </div>
          
          <div class="genre-section">
            <select id="genreSelect" onchange="handleGenreChange()">
              <option value="">Select a Genre</option>
              <option value="lofi">Lo-Fi Beats</option>
              <option value="classical">Classical Piano</option>
              <option value="ambient">Ambient Study</option>
              <option value="jazz">Jazz for Focus</option>
              <option value="nature">Nature Sounds</option>
              <option value="instrumental">Instrumental Study</option>
              <option value="electronic">Electronic Focus</option>
              <option value="rain">Rain Sounds</option>
              <option value="cafe">Cafe Ambience</option>
              <option value="meditation">Meditation Music</option>
              <option value="white-noise">White Noise</option>
              <option value="binaural">Binaural Beats</option>
            </select>
            <button onclick="playSelectedGenre()">Play Genre</button>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error rendering music UI:', error);
  }
}

function searchMusic() {
  const query = document.getElementById("songSearch")?.value;
  if (query?.trim()) {
    const encoded = encodeURIComponent(query);
    window.open(`https://open.spotify.com/search/${encoded}`, "_blank");
  }
}

function handleGenreChange() {
  const genre = document.getElementById("genreSelect")?.value;
  if (genre) {
    console.log(`Genre selected: ${genre}`);
  }
}

function playSelectedGenre() {
  const genre = document.getElementById("genreSelect")?.value;
  if (genre) {
    // Updated playlist IDs with more curated study music playlists
    const genreMap = {
      'lofi': '37i9dQZF1DXc8kgYqQLMfH', // Lo-Fi Beats
      'classical': '37i9dQZF1DX4OjfOte3n6a', // Peaceful Piano
      'ambient': '37i9dQZF1DX3Ogo9pFvBkY', // Ambient Relaxation
      'jazz': '37i9dQZF1DX0BcQWzuB7ZO', // Jazz Vibes
      'nature': '37i9dQZF1DX4OjfOte3n6a', // Nature Sounds
      'instrumental': '37i9dQZF1DX4OjfOte3n6a', // Instrumental Study
      'electronic': '37i9dQZF1DX3Ogo9pFvBkY', // Electronic Focus
      'rain': '37i9dQZF1DX4OjfOte3n6a', // Rain Sounds
      'cafe': '37i9dQZF1DX4OjfOte3n6a', // Cafe Ambience
      'meditation': '37i9dQZF1DX4OjfOte3n6a', // Meditation Music
      'white-noise': '37i9dQZF1DX4OjfOte3n6a', // White Noise
      'binaural': '37i9dQZF1DX4OjfOte3n6a' // Binaural Beats
    };
    
    const playlistId = genreMap[genre];
    if (playlistId) {
      window.open(`https://open.spotify.com/playlist/${playlistId}`, "_blank");
    } else {
      // Fallback to search if no playlist ID is found
      window.open(`https://open.spotify.com/search/${genre}%20study%20music`, "_blank");
    }
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  try {
    showCardById('card1');

    const arrowButtons = document.querySelectorAll('.arrow-button');
    arrowButtons.forEach(button => {
      const target = button.getAttribute('data-target');
      if (target) {
        button.addEventListener('click', () => {
          showCardById(target.replace('#', ''));
        });
      }
    });

    await renderMusicUI(); // Render music bar based on login state
  } catch (error) {
    console.error('Error initializing page:', error);
  }
});
