import './style.css';

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const movieRecommendations = document.getElementById('movieRecommendations');

// Handle suggestion bubbles
document.querySelectorAll('.suggestion').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    promptInput.value = bubble.textContent.trim();
  });
});

// Handle form submission
promptForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return;

  // Clear previous recommendations
  movieRecommendations.innerHTML = '';

  // Simulate an AI response (replace with your real fetch to .NET or other backend)
  setTimeout(() => {
    // Dummy movie data with extra details
    const movies = [
      {
        title: 'Interstellar',
        releaseYear: '2014',
        poster: 'https://m.media-amazon.com/images/I/91vIHsL-zjL._AC_SY879_.jpg',
        plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
        rating: '8.6',
        director: 'Christopher Nolan',
        actors: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
        genre: 'Adventure, Drama, Sci-Fi',
        length: '169 min',
        streaming: 'Netflix, Amazon Prime'
      },
      {
        title: 'Inception',
        releaseYear: '2010',
        poster: 'https://m.media-amazon.com/images/I/71txPolRqCL._AC_SY879_.jpg',
        plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
        rating: '8.8',
        director: 'Christopher Nolan',
        actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
        genre: 'Action, Adventure, Sci-Fi',
        length: '148 min',
        streaming: 'Netflix, Hulu'
      },
      {
        title: 'The Dark Knight',
        releaseYear: '2008',
        poster: 'https://m.media-amazon.com/images/I/51YbLNGpkpL._AC_.jpg',
        plot: 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.',
        rating: '9.0',
        director: 'Christopher Nolan',
        actors: 'Christian Bale, Heath Ledger, Aaron Eckhart',
        genre: 'Action, Crime, Drama',
        length: '152 min',
        streaming: 'HBO Max'
      }
    ];
    displayMovies(movies);
  }, 1000);
});

// Utility function to display movie recommendations with smooth transitions, hover scaling, and a click event to show details
function displayMovies(movies) {
  movies.forEach((movie) => {
    // Create the card container with additional classes for hover shadow, transition, scaling on hover, and appear animation
    const movieCard = document.createElement('div');
    movieCard.classList.add(
      'bg-gray-800',
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
    posterImg.src = movie.poster;
    posterImg.alt = movie.title;
    posterImg.classList.add('w-full', 'h-64', 'object-cover');

    // Create the movie title container
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-4');
    
    const releaseYearText = document.createElement('h5');
    releaseYearText.classList.add('text-l', 'font-semibold');
    releaseYearText.textContent = movie.releaseYear;
    
    const titleText = document.createElement('h2');
    titleText.classList.add('text-lg', 'font-semibold');
    titleText.textContent = movie.title;

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

// Function to show detailed movie information in the modal
function showMovieDetails(movie) {
  const modal = document.getElementById('movieDetailsModal');
  const modalContent = document.getElementById('movieDetailsContent');
  
  // Populate modal content with movie details and interactive buttons
  modalContent.innerHTML = `
    <div class="flex flex-col md:flex-row">
      <img src="${movie.poster}" alt="${movie.title}" class="w-full md:w-1/3 rounded-lg object-cover">
      <div class="mt-4 md:mt-0 md:ml-6">
        <h2 class="text-2xl font-bold mb-2">${movie.title} (${movie.releaseYear})</h2>
        <p class="mb-2"><span class="font-semibold">Plot:</span> ${movie.plot}</p>
        <p class="mb-2"><span class="font-semibold">Rating:</span> ${movie.rating}</p>
        <p class="mb-2"><span class="font-semibold">Director:</span> ${movie.director}</p>
        <p class="mb-2"><span class="font-semibold">Actors:</span> ${movie.actors}</p>
        <p class="mb-2"><span class="font-semibold">Genre:</span> ${movie.genre}</p>
        <p class="mb-2"><span class="font-semibold">Length:</span> ${movie.length}</p>
        <p class="mb-2"><span class="font-semibold">Streaming:</span> ${movie.streaming}</p>
        <div class="mt-4 flex gap-4">
          <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Seen</button>
          <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Save</button>
          <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Like</button>
        </div>
      </div>
    </div>
  `;
  
  // Show the modal
  modal.classList.remove('hidden');
}

// Event listener to close the modal and return to the movie grid
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('movieDetailsModal').classList.add('hidden');
});
