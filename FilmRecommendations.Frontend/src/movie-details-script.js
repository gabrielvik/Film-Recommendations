// Preserve dark mode setting
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Retrieve the movie data from sessionStorage
const movie = JSON.parse(sessionStorage.getItem('selectedMovie'));

// If no movie data is found, show error message
if (!movie) {
    document.getElementById('movieDetailsContent').innerHTML = `
        <div class="text-center p-4">No movie details available.</div>
    `;
} else {
    // Update URL in the address bar without reloading the page
    const movieSlug = movie.movie_name ? 
        movie.movie_name.toLowerCase().replace(/\s+/g, '-') : 
        movie.title.toLowerCase().replace(/\s+/g, '-');
    
    // Use search parameters instead of changing the path
    const url = new URL(window.location);
    url.searchParams.set('title', movieSlug);
    window.history.replaceState(null, '', url);
    
    // Show loading state
    document.getElementById('movieDetailsContent').innerHTML = `
        <div class="text-center p-4">Loading movie details...</div>
    `;
    
    // Call function to fetch and display movie details
    showMovieDetails(movie);
}

// Helper function to preload images
function preloadImages(sources) {
    sources.forEach(src => {
        if (src) {
            const img = new Image();
            img.src = src;
        }
    });
}

// Function to handle image loading to prevent flickering
function setupImageLoading() {
    const images = document.querySelectorAll('#actorDetailsContent img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });
}

function showMovieDetails(movie) {
    // Get the content container
    const movieDetailsContent = document.getElementById('movieDetailsContent');
    const movieDetailsContainer = document.getElementById('movieDetailsContainer');
    
    // Fetch detailed movie data using the movie_id property from the selected movie
    fetch(`https://localhost:7103/FilmRecomendations/GetMovieDetails/${movie.movie_id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching movie details.');
            }
            return response.json();
        })
        .then(async data => {
            // Set the backdrop image as background if available
            if (data.backdrop_path) {
                console.log("Backdrop path found:", data.backdrop_path);
                const backdropUrl = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
                
                // Adjust the opacity in the rgba function
                const topOpacity = 0.5; // Opacity at the top (0.1-0.7 recommended)
                const bottomOpacity = Math.min(topOpacity + 0.4, 0.95); // More opaque at bottom, maximum 0.95
                
                // Apply gradient with increased opacity at bottom
                movieDetailsContainer.style.backgroundImage = `linear-gradient(to bottom, 
                    rgba(0, 0, 0, ${topOpacity}) 0%, 
                    rgba(0, 0, 0, ${bottomOpacity}) 100%), 
                    url('${backdropUrl}')`;
                movieDetailsContainer.style.backgroundSize = 'cover';
                movieDetailsContainer.style.backgroundPosition = 'center';
                movieDetailsContainer.style.backgroundRepeat = 'no-repeat';
                
                // Add additional styling to ensure visibility of content
                movieDetailsContainer.classList.remove('bg-gray-100', 'dark:bg-gray-800');
                movieDetailsContainer.classList.add('text-white');
            } else {
                console.log("No backdrop path available in data:", data);
            }

            let runtime = convertRuntime(data.runtime);
            data.runtime = runtime;

            // Fetch streaming providers
            let streamingProviders = null;
            try {
                const providersResponse = await fetch(`https://localhost:7103/FilmRecomendations/GetStreamingProviders/${movie.movie_id}`);
                if (providersResponse.ok) {
                    streamingProviders = await providersResponse.json();
                }
            } catch (error) {
                console.error('Error fetching streaming providers:', error);
            }
            
            // Display the fetched details with improved layout
            movieDetailsContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="flex flex-col md:flex-row items-start md:items-start gap-8">
                        <div class="w-full md:w-1/3 flex justify-center md:justify-start">
                            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.original_title}" 
                                class="w-4/5 md:w-full max-w-xs rounded-lg shadow-lg">
                        </div>
                        <div class="w-full md:w-2/3 flex flex-col gap-6">
                            <div>
                                <p class="mb-2 flex items-center font-bold">
                                    <span>${data.vote_average.toString().substring(0, 3)}</span>
                                    <img src="/src/assets/star.png" alt="Star" class="w-3 h-3 ml-1" />
                                </p>
                                <h2 class="text-3xl font-bold mb-4">${data.original_title} (${data.release_date.substring(0, 4)})</h2>
                                <p class="mb-2"><span class="font-semibold">${data.genres.$values.map(genre => genre.name).join(', ')}</span></p>
                                <p class="mb-4">${data.overview}</p>
                                <p class="mb-2"><span class="font-semibold">Length:</span> ${data.runtime}</p>
                                <p class="mb-2"><span class="font-semibold">Country:</span> ${data.production_countries.$values.map(country => country.name).join(', ')}</p>
                                <p class="mb-2"><span class="font-semibold">Director:</span> ${data.directors.$values.map(director => director.name).join(', ')}</p>
                                <div class="mb-6">
                                <h3 class="text-xl font-semibold mb-6">Main Cast:</h3>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                    ${data.actors.$values.slice(0, 6).map(actor => `
                                    <div class="flex flex-col items-center cursor-pointer" data-actor-id="${actor.id}">
                                        <img 
                                        src="${actor.profilePath ? 'https://image.tmdb.org/t/p/w200' + actor.profilePath : '/src/assets/default-avatar.png'}" 
                                        alt="${actor.name}" 
                                        class="w-16 h-16 object-cover rounded-full border-1 border-white"
                                        onerror="this.src='/src/assets/default-avatar.png'; this.onerror=null;"
                                        >
                                        <p class="text-center text-sm mt-2">${actor.name}</p>
                                        <p class="text-center text-xs text-gray-500">${actor.character}</p>
                                    </div>
                                    `).join('')}
                                </div>
                                </div>
                                <hr class="border-t border-gray-300 dark:border-gray-700 mt-4">
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button id="trailerButton" class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/play.png" class="w-4 h-4 me-2"> Trailer
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/layer-plus1.png" class="w-4 h-4 me-2"> Add to List
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/check1.png" class="w-4 h-4 me-2"> Mark as Watched
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-green-700 text-white font-semibold hover:text-white py-2 px-4 border border-green-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/thumbs-up.png" class="w-4 h-4 me-2"> Like
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-red-700 text-white font-semibold hover:text-white py-2 px-4 border border-red-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/thumbs-down.png" class="w-4 h-4 me-2"> Dislike
                                    </div>
                                </button>
                            </div>
                            <details class="group">
                                <summary class="text-l font-bold cursor-pointer">
                                    Where can I stream ${data.original_title}?
                                </summary>
                                <div class="overflow-hidden max-h-0 transition-all duration-300 group-open:max-h-96">
                                    <hr class="border-t border-gray-300 dark:border-gray-700 mt-2 mb-4">
                                    ${renderStreamingProviders(streamingProviders)}
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
                
                <!-- Trailer Modal -->
                <div id="trailerModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center hidden">
                    <div class="relative bg-black rounded-lg overflow-hidden w-full max-w-4xl mx-4">
                        <div class="flex justify-between items-center p-2 absolute top-0 right-0 z-10">
                            <button id="closeTrailerModal" class="text-white hover:text-gray-300 p-1 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div id="trailerContainer" class="aspect-w-16 aspect-h-9">
                            <!-- YouTube iframe will be inserted here -->
                        </div>
                    </div>
                </div>
                
                <!-- Actor Details Modal -->
                <div id="actorModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center hidden">
                    <div class="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 class="text-xl font-bold">Actor Profile</h2>
                            <button id="closeActorModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div id="actorDetailsContent" class="text-gray-900 dark:text-white">
                            <!-- Actor details will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listener for trailer button
            const trailerButton = document.getElementById('trailerButton');
            if (trailerButton) {
                trailerButton.addEventListener('click', () => playTrailer(data.trailers.$values));
            }

            // Add event listener for closing the trailer modal
            const closeTrailerModal = document.getElementById('closeTrailerModal');
            if (closeTrailerModal) {
                closeTrailerModal.addEventListener('click', closeTrailer);
            }

            // Close modal when clicking outside the video
            const trailerModal = document.getElementById('trailerModal');
            if (trailerModal) {
                trailerModal.addEventListener('click', (event) => {
                    if (event.target === trailerModal) {
                        closeTrailer();
                    }
                });
            }

            // Add event listeners for actor clicks
            setupActorClickHandlers();
            
            // Preload actor images to prevent flickering
            if (data.actors && data.actors.$values) {
                const imageSources = data.actors.$values
                    .map(actor => actor.profilePath ? 'https://image.tmdb.org/t/p/w200' + actor.profilePath : null)
                    .filter(src => src !== null);
                
                preloadImages(imageSources);
            }
        })
        .catch(error => {
            console.error(error);
            
            // If API fetch fails, fall back to static data with improved layout
            displayStaticMovieData(movie);
        });
}

