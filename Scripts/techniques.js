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

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired on homepage.html");
  try {
    const initialContent = document.querySelector('.main-content > .container');
    const techniqueDisplayArea = document.getElementById('technique-display-area');
    const bottomButtons = document.getElementById('bottom-technique-buttons');
    const aboutUsFooterButton = document.getElementById('about-us-footer-button');
    const homeNavButton = document.querySelector('.nav-links button[onclick*="homepage.html"]');

    if (techniqueDisplayArea) techniqueDisplayArea.style.display = 'none';
    if (bottomButtons) bottomButtons.style.display = 'none';
    if (initialContent) initialContent.style.display = 'flex';
    if (aboutUsFooterButton) aboutUsFooterButton.style.display = 'block';

    const urlParams = new URLSearchParams(window.location.search);
    const technique = urlParams.get('technique');
    if (technique) {
      toggleTechnique(technique);
      if (initialContent) initialContent.style.display = 'none';
      if (techniqueDisplayArea) techniqueDisplayArea.style.display = 'block';
      if (bottomButtons) bottomButtons.style.display = 'flex';
      if (aboutUsFooterButton) aboutUsFooterButton.style.display = 'none';
      document.querySelectorAll('#bottom-technique-buttons .technique-button').forEach(button => {
        button.classList.remove('active');
      });
      const activeBottomButton = document.querySelector(`#bottom-technique-buttons .technique-button[data-technique="${technique}"]`);
      if (activeBottomButton) {
        activeBottomButton.classList.add('active');
      }
    }

    document.addEventListener('click', event => {
      if (event.target.classList.contains('arrow-button')) {
        const targetCardId = event.target.getAttribute('data-target');
        if (targetCardId) {
          showCardById(targetCardId);
        }
      } else if (event.target.classList.contains('technique-button')) {
        const techniqueId = event.target.getAttribute('data-technique');
        if (techniqueId) {
          toggleTechnique(techniqueId);
          if (initialContent) initialContent.style.display = 'none';
          if (techniqueDisplayArea) techniqueDisplayArea.style.display = 'block';
          if (bottomButtons) bottomButtons.style.display = 'flex';
          if (aboutUsFooterButton) aboutUsFooterButton.style.display = 'none';
          document.querySelectorAll('#bottom-technique-buttons .technique-button').forEach(button => {
            button.classList.remove('active');
          });
          const activeBottomButton = document.querySelector(`#bottom-technique-buttons .technique-button[data-technique="${techniqueId}"]`);
          if (activeBottomButton) {
            activeBottomButton.classList.add('active');
          }
        }
      }
    });

     if (homeNavButton) {
       homeNavButton.addEventListener('click', (event) => {
          if (event.target.getAttribute('onclick') && event.target.getAttribute('onclick').includes('homepage.html')) {
              console.log('Homepage Home button clicked. Resetting view.');
             if (initialContent) initialContent.style.display = 'flex';
             if (techniqueDisplayArea) techniqueDisplayArea.style.display = 'none';
             if (bottomButtons) bottomButtons.style.display = 'none';
             if (aboutUsFooterButton) aboutUsFooterButton.style.display = 'block';
             if (window.location.pathname.endsWith('/homepage.html') || window.location.pathname.endsWith('/')) {
                  event.preventDefault(); 
                  window.history.replaceState({}, document.title, window.location.pathname); 
             }
          }
       });
     }

  } catch (error) {
    console.error('Error during DOMContentLoaded in techniques.js:', error);
  }
});
