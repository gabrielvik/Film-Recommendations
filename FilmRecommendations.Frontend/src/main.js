import './style.css';

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const movieRecommendations = document.getElementById('movieRecommendations');
const loadingIndicator = document.getElementById('loadingIndicator');
const themeSwitcher = document.getElementById('themeSwitcher');

themeSwitcher.addEventListener('click', () => {
  // Toggle dark class on the <html> element
  document.documentElement.classList.toggle('dark');
});

// Handle suggestion bubbles
document.querySelectorAll('.suggestion').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    promptInput.value = bubble.textContent.trim();
  });
});

// Handle form submission dummy data
// promptForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const userPrompt = promptInput.value.trim();
//   if (!userPrompt) return;

//   // Clear previous recommendations
//   movieRecommendations.innerHTML = '';

//   // Simulate an AI response (replace with your real fetch to .NET or other backend)
//   setTimeout(() => {
//     // Dummy movie data with extra details
//     const movies = [
//       {
//         title: 'Interstellar',
//         releaseYear: '2014',
//         poster: 'https://m.media-amazon.com/images/I/91vIHsL-zjL._AC_SY879_.jpg',
//         plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
//         rating: '8.6',
//         director: 'Christopher Nolan',
//         actors: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
//         genre: 'Adventure, Drama, Sci-Fi',
//         length: '169 min',
//         streaming: 'Netflix, Amazon Prime'
//       },
//       {
//         title: 'Inception',
//         releaseYear: '2010',
//         poster: 'https://m.media-amazon.com/images/I/71txPolRqCL._AC_SY879_.jpg',
//         plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
//         rating: '8.8',
//         director: 'Christopher Nolan',
//         actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
//         genre: 'Action, Adventure, Sci-Fi',
//         length: '148 min',
//         streaming: 'Netflix, Hulu'
//       },
//       {
//         title: 'The Dark Knight',
//         releaseYear: '2008',
//         poster: 'https://m.media-amazon.com/images/I/51YbLNGpkpL._AC_.jpg',
//         plot: 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.',
//         rating: '9.0',
//         director: 'Christopher Nolan',
//         actors: 'Christian Bale, Heath Ledger, Aaron Eckhart',
//         genre: 'Action, Crime, Drama',
//         length: '152 min',
//         streaming: 'HBO Max'
//       }
//     ];
//     displayMovies(movies);
//   }, 1000);
// });

// Handle form submission with API call
promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return;

  // Clear previous recommendations
  movieRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');


   // Build the request URL with encoded prompt
   const apiUrl = `http://localhost:5291/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(userPrompt)}`;

  // Fetch movie recommendations from the backend API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Error fetching film recommendations:', response.statusText);
      return;
    }
    const movies = await response.json();
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
      'dark:bg-gray-800', 
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


// Function to show detailed movie information in the modal
// function showMovieDetails(movie) {
//   const modal = document.getElementById('movieDetailsModal');
//   const modalContent = document.getElementById('movieDetailsContent');
  
//   // Populate modal content with movie details and interactive buttons
//   modalContent.innerHTML = `
//     <div class="flex flex-col md:flex-row">
//       <img src="${movie.poster}" alt="${movie.title}" class="w-full md:w-1/3 rounded-lg object-cover">
//       <div class="mt-4 md:mt-0 md:ml-6">
//         <h2 class="text-2xl font-bold mb-2">${movie.title} (${movie.releaseYear})</h2>
//         <p class="mb-2"><span class="font-semibold">Plot:</span> ${movie.plot}</p>
//         <p class="mb-2"><span class="font-semibold">Rating:</span> ${movie.rating}</p>
//         <p class="mb-2"><span class="font-semibold">Director:</span> ${movie.director}</p>
//         <p class="mb-2"><span class="font-semibold">Actors:</span> ${movie.actors}</p>
//         <p class="mb-2"><span class="font-semibold">Genre:</span> ${movie.genre}</p>
//         <p class="mb-2"><span class="font-semibold">Length:</span> ${movie.length}</p>
//         <p class="mb-2"><span class="font-semibold">Streaming:</span> ${movie.streaming}</p>
//         <div class="mt-4 flex gap-4">
//           <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Seen</button>
//           <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Save</button>
//           <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Like</button>
//         </div>
//       </div>
//     </div>
//   `;
  
//   // Show the modal
//   modal.classList.remove('hidden');
// }

function showMovieDetails(movie) {
  const modal = document.getElementById('movieDetailsModal');
  const modalContent = document.getElementById('movieDetailsContent');
  
  // Display a temporary loading message in the modal
  modalContent.innerHTML = `<div class="text-center p-4">Loading movie details...</div>`;
  modal.classList.remove('hidden');

  // Fetch detailed movie data using the movie_id property from the selected movie.
  fetch(`http://localhost:5291/FilmRecomendations/GetMovieDetails/${movie.movie_id}`)
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
              <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Like</button>
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