// Back button event listener to return to the movie results page
document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});

function convertRuntime(runtime) {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
}

// Add this function to display streaming providers with icons
function renderStreamingProviders(providersData) {
    if (!providersData || !providersData.results || Object.keys(providersData.results).length === 0) {
        return `<p class="mt-2">No streaming options available at this time.</p>`;
    }

    // First try Swedish providers (SE)
    let flatrateProviders = [];
    let rentProviders = [];
    
    // Try to find providers from different regions
    const regions = Object.keys(providersData.results);
    
    // Check Swedish providers first, then try other regions
    const priorityRegions = ['SE', 'US', 'GB'];
    const orderedRegions = [...priorityRegions, ...regions.filter(r => !priorityRegions.includes(r))];
    
    // Find flatrate (streaming) providers
    for (const region of orderedRegions) {
        if (providersData.results[region]?.flatrate?.$values?.length > 0) {
            flatrateProviders = providersData.results[region].flatrate.$values;
            break;
        }
    }
    
    // Find rent providers
    for (const region of orderedRegions) {
        if (providersData.results[region]?.rent?.$values?.length > 0) {
            rentProviders = providersData.results[region].rent.$values;
            break;
        }
    }

    // If no providers found at all
    if (flatrateProviders.length === 0 && rentProviders.length === 0) {
        return `<p class="mt-2">No streaming options available at this time.</p>`;
    }

    // Function to shorten provider names
    function shortenProviderName(name) {
        const nameMap = {
            'Amazon Prime Video': 'Amazon Prime',
            'Google Play Movies': 'Google Play',
            'Apple TV Plus': 'Apple TV+',
            'Apple TV': 'Apple TV',
            'YouTube Premium': 'YouTube',
            'Disney Plus': 'Disney+',
            'HBO Max': 'HBO Max'
        };
        
        return nameMap[name] || name;
    }

    // Build the output HTML
    let html = '';
    
    // Add streaming section if available
    if (flatrateProviders.length > 0) {
        html += `
            <div class="mb-4">
                <h3 class="text-white text-lg font-semibold mb-2">Stream</h3>
                <div class="flex flex-wrap gap-3">
                    ${flatrateProviders.map(provider => 
                        `<div class="flex flex-col items-center">
                            <img src="${provider.logoUrl || `https://image.tmdb.org/t/p/original${provider.logoPath}`}" 
                                alt="${provider.providerName}" 
                                class="w-12 h-12 rounded-lg shadow" 
                                title="${provider.providerName}">
                            <span class="text-xs mt-1">${shortenProviderName(provider.providerName)}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Add rental section if available
    if (rentProviders.length > 0) {
        html += `
            <div class="mb-4">
                <h3 class="text-white text-lg font-semibold mb-2">Rent</h3>
                <div class="flex flex-wrap gap-3">
                    ${rentProviders.map(provider => 
                        `<div class="flex flex-col items-center">
                            <img src="${provider.logoUrl || `https://image.tmdb.org/t/p/original${provider.logoPath}`}" 
                                alt="${provider.providerName}" 
                                class="w-12 h-12 rounded-lg shadow" 
                                title="${provider.providerName}">
                            <span class="text-xs mt-1">${shortenProviderName(provider.providerName)}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

// Function to play trailer video
function playTrailer(trailers) {
    if (!trailers || trailers.length === 0) {
        showNoTrailerMessage();
        return;
    }

    // Find a YouTube trailer, preferring official trailers
    const youtubeTrailers = trailers.filter(trailer => 
        trailer.site.toLowerCase() === 'youtube' && 
        trailer.type.toLowerCase().includes('trailer')
    );
    
    // If no YouTube trailers found, try any YouTube video
    let selectedTrailer = youtubeTrailers.length > 0 ? 
        youtubeTrailers[0] : 
        trailers.find(trailer => trailer.site.toLowerCase() === 'youtube');
    
    if (!selectedTrailer) {
        showNoTrailerMessage();
        return;
    }
    
    // Get the trailer container and create the YouTube iframe
    const trailerContainer = document.getElementById('trailerContainer');
    trailerContainer.innerHTML = `
        <iframe 
            id="youtubeTrailer"
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1" 
            title="${selectedTrailer.name}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
    
    // Show the modal
    document.getElementById('trailerModal').classList.remove('hidden');
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Function to close the trailer modal
function closeTrailer() {
    const trailerModal = document.getElementById('trailerModal');
    const trailerContainer = document.getElementById('trailerContainer');
    
    if (trailerModal) {
        trailerModal.classList.add('hidden');
    }
    
    // Clear the container to stop the video
    if (trailerContainer) {
        trailerContainer.innerHTML = '';
    }
    
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
}

// Function to show a message when no trailer is available
function showNoTrailerMessage() {
    const trailerModal = document.getElementById('trailerModal');
    const trailerContainer = document.getElementById('trailerContainer');
    
    if (trailerContainer) {
        trailerContainer.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-black">
                <div class="text-center text-white p-4">
                    <p class="text-xl font-bold mb-2">No trailer available</p>
                    <p>There is currently no trailer available for this movie.</p>
                </div>
            </div>
        `;
    }
    
    if (trailerModal) {
        trailerModal.classList.remove('hidden');
    }
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Add keyboard event listener for closing the modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeTrailer();
        closeActorModal();
    }
});

