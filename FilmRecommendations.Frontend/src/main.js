import './style.css';
import { withAuth } from './auth-utils';

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const movieRecommendations = document.getElementById('movieRecommendations');
const loadingIndicator = document.getElementById('loadingIndicator');
const themeSwitcher = document.getElementById('themeSwitcher');

window.addEventListener('DOMContentLoaded', () => {
  const savedMovies = sessionStorage.getItem('movieRecommendations');
  if (savedMovies) {
    const movies = JSON.parse(savedMovies);
    if (movies.length > 0) {
      movieRecommendations.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      movieRecommendations.classList.remove('flex', 'items-center', 'justify-center');
      const lastQuery = sessionStorage.getItem('lastSearchQuery');
      if (lastQuery) {
        promptInput.value = lastQuery;
      }
    }
    displayMovies(movies);
  }
});

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

themeSwitcher.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  if (document.documentElement.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

document.querySelectorAll('.suggestion').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    promptInput.value = bubble.textContent.trim();
  });
});

promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return;

  movieRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  const apiUrl = `https://localhost:7103/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(userPrompt)}`;

  try {
    const response = await fetch(apiUrl, withAuth());
    if (!response.ok) {
      console.error('Error fetching film recommendations:', response.statusText);
      return;
    }
    const movies = await response.json();
    sessionStorage.setItem('lastSearchQuery', userPrompt);
    sessionStorage.setItem('movieRecommendations', JSON.stringify(movies));

    if (movies.length === 0) {
      movieRecommendations.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      movieRecommendations.classList.add('flex', 'items-center', 'justify-center');
      movieRecommendations.innerHTML = '<div class="text-center p-4">Hoppsan, ingen rekommendation kunde göras...vänligen prova en annan sökning.</div>';
      return;
    }

    console.log('Movies:', movies);
    displayMovies(movies);
  } catch (error) {
    console.error('Error fetching film recommendations:', error);
  } finally {
    loadingIndicator.classList.add('hidden');
  }
});

function displayMovies(movies) {
  movies.forEach((movie) => {
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

    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_path;
    posterImg.alt = movie.movie_name;
    posterImg.classList.add('w-full', 'md:h-64', 'object-cover');

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-4');

    const releaseYearText = document.createElement('h5');
    releaseYearText.classList.add('text-l', 'font-semibold');
    releaseYearText.textContent = `(${movie.release_year})`;

    const titleText = document.createElement('h2');
    titleText.classList.add('text-lg', 'font-semibold');
    titleText.textContent = movie.movie_name;

    titleDiv.appendChild(titleText);
    titleDiv.appendChild(releaseYearText);
    movieCard.appendChild(posterImg);
    movieCard.appendChild(titleDiv);

    movieCard.addEventListener('click', () => showMovieDetails(movie));

    movieRecommendations.appendChild(movieCard);

    requestAnimationFrame(() => {
      movieCard.classList.remove('opacity-0', 'scale-95');
      movieCard.classList.add('opacity-100', 'scale-100');
    });
  });
}

function showMovieDetails(movie) {
  sessionStorage.setItem('selectedMovie', JSON.stringify(movie));
  const movieSlug = movie.movie_name.toLowerCase().replace(/\s+/g, '-');
  window.location.href = `movie-details.html?movie=${movieSlug}`;
}

let lastSearchQuery = sessionStorage.getItem('lastSearchQuery') || '';
promptInput.addEventListener('input', () => {
  const currentQuery = promptInput.value.trim();
  if (currentQuery !== lastSearchQuery) {
    movieRecommendations.innerHTML = '';
    lastSearchQuery = currentQuery;
  }
});
