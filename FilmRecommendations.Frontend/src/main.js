import './style.css';

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const movieRecommendations = document.getElementById('movieRecommendations');
const loadingIndicator = document.getElementById('loadingIndicator');
const themeSwitcher = document.getElementById('themeSwitcher');

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

// Handle suggestion bubbles
document.querySelectorAll('.suggestion').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    promptInput.value = bubble.textContent.trim();
  });
});

// Handle form submission with API call
promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return;

  // Clear previous recommendations
  movieRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');


   // Build the request URL with encoded prompt
   const apiUrl = `https://localhost:7103/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(userPrompt)}`;

  // Fetch movie recommendations from the backend API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Error fetching film recommendations:', response.statusText);
      return;
    }
    const movies = await response.json();
    if (movies.length === 0) {
      // Remove grid layout classes
      movieRecommendations.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      // Add flex layout classes to center the content
      movieRecommendations.classList.add('flex', 'items-center', 'justify-center');
      movieRecommendations.innerHTML = '<div class="text-center p-4">Hoppsan, ingen rekommendation kunde göras...vänligen prova en annan sökning.</div>';
      return;
    }
    
    console.log('Movies:', movies);
    displayMovies(movies);
  } catch (error) {
    console.error('Error fetching film recommendations:', error);
  } finally {
    // Hide the loading indicator after completion
    loadingIndicator.classList.add('hidden');
  }
});


function displayMovies(movies) {
  movies.forEach((movie) => {
    // Create the card container with additional classes for hover shadow, transition, scaling on hover, and appear animation
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

    // Create the movie poster image
    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_path;
    posterImg.alt = movie.movie_name;
    posterImg.classList.add('w-full', 'md:h-64', 'object-cover');

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

    // Trigger the appear animation after the element is added to the DOM
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

  // Fetch detailed movie data using the movie_id property from the selected movie.
  fetch(`https://localhost:7103/FilmRecomendations/GetMovieDetails/${movie.movie_id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching movie details.');
      }
      return response.json();
    })
    .then(data => {
      // Display the fetched details. Adjust properties based on your DTO
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
              <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Titta senare</button>
              <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Gilla</button>
            </div>
          </div>
        </div>
      `;
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
