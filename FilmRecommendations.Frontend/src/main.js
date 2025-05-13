import './style.css';

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const contentRecommendations = document.getElementById('contentRecommendations');
const loadingIndicator = document.getElementById('loadingIndicator');
const themeSwitcher = document.getElementById('themeSwitcher');
const contentTypeToggle = document.getElementById('contentTypeToggle');
const contentTypeText = document.getElementById('contentTypeText');

// Default content type is 'movies'
let currentContentType = localStorage.getItem('contentType') || 'movies';

// Set the initial state of the toggle
updateContentTypeUI();

// Toggle content type and save the setting in localStorage
contentTypeToggle.addEventListener('click', () => {
  currentContentType = currentContentType === 'movies' ? 'series' : 'movies';
  localStorage.setItem('contentType', currentContentType);
  updateContentTypeUI();
  
  // Clear displayed results when switching content type
  contentRecommendations.innerHTML = '';
  
  // Update the placeholder text based on content type
  if (currentContentType === 'movies') {
    promptInput.placeholder = "What kind of movie are you in the mood for?";
  } else {
    promptInput.placeholder = "What kind of TV series are you in the mood for?";
  }
});

function updateContentTypeUI() {
  // Update toggle appearance
  if (currentContentType === 'movies') {
    contentTypeToggle.classList.remove('bg-indigo-600');
    contentTypeToggle.classList.add('bg-blue-600');
    contentTypeText.textContent = 'Movies';
  } else {
    contentTypeToggle.classList.remove('bg-blue-600');
    contentTypeToggle.classList.add('bg-indigo-600');
    contentTypeText.textContent = 'Series';
  }
}

// Update the DOMContentLoaded event handler to properly restore the grid layout
window.addEventListener('DOMContentLoaded', () => {
  // Set the correct placeholder text based on content type
  if (currentContentType === 'movies') {
    promptInput.placeholder = "What kind of movie are you in the mood for?";
  } else {
    promptInput.placeholder = "What kind of TV series are you in the mood for?";
  }

  // Restore saved content if available
  const savedContent = sessionStorage.getItem(`${currentContentType}Recommendations`);
  if (savedContent) {
    const content = JSON.parse(savedContent);
    
    // Ensure contentRecommendations has the correct grid classes if we have results
    if (content.length > 0) {
      contentRecommendations.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      contentRecommendations.classList.remove('flex', 'items-center', 'justify-center');
      
      // Restore the last search query to the input field
      const lastQuery = sessionStorage.getItem(`lastSearch${currentContentType.charAt(0).toUpperCase() + currentContentType.slice(1)}Query`);
      if (lastQuery) {
        promptInput.value = lastQuery;
      }
    }
    
    // Display the saved content
    if (currentContentType === 'movies') {
      displayMovies(content);
    } else {
      displaySeries(content);
    }
  }
});

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
  contentRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  // Build the request URL with encoded prompt
  let apiUrl;
  if (currentContentType === 'movies') {
    apiUrl = `https://localhost:7103/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(userPrompt)}`;
  } else {
    apiUrl = `https://localhost:7103/SeriesRecommendations/GetSeriesRecommendation?prompt=${encodeURIComponent(userPrompt)}`;
  }

  // Fetch recommendations from the backend API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`Error fetching ${currentContentType} recommendations:`, response.statusText);
      return;
    }
    const content = await response.json();

    // Save both the query and results regardless of whether we found content
    sessionStorage.setItem(`lastSearch${currentContentType.charAt(0).toUpperCase() + currentContentType.slice(1)}Query`, userPrompt);
    sessionStorage.setItem(`${currentContentType}Recommendations`, JSON.stringify(content));

    if (content.length === 0) {
      // Remove grid layout classes
      contentRecommendations.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      // Add flex layout classes to center the content
      contentRecommendations.classList.add('flex', 'items-center', 'justify-center');
      contentRecommendations.innerHTML = `<div class="text-center p-4">No ${currentContentType} recommendations could be found for your query. Please try another search.</div>`;
      return;
    }
    
    console.log(`${currentContentType} recommendations:`, content);
    
    // Set the grid layout for the recommendations
    contentRecommendations.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
    contentRecommendations.classList.remove('flex', 'items-center', 'justify-center');
    
    if (currentContentType === 'movies') {
      displayMovies(content);
    } else {
      displaySeries(content);
    }
  } catch (error) {
    console.error(`Error fetching ${currentContentType} recommendations:`, error);
  } finally {
    // Hide the loading indicator after completion
    loadingIndicator.classList.add('hidden');
  }
});

