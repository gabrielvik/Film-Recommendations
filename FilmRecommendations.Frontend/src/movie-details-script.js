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
                                <p class="mb-2"><span class="font-semibold">Längd:</span> ${data.runtime}</p>
                                <p class="mb-2"><span class="font-semibold">Land:</span> ${data.production_countries.$values.map(country => country.name).join(', ')}</p>
                                <p class="mb-2"><span class="font-semibold">Regissör:</span> ${data.directors.$values.map(director => director.name).join(', ')}</p>
                                <div class="mb-6">
                                    <h3 class="text-xl font-semibold mb-6">Större roller:</h3>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                        ${data.actors.$values.slice(0, 6).map(actor => `
                                            <div class="flex flex-col items-center">
                                                <img 
                                                    src="${actor.profilePath ? 'https://image.tmdb.org/t/p/w200' + actor.profilePath : '/src/assets/default-avatar.png'}" 
                                                    alt="${actor.name}" 
                                                    class="w-16 h-16 object-cover rounded-full border-1 border-white"
                                                    onerror="this.src='/src/assets/default-avatar.png'"
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
                                        <img src="/src/assets/layer-plus1.png" class="w-4 h-4 me-2"> Lägg till i lista
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/check1.png" class="w-4 h-4 me-2"> Markera som sett
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-green-700 text-white font-semibold hover:text-white py-2 px-4 border border-green-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/thumbs-up.png" class="w-4 h-4 me-2"> Gillar
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-red-700 text-white font-semibold hover:text-white py-2 px-4 border border-red-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/thumbs-down.png" class="w-4 h-4 me-2"> Ogillar
                                    </div>
                                </button>
                            </div>
                            <details class="group">
                                <summary class="text-l font-bold cursor-pointer">
                                    Var kan jag streama ${data.original_title}?
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
        return `<p class="mt-2">Inga streamingalternativ tillgängliga just nu.</p>`;
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
        return `<p class="mt-2">Inga streamingalternativ tillgängliga just nu.</p>`;
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
                <h3 class="text-white text-lg font-semibold mb-2">Hyra</h3>
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
                    <p class="text-xl font-bold mb-2">Ingen trailer tillgänglig</p>
                    <p>Det finns tyvärr ingen trailer för denna film just nu.</p>
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
    }
});