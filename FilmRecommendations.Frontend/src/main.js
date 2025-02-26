import './style.css';

// State management for the conversation
let currentConversationId = null;
let conversationHistory = [];
let isFirstSearch = true;

// Initial form and elements
const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const themeSwitcher = document.getElementById('themeSwitcher');

// Two-column layout elements
const initialScreen = document.getElementById('initialScreen');
const resultsScreen = document.getElementById('resultsScreen');
const promptFormInline = document.getElementById('promptFormInline');
const promptInputInline = document.getElementById('promptInputInline');

// Shared elements
const movieRecommendations = document.getElementById('movieRecommendations');
const loadingIndicator = document.getElementById('loadingIndicator');
const conversationContainer = document.getElementById('conversationContainer');

// On page load, check localStorage for the preferred theme
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Toggle dark mode and save the setting in localStorage
themeSwitcher.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  if (document.documentElement.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Handle suggestion bubbles for initial screen
document.querySelectorAll('.suggestion').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    promptInput.value = bubble.textContent.trim();
    // Optionally submit the form automatically when a suggestion is clicked
    promptForm.dispatchEvent(new Event('submit'));
  });
});

// Handle form submission on initial screen
promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return;

  // Clear previous recommendations
  movieRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  // Add user message to chat
  addToConversationHistory(userPrompt, 'user');

  try {
    // Fetch movie recommendations from the backend API
    const apiUrl = `https://localhost:7103/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(userPrompt)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Error fetching film recommendations');
    }
    const movies = await response.json();
    
    // Switch to two-column layout if this is the first search
    if (isFirstSearch) {
      initialScreen.classList.add('hidden');
      resultsScreen.classList.remove('hidden');
      isFirstSearch = false;
      
      // Add system response
      addToConversationHistory('Här är några filmrekommendationer för dig:', 'system');
    }
    
    if (movies.length === 0) {
      movieRecommendations.innerHTML = '<div class="text-center p-4">Hoppsan, ingen rekommendation kunde göras...vänligen prova en annan sökning.</div>';
      return;
    }
    
    displayMovies(movies);
  } catch (error) {
    console.error('Error fetching film recommendations:', error);
    movieRecommendations.innerHTML = '<div class="text-center p-4">Något gick fel. Vänligen försök igen.</div>';
  } finally {
    loadingIndicator.classList.add('hidden');
  }
});

// Handle form submission for the inline form in two-column layout
promptFormInline.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userPrompt = promptInputInline.value.trim();
  if (!userPrompt) return;

  // Clear previous recommendations
  movieRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  // Add user message to chat
  addToConversationHistory(userPrompt, 'user');

  try {
    // Fetch movie recommendations from the backend API
    const apiUrl = `https://localhost:7103/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(userPrompt)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Error fetching film recommendations');
    }
    const movies = await response.json();
    
    // Add system response
    addToConversationHistory('Här är några filmrekommendationer för dig:', 'system');
    
    if (movies.length === 0) {
      movieRecommendations.innerHTML = '<div class="text-center p-4">Hoppsan, ingen rekommendation kunde göras...vänligen prova en annan sökning.</div>';
      return;
    }
    
    displayMovies(movies);
  } catch (error) {
    console.error('Error fetching film recommendations:', error);
    movieRecommendations.innerHTML = '<div class="text-center p-4">Något gick fel. Vänligen försök igen.</div>';
  } finally {
    loadingIndicator.classList.add('hidden');
    promptInputInline.value = '';
  }
});