// FIXED: Changed movie card creation to remove transparency issues and hover effects
function displayMovies(movies) {
  movies.forEach((movie) => {
    // Create the card container with modified classes to remove transparency and scale effects
    const movieCard = document.createElement('div');
    movieCard.classList.add(
      'movie-card',
      'bg-white',     
      'dark:bg-gray-700', 
      'rounded-lg',
      'overflow-hidden',
      'shadow-lg',
      'hover:shadow-xl',
      'transition',
      'duration-300',
      'hover:scale-105',
      'opacity-0',
      'cursor-pointer'
    );

    // Create the movie poster image
    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_path;
    posterImg.alt = movie.movie_name;
    posterImg.classList.add('w-full', 'h-64', 'object-cover');

    // Create the movie title container
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-4');
    
    const releaseYearText = document.createElement('h5');
    releaseYearText.classList.add('text-l', 'font-semibold', 'dark:text-gray-200');
    releaseYearText.textContent = `(${movie.release_year})`;
    
    const titleText = document.createElement('h2');
    titleText.classList.add('text-lg', 'font-semibold', 'dark:text-white');
    titleText.textContent = movie.movie_name;

    titleDiv.appendChild(titleText);
    titleDiv.appendChild(releaseYearText);
    movieCard.appendChild(posterImg);
    movieCard.appendChild(titleDiv);

    // Add click event to show detailed movie info
    movieCard.addEventListener('click', () => showMovieDetails(movie));

    contentRecommendations.appendChild(movieCard);

    // Trigger the appear animation after the element is added to the DOM
    requestAnimationFrame(() => {
      movieCard.classList.remove('opacity-0');
      movieCard.classList.add('opacity-100');
    });
  });
}

function displaySeries(seriesList) {
  seriesList.forEach((series) => {
    // Create the card container
    const seriesCard = document.createElement('div');
    seriesCard.classList.add(
      'series-card',
      'bg-white',     
      'dark:bg-gray-700', 
      'rounded-lg',
      'overflow-hidden',
      'shadow-lg',
      'hover:shadow-xl',
      'transition',
      'duration-300',
      'hover:scale-105',
      'opacity-0',
      'cursor-pointer'
    );

    // Create the series poster image
    const posterImg = document.createElement('img');
    posterImg.src = series.poster_path;
    posterImg.alt = series.series_name;
    posterImg.classList.add('w-full', 'h-64', 'object-cover');

    // Create the series title container
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-4');
    
    const firstAirYearText = document.createElement('h5');
    firstAirYearText.classList.add('text-l', 'font-semibold', 'dark:text-gray-200');
    firstAirYearText.textContent = `(${series.first_air_year})`;
    
    const titleText = document.createElement('h2');
    titleText.classList.add('text-lg', 'font-semibold', 'dark:text-white');
    titleText.textContent = series.series_name;

    titleDiv.appendChild(titleText);
    titleDiv.appendChild(firstAirYearText);
    seriesCard.appendChild(posterImg);
    seriesCard.appendChild(titleDiv);

    // Add click event to show detailed series info
    seriesCard.addEventListener('click', () => showSeriesDetails(series));

    contentRecommendations.appendChild(seriesCard);

    // Trigger the appear animation after the element is added to the DOM
    requestAnimationFrame(() => {
      seriesCard.classList.remove('opacity-0');
      seriesCard.classList.add('opacity-100');
    });
  });
}

function showMovieDetails(movie) {
  // Save the selected movie for later use
  sessionStorage.setItem('selectedMovie', JSON.stringify(movie));
  
  const movieSlug = movie.movie_name.toLowerCase().replace(/\s+/g, '-');
  
  window.location.href = `movie-details.html?movie=${movieSlug}`;
}

function showSeriesDetails(series) {
  // Save the selected series for later use
  sessionStorage.setItem('selectedSeries', JSON.stringify(series));
  
  const seriesSlug = series.series_name.toLowerCase().replace(/\s+/g, '-');
  
  window.location.href = `series-details.html?series=${seriesSlug}`;
}

// Store the last query to compare with the current one for each content type
let lastSearchMoviesQuery = sessionStorage.getItem('lastSearchMoviesQuery') || '';
let lastSearchSeriesQuery = sessionStorage.getItem('lastSearchSeriesQuery') || '';

// Listen for changes on the input field
promptInput.addEventListener('input', () => {
  const currentQuery = promptInput.value.trim();
  const lastQuery = currentContentType === 'movies' ? lastSearchMoviesQuery : lastSearchSeriesQuery;
  
  // Only clear the displayed results, but keep the stored data
  if (currentQuery !== lastQuery) {
    contentRecommendations.innerHTML = '';
    
    if (currentContentType === 'movies') {
      lastSearchMoviesQuery = currentQuery;
    } else {
      lastSearchSeriesQuery = currentQuery;
    }
  }
});