// Add click event handlers to actors
function setupActorClickHandlers() {
    document.querySelectorAll('.flex.flex-col.items-center').forEach(actorElement => {
      // Check if this is an actor element (has a text-center child)
      if (actorElement.querySelector('.text-center')) {
        // Add "actor-element" class for easier selection later
        actorElement.classList.add('actor-element', 'cursor-pointer', 'hover:opacity-80', 'transition-opacity', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'rounded-lg');
        
        // Make it focusable for accessibility
        actorElement.setAttribute('tabindex', '0');
        
        // Add click and keyboard event listeners
        actorElement.addEventListener('click', handleActorClick);
        actorElement.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleActorClick.call(actorElement);
          }
        });
      }
    });
    
    function handleActorClick() {
      // Get actor ID from data attribute
      const actorId = this.getAttribute('data-actor-id');
      if (actorId) {
        // Mark this element as the one that opened the modal
        this.setAttribute('data-active', 'true');
        showActorDetails(actorId);
      }
    }
}

// Function to show actor details popup
async function showActorDetails(actorId) {
    const actorModal = document.getElementById('actorModal');
    const actorDetailsContent = document.getElementById('actorDetailsContent');
    
    // Show loading state
    actorDetailsContent.innerHTML = `
      <div class="flex justify-center items-center p-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    `;
    
    // Show modal
    actorModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent background scrolling
    
    try {
      // Fetch actor details from API
      const response = await fetch(`https://localhost:7103/FilmRecomendations/GetActorDetails/${actorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch actor details');
      }
      
      const actorDetails = await response.json();
      
      // Format birthday
      let formattedBirthday = '';
      if (actorDetails.birthday) {
        const birthDate = new Date(actorDetails.birthday);
        formattedBirthday = birthDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Format biography to a reasonable length
      let formattedBio = 'No biography available for this actor.';
      if (actorDetails.biography && actorDetails.biography.trim().length > 0) {
        // Aim for approximately 150 words
        const words = actorDetails.biography.split(/\s+/);
        if (words.length > 160) { // Allow a little buffer over 150
          formattedBio = words.slice(0, 150).join(' ') + '...';
        } else {
          formattedBio = actorDetails.biography;
        }
      }
      
      // Prepare known for movies with preloading and click functionality
      let knownForMoviesHtml = '';
      if (actorDetails.knownForMovies && actorDetails.knownForMovies.$values && actorDetails.knownForMovies.$values.length > 0) {
        // Start preloading images
        actorDetails.knownForMovies.$values.forEach(movie => {
          if (movie.posterPath) {
            const img = new Image();
            img.src = movie.posterPath;
          }
        });
        
        knownForMoviesHtml = actorDetails.knownForMovies.$values.map(movie => `
          <div class="movie-card flex flex-col items-center p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer" 
               onclick="handleMovieClick(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')" 
               data-movie-id="${movie.id}">
            <div class="relative w-full aspect-[2/3] overflow-hidden rounded shadow bg-gray-200 dark:bg-gray-700">
              <img 
                src="${movie.posterPath || '/src/assets/default-poster.png'}" 
                alt="${movie.title}" 
                class="w-full h-full object-cover"
                onerror="this.src='/src/assets/default-poster.png'; this.onerror=null;"
                loading="lazy"
              >
            </div>
            <p class="text-center text-sm font-medium mt-2 line-clamp-1">${movie.title}</p>
            <p class="text-center text-xs text-gray-500 line-clamp-1">${movie.character || ''}</p>
          </div>
        `).join('');
      } else {
        knownForMoviesHtml = '<p class="text-gray-500 italic">No film information available.</p>';
      }
      
      // Create the content HTML with improved layout and all English text
      actorDetailsContent.innerHTML = `
        <div class="p-6 md:p-8">
          <!-- Actor header section -->
          <div class="flex flex-col md:flex-row gap-6 mb-6">
            <!-- Left column - image and basic info -->
            <div class="md:w-1/3 flex flex-col">
              <div class="rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700">
                <img 
                  src="${actorDetails.profilePath ? 'https://image.tmdb.org/t/p/w500' + actorDetails.profilePath : '/src/assets/default-avatar.png'}" 
                  alt="${actorDetails.name}" 
                  class="w-full aspect-[2/3] object-cover"
                  onerror="this.src='/src/assets/default-avatar.png'; this.onerror=null;"
                >
              </div>
              
              <div class="mt-4 space-y-1 text-sm">
                ${formattedBirthday ? `<p><span class="font-semibold">Born:</span> ${formattedBirthday}</p>` : ''}
                ${actorDetails.placeOfBirth ? `<p><span class="font-semibold">Birthplace:</span> ${actorDetails.placeOfBirth}</p>` : ''}
                ${actorDetails.knownForDepartment ? `<p><span class="font-semibold">Known for:</span> ${actorDetails.knownForDepartment}</p>` : ''}
                ${actorDetails.popularity ? `<p><span class="font-semibold">Popularity:</span> ${Math.round(actorDetails.popularity)}/100</p>` : ''}
              </div>
            </div>
            
            <!-- Right column - name, bio -->
            <div class="md:w-2/3">
              <h2 class="text-2xl font-bold">${actorDetails.name}</h2>
              
              <div class="my-4">
                <h3 class="text-lg font-semibold mb-2">Biography</h3>
                <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
                  ${formattedBio}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Known For section - full width -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4">Known For</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              ${knownForMoviesHtml}
            </div>
          </div>
        </div>
      `;
      
      // Setup image loading to prevent flickering
      setupImageLoading();
      
    } catch (error) {
      console.error('Error fetching actor details:', error);
      actorDetailsContent.innerHTML = `
        <div class="text-center p-8">
          <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="mt-4 text-xl font-semibold">An error occurred</p>
          <p class="mt-2 text-gray-500">Could not load actor information. Please try again later.</p>
        </div>
      `;
    }
}

// Add function to handle clicking on movies in the actor profile
function handleMovieClick(movieId, movieTitle) {
    // Close the actor modal first
    closeActorModal();
    
    // Create a movie object with the minimal information needed
    const movie = {
        movie_id: movieId,
        movie_name: movieTitle
    };
    
    // Store the selected movie in session storage
    sessionStorage.setItem('selectedMovie', JSON.stringify(movie));
    
    // Navigate to the movie details page
    window.location.href = `movie-details.html?title=${encodeURIComponent(movieTitle.toLowerCase().replace(/\s+/g, '-'))}`;
}

// Close actor modal with proper cleanup
function closeActorModal() {
    const actorModal = document.getElementById('actorModal');
    if (!actorModal) return;
    
    actorModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden'); // Restore background scrolling

    // Return focus to the element that opened the modal (for accessibility)
    const actorElement = document.querySelector('.actor-element[data-active="true"]');
    if (actorElement) {
        actorElement.removeAttribute('data-active');
        actorElement.focus();
    }
}

// Add event listener to close actor modal
document.getElementById('closeActorModal')?.addEventListener('click', closeActorModal);

// Close modal when clicking outside
document.getElementById('actorModal')?.addEventListener('click', (event) => {
    if (event.target === document.getElementById('actorModal')) {
        closeActorModal();
    }
});

// Display fallback static movie data in case of API failure
function displayStaticMovieData(movie) {
    const movieDetailsContent = document.getElementById('movieDetailsContent');
    
    movieDetailsContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="flex flex-col md:flex-row items-start md:items-start gap-8">
                <div class="w-full md:w-1/3 flex justify-center md:justify-start">
                    <img src="${movie.poster_path || '/src/assets/default-poster.png'}" 
                        alt="${movie.movie_name}" 
                        class="w-4/5 md:w-full max-w-xs rounded-lg shadow-lg"
                        onerror="this.src='/src/assets/default-poster.png'">
                </div>
                <div class="w-full md:w-2/3 flex flex-col gap-6">
                    <div>
                        <h2 class="text-3xl font-bold mb-4">${movie.movie_name} (${movie.release_year})</h2>
                        <p class="mb-4 text-gray-300">Unable to load detailed information at this time.</p>
                        <div class="bg-red-800 bg-opacity-20 text-red-200 p-4 rounded-lg mb-4">
                            <p>We're having trouble connecting to the movie database. Please try again later.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}