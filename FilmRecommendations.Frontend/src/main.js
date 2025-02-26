import './style.css';

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const contentRecommendations = document.getElementById('movieRecommendations');
const loadingIndicator = document.getElementById('loadingIndicator');
const themeSwitcher = document.getElementById('themeSwitcher');
const contentDetailsModal = document.getElementById('contentDetailsModal');
const contentDetailsContent = document.getElementById('contentDetailsContent');
const seasonDetailsModal = document.getElementById('seasonDetailsModal');
const seasonDetailsContent = document.getElementById('seasonDetailsContent');

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
    
    // Set the appropriate content type based on the suggestion class
    if (bubble.classList.contains('movie-suggestion')) {
      document.querySelector('input[name="contentType"][value="movies"]').checked = true;
    } else if (bubble.classList.contains('series-suggestion')) {
      document.querySelector('input[name="contentType"][value="series"]').checked = true;
    } else {
      document.querySelector('input[name="contentType"][value="all"]').checked = true;
    }
  });
});

// Handle form submission with API call
promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return;

  // Get selected content type
  const contentType = document.querySelector('input[name="contentType"]:checked').value;

  // Clear previous recommendations
  contentRecommendations.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  // Build the request URL with encoded prompt and content type
  const apiUrl = `https://localhost:7103/ContentRecommendations/GetRecommendations?prompt=${encodeURIComponent(userPrompt)}&contentType=${contentType}`;

  // Fetch content recommendations from the backend API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Error fetching content recommendations:', response.statusText);
      return;
    }
    const content = await response.json();
    if (content.length === 0) {
      // Remove grid layout classes
      contentRecommendations.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      // Add flex layout classes to center the content
      contentRecommendations.classList.add('flex', 'items-center', 'justify-center');
      contentRecommendations.innerHTML = '<div class="text-center p-4">Hoppsan, ingen rekommendation kunde göras...vänligen prova en annan sökning.</div>';
      return;
    }
    
    // Make sure we have grid layout for content display
    contentRecommendations.classList.remove('flex', 'items-center', 'justify-center');
    contentRecommendations.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
    
    // Display the content
    displayContent(content);
  } catch (error) {
    console.error('Error fetching content recommendations:', error);
  } finally {
    // Hide the loading indicator after completion
    loadingIndicator.classList.add('hidden');
  }
});

