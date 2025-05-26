function navigateTo(url) {
  window.location.href = url;
}

// Function to show a specific card by its ID within the active technique
function showCardById(cardId) {
  console.log('showCardById called with ID:', cardId);
  const activeTechniqueContent = document.querySelector('#technique-display-area .technique-content.active');
  if (!activeTechniqueContent) {
    console.log('No active technique content found.');
    return;
  }

  const cards = activeTechniqueContent.querySelectorAll('.flashcard');
  cards.forEach(card => card.classList.remove('active-card'));
  console.log('Removed active-card from all cards in the active technique.');

  const targetCard = document.querySelector(cardId);
  if (targetCard) {
    targetCard.classList.add('active-card');
    console.log('Successfully showed card with ID:', cardId);
  } else {
    console.log('Target card not found with ID:', cardId);
  }
  console.log('Current active cards:', activeTechniqueContent.querySelectorAll('.flashcard.active-card').length);
}

// Function to toggle the visible technique section
function toggleTechnique(techniqueId) {
  console.log('toggleTechnique called with ID:', techniqueId);
  
  // Hide the initial homepage content
  const homepageContainer = document.querySelector('.main-content > .container');
  if (homepageContainer) {
    homepageContainer.style.display = 'none';
    console.log('Hid homepage initial container.');
  }

  const allTechniques = document.querySelectorAll('.technique-content');
  allTechniques.forEach(section => {
    section.classList.remove('active');
    section.querySelectorAll('.flashcard').forEach(card => card.classList.remove('active-card'));
  });
  console.log('Removed active class from all techniques and active-card from all their cards.');

  // Hide the bottom technique buttons by default
  const bottomButtons = document.getElementById('bottom-technique-buttons');
    if (bottomButtons) {
        bottomButtons.style.display = 'none';
        console.log('Hid bottom technique buttons.');
    }

  
  const targetSection = document.getElementById(techniqueId);
  if (targetSection) {
    targetSection.classList.add('active');
    console.log(`Activated technique section: ${techniqueId}`);
    const firstCard = targetSection.querySelector('.flashcard');
    if (firstCard) {
      firstCard.classList.add('active-card');
      console.log(`Activated technique: ${techniqueId}, first card: ${firstCard.id}`);
    } else {
      console.log(`No flashcard found in ${techniqueId}`);
    }

    // Show the bottom technique buttons
    if (bottomButtons) {
        bottomButtons.style.display = 'flex';
        console.log('Showed bottom technique buttons.');
    }

  } else {
    console.log(`Technique with ID '${techniqueId}' not found.`);
    // If no technique is found (e.g., navigating to Home), show the initial homepage content
     if (homepageContainer) {
        homepageContainer.style.display = 'flex';
        console.log('Showed homepage initial container.');
    }
  }
  console.log('Current active technique section:', document.querySelectorAll('.technique-content.active').length);
  const activeTech = document.querySelector('.technique-content.active');
  if (activeTech) {
    console.log('Active cards in current active technique:', activeTech.querySelectorAll('.flashcard.active-card').length);
  }
}

async function isUserLoggedIn() {
  try {
    const spotifyToken = localStorage.getItem('spotifyAccessToken');
    const expiryTime = localStorage.getItem('spotifyTokenExpiry');

    if (!spotifyToken || !expiryTime) return false;

    if (Date.now() > parseInt(expiryTime)) {
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
  const container = document.getElementById("music-ui");
  if (!container) return;

  container.innerHTML = "";

  const accessToken = await validateToken(); // defined in spotify.js

  if (accessToken) {
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
  } else {
    container.innerHTML = `
      <button onclick="navigateTo('spotify.html')" class="spotify-bar-btn">
        <img src="Images/social.png" alt="Spotify"> Play some music?
      </button>
    `;
  }
}

window.searchMusic = searchMusic;

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
  const genreMap = {
    'lofi': '37i9dQZF1DXc8kgYqQLMfH',
    'classical': '37i9dQZF1DX4sWSpwq3LiO',
    'ambient': '37i9dQZF1DX4E3UdUs7fUx',
    'jazz': '37i9dQZF1DX0BcQWzuB7ZO',
    'nature': '37i9dQZF1DWXe9gFZP0gtP',
    'instrumental': '37i9dQZF1DX4sWSpwq3LiO',
    'electronic': '37i9dQZF1DX4dyzvuaRJ0n',
    'rain': '37i9dQZF1DX8ymr6UES7vc',
    'cafe': '37i9dQZF1DX6ziVCJnEm59',
    'meditation': '37i9dQZF1DWZqd5JICZI0u',
    'white-noise': '37i9dQZF1DWX83CujKHHOn',
    'binaural': '37i9dQZF1DX3oM43CtKnRV'
  };

  const playlistId = genreMap[genre];
  if (playlistId) {
    window.open(`https://open.spotify.com/playlist/${playlistId}`, "_blank");
  } else {
    window.open(`https://open.spotify.com/search/${genre}%20study%20music`, "_blank");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initially hide all technique sections
    document.querySelectorAll('#technique-display-area .technique-content').forEach(content => {
      content.classList.remove('active');
      content.querySelectorAll('.flashcard').forEach(card => card.classList.remove('active-card'));
    });

    // Delegate click handling for arrows and technique buttons
    document.addEventListener('click', event => {
      if (event.target.classList.contains('arrow-button')) {
        const targetCardId = event.target.getAttribute('data-target');
        if (targetCardId) {
          console.log('Arrow button clicked, target:', targetCardId);
          showCardById(targetCardId);
        }
      } else if (event.target.classList.contains('technique-button')) {
        const techniqueId = event.target.getAttribute('data-technique');
        if (techniqueId) {
          console.log('Technique button clicked. ID:', techniqueId);
          toggleTechnique(techniqueId);
        }
      } else if (event.target.classList.contains('step-nav-button')) { // Add listener for step navigation buttons
          const targetCardId = event.target.getAttribute('data-target');
          if (targetCardId) {
              console.log('Step navigation button clicked, target:', targetCardId);
              showCardById(targetCardId);
          }
      }
    });

    await renderMusicUI();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});