// Helper functions
function addToConversationHistory(message, sender) {
  // Add message to conversation history
  conversationHistory.push({ message, sender });
  
  // Create and display conversation bubble
  const messageBubble = document.createElement('div');
  messageBubble.classList.add(
    'p-3', 
    'rounded-lg', 
    'mb-3', 
    'max-w-[85%]',
    sender === 'user' ? 'ml-auto' : 'mr-auto',
    sender === 'user' ? 'bg-blue-500' : 'bg-gray-300',
    sender === 'user' ? 'text-white' : 'text-gray-800'
  );
  messageBubble.textContent = message;
  
  conversationContainer.appendChild(messageBubble);
  conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

function displayMovies(movies) {
  // Clear previous recommendations
  movieRecommendations.innerHTML = '';
  
  if (!movies || movies.length === 0) {
    movieRecommendations.innerHTML = '<div class="text-center p-4">Hoppsan, ingen rekommendation kunde göras...vänligen prova en annan sökning.</div>';
    return;
  }
  
  movies.forEach((movie) => {
    // Create the card container
    const movieCard = document.createElement('div');
    movieCard.classList.add(
      'movie-card',
      'bg-white',     
      'dark:bg-gray-700', 
      'rounded-lg',
      'overflow-hidden',
      'shadow-lg',
      'hover:shadow-2xl',
      'transition',
      'transform',
      'duration-300',
      'opacity-0',
      'scale-95',
      'hover:scale-105',
      'cursor-pointer'
    );
    
    movieCard.dataset.id = movie.movie_id;

    // Create the movie poster image
    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_path;
    posterImg.alt = movie.movie_name;
    posterImg.classList.add('w-full');  // Let CSS handle the height

    // Create the movie title container
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-4');
    
    const releaseYearText = document.createElement('h5');
    releaseYearText.classList.add('text-l', 'font-semibold');
    releaseYearText.textContent = movie.release_year;
    
    const titleText = document.createElement('h2');
    titleText.classList.add('text-lg', 'font-semibold');
    titleText.textContent = movie.movie_name;

    titleDiv.appendChild(releaseYearText);
    titleDiv.appendChild(titleText);
    
    movieCard.appendChild(posterImg);
    movieCard.appendChild(titleDiv);

    // Add click event to show detailed movie info
    movieCard.addEventListener('click', () => showMovieDetails(movie));

    movieRecommendations.appendChild(movieCard);

    // Trigger the appear animation
    requestAnimationFrame(() => {
      movieCard.classList.remove('opacity-0', 'scale-95');
      movieCard.classList.add('opacity-100', 'scale-100');
    });
  });
}

function showMovieDetails(movie) {
  const modal = document.getElementById('movieDetailsModal');
  const modalContent = document.getElementById('movieDetailsContent');
  
  // Display a temporary loading message in the modal
  modalContent.innerHTML = `<div class="text-center p-4">Loading movie details...</div>`;
  modal.classList.remove('hidden');

  // Fetch detailed movie data
  fetch(`https://localhost:7103/FilmRecomendations/GetMovieDetails/${movie.movie_id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching movie details.');
      }
      return response.json();
    })
    .then(data => {
      // Display the fetched details
      modalContent.innerHTML = `
        <div class="flex flex-col md:flex-row">
          <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.Title}" class="w-full md:w-1/3 rounded-lg object-cover">
          <div class="mt-4 md:mt-0 md:ml-6">
            <h2 class="text-2xl font-bold mb-2">${data.original_title} (${data.release_date.substring(0, 4)})</h2>
            <p class="mb-2"><span class="font-semibold">Plot:</span> ${data.overview}</p>
            <p class="mb-2"><span class="font-semibold">Betyg:</span> ${data.vote_average}</p>
            <p class="mb-2"><span class="font-semibold">Genres:</span> ${data.genres.map(genre => genre.name).join(', ')}</p>
            <p class="mb-2"><span class="font-semibold">Längd:</span> ${data.runtime} min</p>
            <div class="mt-4 flex gap-4">
              <button id="likeMovieBtn" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">👍 Gilla</button>
              <button id="dislikeMovieBtn" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">👎 Ogilla</button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners to modal buttons
      document.getElementById('likeMovieBtn').addEventListener('click', () => {
        modal.classList.add('hidden');
        addToConversationHistory(`Jag gillar "${movie.movie_name}"`, 'user');
        
        // Continue conversation with a follow-up search
        const followUpPrompt = `Visa mig fler filmer som liknar ${movie.movie_name}`;
        promptInputInline.value = followUpPrompt;
        promptFormInline.dispatchEvent(new Event('submit'));
      });
      
      document.getElementById('dislikeMovieBtn').addEventListener('click', () => {
        modal.classList.add('hidden');
        addToConversationHistory(`Jag gillar inte "${movie.movie_name}"`, 'user');
        
        // Continue conversation with a follow-up search
        const followUpPrompt = `Visa mig andra filmer, inte som ${movie.movie_name}`;
        promptInputInline.value = followUpPrompt;
        promptFormInline.dispatchEvent(new Event('submit'));
      });
    })
    .catch(error => {
      console.error(error);
      modalContent.innerHTML = `<div class="text-center p-4">Error loading movie details.</div>`;
    });
}

// Event listener to close the modal and return to the movie grid
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('movieDetailsModal').classList.add('hidden');
});