function displayContent(contentList) {
  contentList.forEach((content) => {
    // Determine content type (movie or series)
    const isMovie = !content.type || content.type.toLowerCase() === 'movie';
    const contentId = isMovie ? content.movie_id : content.series_id;
    const contentTitle = isMovie ? content.movie_name : content.series_name;
    const contentYear = isMovie ? content.release_year : content.first_air_year;
    const contentType = isMovie ? 'Film' : 'Serie';
    
    // Create badge background class based on content type
    const badgeClass = isMovie ? 'bg-blue-600' : 'bg-green-600';

    // Create the card container with appropriate styling
    const contentCard = document.createElement('div');
    contentCard.classList.add(
      'content-card',
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
    
    // Use data attributes to store content type and ID
    contentCard.dataset.type = isMovie ? 'movie' : 'series';
    contentCard.dataset.id = contentId;

    // Create the content poster image
    const posterImg = document.createElement('img');
    posterImg.src = content.poster_path;
    posterImg.alt = contentTitle;
    posterImg.classList.add('w-full', 'md:h-64', 'object-cover');
    
    // Create a type badge in the top-right corner of the image
    const badgeContainer = document.createElement('div');
    badgeContainer.classList.add('relative');
    
    const badge = document.createElement('span');
    badge.classList.add(
      badgeClass,
      'absolute',
      'top-2',
      'right-2',
      'text-white',
      'px-2',
      'py-1',
      'rounded-md',
      'text-xs',
      'font-bold'
    );
    badge.textContent = contentType;
    
    badgeContainer.appendChild(posterImg);
    badgeContainer.appendChild(badge);

    // Create the content title container
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-4');
    
    const yearText = document.createElement('h5');
    yearText.classList.add('text-l', 'font-semibold');
    yearText.textContent = contentYear;
    
    const titleText = document.createElement('h2');
    titleText.classList.add('text-lg', 'font-semibold');
    titleText.textContent = contentTitle;

    titleDiv.appendChild(yearText);
    titleDiv.appendChild(titleText);
    contentCard.appendChild(badgeContainer);
    contentCard.appendChild(titleDiv);

    // Add click event to show detailed content info
    contentCard.addEventListener('click', () => {
      if (isMovie) {
        showMovieDetails(content);
      } else {
        showTVSeriesDetails(content);
      }
    });

    contentRecommendations.appendChild(contentCard);

    // Trigger the appear animation after the element is added to the DOM
    requestAnimationFrame(() => {
      contentCard.classList.remove('opacity-0', 'scale-95');
      contentCard.classList.add('opacity-100', 'scale-100');
    });
  });
}

function showMovieDetails(movie) {
  contentDetailsContent.innerHTML = `<div class="text-center p-4">Loading movie details...</div>`;
  contentDetailsModal.classList.remove('hidden');

  // Fetch detailed movie data using the movie_id property
  fetch(`https://localhost:7103/FilmRecomendations/GetMovieDetails/${movie.movie_id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching movie details.');
      }
      return response.json();
    })
    .then(data => {
      // Enhance the request to fetch trailers
      return Promise.all([
        data,
        fetch(`https://localhost:7103/FilmRecomendations/GetMovieTrailers/${movie.movie_id}`)
          .then(response => response.ok ? response.json() : [])
      ]);
    })
    .then(([data, trailers]) => {
      // Build a trailer section if trailers exist
      let trailerSection = '';
      if (trailers && trailers.length > 0) {
        const trailer = trailers[0]; // Use the first trailer
        trailerSection = `
          <div class="mt-4">
            <h3 class="text-xl font-bold mb-2">Trailer</h3>
            <div class="aspect-w-16 aspect-h-9">
              <iframe 
                src="https://www.youtube.com/embed/${trailer.key}" 
                allowfullscreen 
                class="w-full h-64 rounded"
              ></iframe>
            </div>
          </div>
        `;
      }
      
      // Display the movie details with trailer
      contentDetailsContent.innerHTML = `
        <div class="flex flex-col md:flex-row">
          <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}" class="w-full md:w-1/3 rounded-lg object-cover">
          <div class="mt-4 md:mt-0 md:ml-6 flex-1">
            <div class="flex items-center mb-2">
              <h2 class="text-2xl font-bold">${data.title || data.original_title}</h2>
              <span class="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">Film</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">${data.release_date ? data.release_date.substring(0, 4) : ''}</p>
            <p class="my-4">${data.overview || 'No overview available.'}</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="mb-2"><span class="font-semibold">Betyg:</span> ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}/10</p>
                <p class="mb-2"><span class="font-semibold">Längd:</span> ${data.runtime || 'N/A'} min</p>
              </div>
              <div>
                <p class="mb-2"><span class="font-semibold">Genres:</span> ${data.genres ? data.genres.map(genre => genre.name).join(', ') : 'N/A'}</p>
                <p class="mb-2"><span class="font-semibold">Språk:</span> ${data.original_language ? data.original_language.toUpperCase() : 'N/A'}</p>
              </div>
            </div>
            ${trailerSection}
            <div class="mt-6 flex gap-4">
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Titta senare</button>
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Gilla</button>
            </div>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error(error);
      contentDetailsContent.innerHTML = `<div class="text-center p-4">Error loading movie details.</div>`;
    });
}

function showTVSeriesDetails(series) {
  contentDetailsContent.innerHTML = `<div class="text-center p-4">Loading series details...</div>`;
  contentDetailsModal.classList.remove('hidden');

  // Fetch detailed TV series data using the series_id property
  fetch(`https://localhost:7103/TVSeries/GetTVSeriesDetails/${series.series_id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching TV series details.');
      }
      return response.json();
    })
    .then(data => {
      // Enhance the request to fetch trailers
      return Promise.all([
        data,
        fetch(`https://localhost:7103/TVSeries/GetTVTrailers/${series.series_id}`)
          .then(response => response.ok ? response.json() : [])
      ]);
    })
    .then(([data, trailers]) => {
      // Build a trailer section if trailers exist
      let trailerSection = '';
      if (trailers && trailers.length > 0) {
        const trailer = trailers[0]; // Use the first trailer
        trailerSection = `
          <div class="mt-4">
            <h3 class="text-xl font-bold mb-2">Trailer</h3>
            <div class="aspect-w-16 aspect-h-9">
              <iframe 
                src="https://www.youtube.com/embed/${trailer.key}" 
                allowfullscreen 
                class="w-full h-64 rounded"
              ></iframe>
            </div>
          </div>
        `;
      }
      
      // Build list of seasons
      let seasonsSection = '';
      if (data.seasons && data.seasons.length > 0) {
        const seasonItems = data.seasons.map(season => {
          if (season.seasonNumber === 0) return ''; // Skip specials/season 0
          return `
            <div class="season-item cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded" 
                 data-series-id="${data.id}" 
                 data-season-number="${season.seasonNumber}">
              <div class="flex items-center">
                <div class="flex-shrink-0 mr-2">
                  <img src="${season.posterPath ? season.posterPath : 'https://image.tmdb.org/t/p/w200' + data.posterPath}" 
                       class="w-12 h-16 object-cover rounded" 
                       alt="${season.name}">
                </div>
                <div>
                  <h4 class="font-semibold">${season.name}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    ${season.episodeCount} avsnitt ${season.airDate ? '• ' + new Date(season.airDate).getFullYear() : ''}
                  </p>
                </div>
<div class="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          `;
        }).join('');
        
        seasonsSection = `
          <div class="mt-4">
            <h3 class="text-xl font-bold mb-2">Säsonger</h3>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              ${seasonItems}
            </div>
          </div>
        `;
      }
      
      // Format runtime for TV show (handling multiple potential runtime values)
      let runtimeText = 'N/A';
      if (data.episodeRunTime && data.episodeRunTime.length > 0) {
        if (data.episodeRunTime.length === 1) {
          runtimeText = `${data.episodeRunTime[0]} min`;
        } else {
          const min = Math.min(...data.episodeRunTime);
          const max = Math.max(...data.episodeRunTime);
          runtimeText = `${min}-${max} min`;
        }
      }
      
      // Display the TV series details
      contentDetailsContent.innerHTML = `
        <div class="flex flex-col md:flex-row">
          <img src="https://image.tmdb.org/t/p/w500${data.posterPath}" alt="${data.name}" class="w-full md:w-1/3 rounded-lg object-cover">
          <div class="mt-4 md:mt-0 md:ml-6 flex-1">
            <div class="flex items-center mb-2">
              <h2 class="text-2xl font-bold">${data.name || data.originalName}</h2>
              <span class="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs">Serie</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">${data.firstAirDate ? data.firstAirDate.substring(0, 4) : ''} - ${data.inProduction ? 'Pågående' : data.lastAirDate ? data.lastAirDate.substring(0, 4) : ''}</p>
            <p class="my-4">${data.overview || 'No overview available.'}</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="mb-2"><span class="font-semibold">Betyg:</span> ${data.voteAverage ? data.voteAverage.toFixed(1) : 'N/A'}/10</p>
                <p class="mb-2"><span class="font-semibold">Avsnittslängd:</span> ${runtimeText}</p>
                <p class="mb-2"><span class="font-semibold">Status:</span> ${data.inProduction ? 'Pågående' : 'Avslutad'}</p>
              </div>
              <div>
                <p class="mb-2"><span class="font-semibold">Genres:</span> ${data.genres ? data.genres.map(genre => genre.name).join(', ') : 'N/A'}</p>
                <p class="mb-2"><span class="font-semibold">Säsonger:</span> ${data.numberOfSeasons || 'N/A'}</p>
                <p class="mb-2"><span class="font-semibold">Avsnitt:</span> ${data.numberOfEpisodes || 'N/A'}</p>
              </div>
            </div>
            ${trailerSection}
            ${seasonsSection}
            <div class="mt-6 flex gap-4">
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Titta senare</button>
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Gilla</button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners to season items
      document.querySelectorAll('.season-item').forEach(item => {
        item.addEventListener('click', () => {
          const seriesId = item.dataset.seriesId;
          const seasonNumber = item.dataset.seasonNumber;
          showSeasonDetails(seriesId, seasonNumber, data.name);
        });
      });
    })
    .catch(error => {
      console.error(error);
      contentDetailsContent.innerHTML = `<div class="text-center p-4">Error loading TV series details.</div>`;
    });
}

function showSeasonDetails(seriesId, seasonNumber, seriesName) {
  seasonDetailsContent.innerHTML = `<div class="text-center p-4">Loading season details...</div>`;
  seasonDetailsModal.classList.remove('hidden');

  // Fetch season details
  fetch(`https://localhost:7103/TVSeries/GetSeasonDetails/${seriesId}/${seasonNumber}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching season details.');
      }
      return response.json();
    })
    .then(data => {
      // Create episode list
      let episodeList = '';
      if (data.episodes && data.episodes.length > 0) {
        episodeList = data.episodes.map(episode => {
          const hasStillImage = episode.stillPath && episode.stillPath !== 'null';
          return `
            <div class="episode-item p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div class="flex">
                ${hasStillImage ? 
                  `<div class="flex-shrink-0 mr-4">
                    <img src="https://image.tmdb.org/t/p/w300${episode.stillPath}" class="w-32 h-18 object-cover rounded" alt="Episode ${episode.episodeNumber}">
                  </div>` : ''}
                <div class="${hasStillImage ? '' : 'w-full'}">
                  <div class="flex justify-between items-start">
                    <h4 class="font-semibold">${episode.episodeNumber}. ${episode.name}</h4>
                    <span class="text-sm text-gray-600 dark:text-gray-400">${episode.runtimeMinutes} min</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${episode.airDate ? new Date(episode.airDate).toLocaleDateString() : 'No air date'}</p>
                  <p class="text-sm line-clamp-2">${episode.overview || 'No overview available.'}</p>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        episodeList = '<p>No episode information available.</p>';
      }
      
      // Display the season details
      seasonDetailsContent.innerHTML = `
        <div>
          <div class="flex items-center mb-4">
            <h2 class="text-2xl font-bold">${seriesName}: ${data.name}</h2>
          </div>
          
          <div class="flex flex-col md:flex-row mb-6">
            <img src="${data.posterPath}" alt="${data.name}" class="w-32 h-48 object-cover rounded-lg mb-4 md:mb-0 md:mr-4">
            <div>
              <p class="mb-2"><span class="font-semibold">Datum:</span> ${data.airDate ? new Date(data.airDate).toLocaleDateString() : 'Okänt'}</p>
              <p class="mb-2"><span class="font-semibold">Antal avsnitt:</span> ${data.episodes ? data.episodes.length : 0}</p>
              <p class="mb-4">${data.overview || 'Ingen översikt tillgänglig.'}</p>
            </div>
          </div>
          
          <h3 class="text-xl font-bold mb-2">Avsnitt</h3>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            ${episodeList}
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error(error);
      seasonDetailsContent.innerHTML = `<div class="text-center p-4">Error loading season details.</div>`;
    });
}

// Event listeners to close modals
document.getElementById('closeModal').addEventListener('click', () => {
  contentDetailsModal.classList.add('hidden');
});

document.getElementById('closeSeasonModal').addEventListener('click', () => {
  seasonDetailsModal.classList.add('hidden');
});

// Close modal when clicking outside of it
contentDetailsModal.addEventListener('click', (e) => {
  if (e.target === contentDetailsModal) {
    contentDetailsModal.classList.add('hidden');
  }
});

seasonDetailsModal.addEventListener('click', (e) => {
  if (e.target === seasonDetailsModal) {
    seasonDetailsModal.classList.add('hidden');
  }
});