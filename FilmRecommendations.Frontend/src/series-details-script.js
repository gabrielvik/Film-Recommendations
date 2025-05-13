import { addToWatchlist, showNotification, addToLikeList, addToDislikeList } from './movie-buttons-actions.js';
import { displayDebugInfo, displayStaticSeriesData } from './debug-helpers.js';

// Preserve dark mode setting
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Retrieve the series data from sessionStorage
let series = null;
try {
    series = JSON.parse(sessionStorage.getItem('selectedSeries'));
    
    // Check for alternative storage formats
    if (!series && sessionStorage.getItem('selectedSeries')) {
        // Try to parse as a different format
        const seriesString = sessionStorage.getItem('selectedSeries');
        if (seriesString.includes('seriesId')) {
            // Convert from alternative format
            const altFormatSeries = JSON.parse(seriesString);
            series = {
                series_id: altFormatSeries.seriesId || altFormatSeries.id,
                series_name: altFormatSeries.seriesName || altFormatSeries.name
            };
            console.log("Converted series data from alternative format:", series);
        }
    }
} catch (e) {
    console.error("Error parsing series data from session storage:", e);
}

// If no series data is found, show error message
if (!series) {
    document.getElementById('seriesDetailsContent').innerHTML = `
        <div class="text-center p-4">No series details available.</div>
    `;
} else {
    // Update URL in the address bar without reloading the page
    const seriesSlug = series.series_name ? 
        series.series_name.toLowerCase().replace(/\s+/g, '-') : 
        series.name.toLowerCase().replace(/\s+/g, '-');
    
    // Use search parameters instead of changing the path
    const url = new URL(window.location);
    url.searchParams.set('title', seriesSlug);
    window.history.replaceState(null, '', url);
    
    // Show loading state
    document.getElementById('seriesDetailsContent').innerHTML = `
        <div class="text-center p-4">Loading series details...</div>
    `;
    
    // Call function to fetch and display series details
    console.log("Selected series data:", series);
    showSeriesDetails(series);
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

function showSeriesDetails(series) {
    // Get the content container
    const seriesDetailsContent = document.getElementById('seriesDetailsContent');
    const seriesDetailsContainer = document.getElementById('seriesDetailsContainer');
    
    console.log("Attempting to fetch series details for:", series);
    
    // Set initial styling to match movie-details
    seriesDetailsContainer.classList.add('backdrop-blur-sm', 'shadow-lg');
    
    // Fetch detailed series data using the series_id property from the selected series
    fetch(`https://localhost:7103/SeriesRecommendations/GetSeriesDetails/${series.series_id}`)
        .then(response => {
            console.log("API Response status:", response.status);
            if (!response.ok) {
                throw new Error(`Error fetching series details: ${response.status}`);
            }
            return response.json();
        })
        .then(async data => {
            console.log("Series API response data:", data);
            
            // Look for creator information in the response
            console.log("Creator fields check:", {
                "data.created_by": data.created_by,
                "data.creators": data.creators,
                "data.created_by_values": data.created_by && data.created_by.$values,
                "data.creators_values": data.creators && data.creators.$values
            });
            // Set the backdrop image as background if available
            if (data.backdrop_path) {
                console.log("Backdrop path found:", data.backdrop_path);
                const backdropUrl = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
                
                // Adjust the opacity in the rgba function
                const topOpacity = 0.5; // Opacity at the top (0.1-0.7 recommended)
                const bottomOpacity = Math.min(topOpacity + 0.4, 0.95); // More opaque at bottom, maximum 0.95
                
                // Apply gradient with increased opacity at bottom
                seriesDetailsContainer.style.backgroundImage = `linear-gradient(to bottom, 
                    rgba(0, 0, 0, ${topOpacity}) 0%, 
                    rgba(0, 0, 0, ${bottomOpacity}) 100%), 
                    url('${backdropUrl}')`;
                seriesDetailsContainer.style.backgroundSize = 'cover';
                seriesDetailsContainer.style.backgroundPosition = 'center';
                seriesDetailsContainer.style.backgroundRepeat = 'no-repeat';
                
                // Add additional styling to ensure visibility of content
                seriesDetailsContainer.classList.remove('bg-gray-100', 'dark:bg-gray-800');
                seriesDetailsContainer.classList.add('text-white');
            } else {
                console.log("No backdrop path available in data:", data);
            }

            // Format seasons information
            const seasonText = data.number_of_seasons > 1 
                ? `${data.number_of_seasons} Seasons, ${data.number_of_episodes} Episodes` 
                : `${data.number_of_seasons} Season, ${data.number_of_episodes} Episodes`;
                
            // Ensure data.genres exists and has a valid structure
            const genres = data.genres ? (Array.isArray(data.genres) ? data.genres : []) : [];
            const genreNames = genres.map(genre => genre?.name || '').filter(name => name).join(', ');
            
            // Ensure data.creators exists and has a valid structure
            let creators = [];
            
            // Check for created_by (direct from TMDB API) with all possible property name variations
            if (data.created_by && Array.isArray(data.created_by)) {
                creators = data.created_by;
            } else if (data.created_by && data.created_by.$values) {
                creators = data.created_by.$values;
            } else if (data.createdBy && Array.isArray(data.createdBy)) {
                creators = data.createdBy;
            } else if (data.createdBy && data.createdBy.$values) {
                creators = data.createdBy.$values;
            }
            // Check for Creators (from our backend model) with all possible property name variations
            else if (data.creators && Array.isArray(data.creators)) {
                creators = data.creators;
            } else if (data.creators && data.creators.$values) {
                creators = data.creators.$values;
            } else if (data.Creators && Array.isArray(data.Creators)) {
                creators = data.Creators;
            } else if (data.Creators && data.Creators.$values) {
                creators = data.Creators.$values;
            }
            
            // Print debug info
            console.log("Creator information:", creators);
            
            // Generate creator names string, checking for all possible property name variations
            const creatorNames = creators.length > 0 ? 
                creators.map(creator => 
                    creator?.name || creator?.Name || ''
                ).filter(name => name).join(', ') : 
                'Unknown';
            
            // Ensure data.actors exists and has a valid structure
            const actors = data.actors && data.actors.$values ? data.actors.$values :
                          (data.actors ? (Array.isArray(data.actors) ? data.actors : []) : []);
            
            // Ensure data.seasons exists and has a valid structure
            const seasons = data.seasons ? (Array.isArray(data.seasons) ? data.seasons : []) : [];

            // Fetch streaming providers
            let streamingProviders = null;
            try {
                const providersResponse = await fetch(`https://localhost:7103/SeriesRecommendations/GetStreamingProviders/${series.series_id}`);
                if (providersResponse.ok) {
                    streamingProviders = await providersResponse.json();
                }
            } catch (error) {
                console.error('Error fetching streaming providers:', error);
            }
            
            // Display the fetched details with improved layout
            seriesDetailsContent.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="flex flex-col md:flex-row items-start md:items-start gap-8">
                        <div class="w-full md:w-1/3 flex justify-center md:justify-start">
                            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.name}" 
                                class="w-4/5 md:w-full max-w-xs rounded-lg shadow-lg">
                        </div>
                        <div class="w-full md:w-2/3 flex flex-col gap-6">
                            <div>
                                <p class="mb-2 flex items-center font-bold">
                                    <span>${data.vote_average.toString().substring(0, 3)}</span>
                                    <img src="/src/assets/star.png" alt="Star" class="w-3 h-3 ml-1" />
                                </p>
                                <h2 class="text-3xl font-bold mb-4">${data.name || 'Untitled Series'} ${data.first_air_date ? `(${data.first_air_date.substring(0, 4)})` : ''}</h2>
                                <p class="mb-2"><span class="font-semibold">${genreNames}</span></p>
                                <p class="mb-4">${data.overview || 'No overview available.'}</p>
                                <p class="mb-2"><span class="font-semibold">Seasons:</span> ${seasonText}</p>
                                <p class="mb-2"><span class="font-semibold">Created By:</span> ${creatorNames || 'Unknown'}</p>
                                <div class="mb-6">
                                    <h3 class="text-xl font-semibold mb-6">Main Cast:</h3>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                        ${actors.length > 0 ? 
                                            actors.slice(0, 6).map(actor => `
                                                <div class="flex flex-col items-center cursor-pointer actor-element" data-actor-id="${actor.id}">
                                                    <img 
                                                        src="${actor.profilePath ? 'https://image.tmdb.org/t/p/w200' + actor.profilePath : '/src/assets/default-avatar.png'}" 
                                                        alt="${actor.name}" 
                                                        class="w-16 h-16 object-cover rounded-full border-1 border-white"
                                                        onerror="this.src='/src/assets/default-avatar.png'"
                                                    >
                                                    <p class="text-center text-sm mt-2">${actor.name}</p>
                                                    <p class="text-center text-xs text-gray-500">${actor.character || 'Unknown'}</p>
                                                </div>
                                            `).join('') : 
                                            '<div class="col-span-6 text-center">Cast information not available</div>'
                                        }
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
                                <button id="watchlist" class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/layer-plus1.png" class="w-4 h-4 me-2"> Add to List
                                    </div>
                                </button>
                                <button class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/check1.png" class="w-4 h-4 me-2"> Mark as Watched
                                    </div>
                                </button>
                                <button id="like" class="bg-transparent hover:bg-green-700 text-white font-semibold hover:text-white py-2 px-4 border border-green-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/thumbs-up.png" class="w-4 h-4 me-2"> Like
                                    </div>
                                </button>
                                <button id="dislike" class="bg-transparent hover:bg-red-700 text-white font-semibold hover:text-white py-2 px-4 border border-red-300 hover:border-transparent rounded">
                                    <div class="flex items-center">
                                        <img src="/src/assets/thumbs-down.png" class="w-4 h-4 me-2"> Dislike
                                    </div>
                                </button>
                            </div>
                            <details class="group">
                                <summary class="text-l font-bold cursor-pointer">
                                    Where can I stream ${data.name}?
                                </summary>
                                <div class="overflow-hidden max-h-0 transition-all duration-300 group-open:max-h-96">
                                    <hr class="border-t border-gray-300 dark:border-gray-700 mt-2 mb-4">
                                    ${renderStreamingProviders(streamingProviders)}
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                ${displayDebugInfo(data, series.series_id)}

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
                trailerButton.addEventListener('click', () => {
                    console.log("Trailer button clicked, data:", data);
                    if (data.trailers && (data.trailers.length > 0 || (data.trailers.$values && data.trailers.$values.length > 0))) {
                        playTrailer(data.trailers);
                    } else {
                        showNoTrailerMessage();
                    }
                });
            }
            
            // Add event listener for closing the trailer modal with improved handling
            const closeTrailerModal = document.getElementById('closeTrailerModal');
            if (closeTrailerModal) {
                closeTrailerModal.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeTrailer();
                });
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
            
            // Setup actor click handlers
            setupActorClickHandlers();
        })
        .catch(error => {
            console.error("Error loading series details:", error);
            
            // First try to display static data as a fallback
            if (series) {
                displayStaticSeriesData(series);
            } else {
                // Complete failure fallback
                seriesDetailsContent.innerHTML = `
                    <div class="text-center p-4">
                        <p class="text-red-500 mb-4">Error loading series details</p>
                        <p>We couldn't load the details for this series. Please try again later.</p>
                        <div class="mt-4 p-2 bg-gray-800 rounded text-xs text-left">
                            <p>Debug info: ${error.message}</p>
                        </div>
                    </div>
                `;
            }
        });
}

// Back button event listener to return to the series results page
document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});

function renderStreamingProviders(providersData) {
    console.log("Providers data:", providersData);
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
    console.log("Attempting to play trailer with data:", trailers);
    
    // Check if trailers is an object with $values property (format from API)
    if (trailers && typeof trailers === 'object' && trailers.$values) {
        trailers = trailers.$values;
    }
    
    if (!trailers || trailers.length === 0) {
        showNoTrailerMessage();
        return;
    }

    // Find a YouTube trailer, preferring official trailers
    const youtubeTrailers = trailers.filter(trailer => 
        trailer.site && trailer.site.toLowerCase() === 'youtube' && 
        trailer.type && trailer.type.toLowerCase().includes('trailer')
    );
    
    // If no YouTube trailers found, try any YouTube video
    let selectedTrailer = youtubeTrailers.length > 0 ? 
        youtubeTrailers[0] : 
        trailers.find(trailer => trailer.site && trailer.site.toLowerCase() === 'youtube');
    
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

// Improved close trailer function with better cleanup
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
                    <p>There is currently no trailer available for this series.</p>
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

// Add extra darkening effect to background when actor modal is shown
function showActorModalWithBackground() {
    const actorModal = document.getElementById('actorModal');
    const seriesDetailsContainer = document.getElementById('seriesDetailsContainer');
    const modalContent = actorModal.querySelector('div');
    
    if (actorModal) {
        // First ensure visibility but with initial opacity 0
        actorModal.style.opacity = '0';
        actorModal.classList.remove('hidden');
        
        // Apply initial transform to content for subtle animation
        if (modalContent) {
            modalContent.style.transform = 'translateY(10px)';
            modalContent.style.opacity = '0';
        }
        
        // Force a reflow before starting animation
        void actorModal.offsetWidth;
        
        // Start animation
        actorModal.style.opacity = '1';
        if (modalContent) {
            setTimeout(() => {
                modalContent.style.transform = 'translateY(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Add darkening class to the series details background
        if (seriesDetailsContainer) {
            // Store the original background for later restoration
            if (!seriesDetailsContainer.dataset.originalBg) {
                seriesDetailsContainer.dataset.originalBg = seriesDetailsContainer.style.backgroundImage;
            }
            
            // Apply a darker overlay
            const currentBg = seriesDetailsContainer.style.backgroundImage;
            if (currentBg) {
                // Extract and modify the linear gradient part to make it darker
                const bgParts = currentBg.split('url(');
                if (bgParts.length > 1) {
                    // Replace the original gradient with a darker one
                    seriesDetailsContainer.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.85) 100%), url(${bgParts[1]}`;
                }
            }
        }
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
}

// Add the setupActorClickHandlers function
function setupActorClickHandlers() {
    document.querySelectorAll('.actor-element').forEach(actorElement => {
        actorElement.addEventListener('click', function() {
            const actorId = this.getAttribute('data-actor-id');
            if (actorId) {
                showActorDetails(actorId);
            }
        });
    });
}

function navigateToSeries(seriesId, seriesTitle) {
    // Create minimal series data object
    const seriesData = {
      series_id: seriesId,
      series_name: seriesTitle
    };
    
    // Store the series data in sessionStorage
    sessionStorage.setItem('selectedSeries', JSON.stringify(seriesData));
    
    // Create a URL-friendly version of the title
    const seriesSlug = seriesTitle.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate to the series details page
    window.location.href = `series-details.html?series=${seriesSlug}`;
}

// Function to show actor details with improved scrolling for mobile
async function showActorDetails(actorId) {
    const actorModal = document.getElementById('actorModal');
    const actorDetailsContent = document.getElementById('actorDetailsContent');
    
    if (!actorModal || !actorDetailsContent) {
        console.error('Actor modal elements not found');
        return;
    }
    
    // Show loading state
    actorDetailsContent.innerHTML = `
        <div class="flex justify-center items-center p-16">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    `;
    
    // Show modal with darkened background
    showActorModalWithBackground();
    
    // Reset scroll position for the content div
    actorDetailsContent.scrollTop = 0;
    
    try {
        // Use the same endpoint that provides summarized actor details
        const response = await fetch(`https://localhost:7103/FilmRecomendations/GetSummarizedActorDetails/${actorId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch actor details');
        }
        
        const actorDetails = await response.json();
        
        // Create content HTML
        actorDetailsContent.innerHTML = `
            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="md:w-1/3">
                        <img 
                            src="${actorDetails.profilePath ? 'https://image.tmdb.org/t/p/w300' + actorDetails.profilePath : '/src/assets/default-avatar.png'}" 
                            alt="${actorDetails.name}" 
                            class="w-full rounded-lg shadow-lg"
                            onerror="this.src='/src/assets/default-avatar.png'"
                        >
                        <div class="mt-4 space-y-1">
                            ${actorDetails.birthday ? `<p><span class="font-semibold">Born:</span> ${new Date(actorDetails.birthday).toLocaleDateString()}</p>` : ''}
                            ${actorDetails.placeOfBirth ? `<p><span class="font-semibold">Birthplace:</span> ${actorDetails.placeOfBirth}</p>` : ''}
                        </div>
                    </div>
                    <div class="md:w-2/3">
                        <h2 class="text-2xl font-bold">${actorDetails.name}</h2>
                        <div class="mt-4">
                            <h3 class="text-lg font-semibold mb-2">Biography</h3>
                            <div class="biography-text">
                                <p>${actorDetails.biography || 'No biography available for this actor.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold mb-4">Known For</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        ${actorDetails.knownForMovies && actorDetails.knownForMovies.$values ? 
                            actorDetails.knownForMovies.$values.slice(0, 4).map(movie => `
                                <div class="flex flex-col movie-item cursor-pointer transition duration-200 hover:opacity-80 hover:scale-105" 
                                     data-movie-id="${movie.id}" 
                                     data-movie-title="${movie.title}"
                                     data-release-year="${movie.releaseDate ? movie.releaseDate.substring(0, 4) : ''}">
                                    <div class="relative overflow-hidden rounded-lg">
                                        <img 
                                            src="${movie.posterPath ? 'https://image.tmdb.org/t/p/w200' + movie.posterPath : '/src/assets/default-poster.png'}" 
                                            alt="${movie.title}" 
                                            class="w-full shadow transition duration-200"
                                            onerror="this.src='/src/assets/default-poster.png'"
                                        >
                                        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition duration-200"></div>
                                    </div>
                                    <p class="text-center text-sm mt-2 font-medium">${movie.title}</p>
                                </div>
                            `).join('') : 
                            '<p>No movie information available.</p>'
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Set up click handlers for movie items after rendering the content
        setupMovieClickHandlers();
        
    } catch (error) {
        console.error('Error fetching actor details:', error);
        actorDetailsContent.innerHTML = `
            <div class="text-center p-8">
                <p class="text-xl text-red-500 mb-2">Error</p>
                <p>Could not load actor information. Please try again later.</p>
            </div>
        `;
    }
}

// Function to handle movie click events
function setupMovieClickHandlers() {
    document.querySelectorAll('.movie-item').forEach(movieElement => {
        movieElement.addEventListener('click', function() {
            const movieId = this.getAttribute('data-movie-id');
            const movieTitle = this.getAttribute('data-movie-title');
            const releaseYear = this.getAttribute('data-release-year');
            
            if (movieId && movieTitle) {
                // Create minimal movie data object
                const movieData = {
                    movie_id: movieId,
                    movie_name: movieTitle,
                    release_year: releaseYear || ''
                };
                
                // Store the movie data in sessionStorage
                sessionStorage.setItem('selectedMovie', JSON.stringify(movieData));
                
                // Create a URL-friendly version of the title
                const movieSlug = movieTitle.toLowerCase().replace(/\s+/g, '-');
                
                // Navigate to the movie details page
                window.location.href = `movie-details.html?movie=${movieSlug}`;
            }
        });
    });
}

// Enhanced closeActorModal function to restore original background
function closeActorModal() {
    const actorModal = document.getElementById('actorModal');
    const seriesDetailsContainer = document.getElementById('seriesDetailsContainer');
    const modalContent = actorModal.querySelector('div');
    
    if (actorModal) {
        // Start fade out animation
        actorModal.style.opacity = '0';
        
        // Animate the modal content
        if (modalContent) {
            modalContent.style.transform = 'translateY(8px)';
            modalContent.style.opacity = '0';
        }
        
        // Wait for animation to complete before hiding completely
        setTimeout(() => {
            actorModal.classList.add('hidden');
            
            // Reset transform for next time
            if (modalContent) {
                modalContent.style.transform = '';
                modalContent.style.opacity = '';
            }
            
            // Reset opacity
            actorModal.style.opacity = '';
            
            // Restore original background if we stored it
            if (seriesDetailsContainer && seriesDetailsContainer.dataset.originalBg) {
                seriesDetailsContainer.style.backgroundImage = seriesDetailsContainer.dataset.originalBg;
            }
            
            // Re-enable body scrolling
            document.body.style.overflow = 'auto';
        }, 180);
    }
}

// Ensure the actor modal close button has a proper event listener
document.addEventListener('DOMContentLoaded', () => {
    const closeActorModalBtn = document.getElementById('closeActorModal');
    if (closeActorModalBtn) {
        closeActorModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeActorModal();
        });
    }
    
    // Close actor modal when clicking outside content
    const actorModal = document.getElementById('actorModal');
    if (actorModal) {
        actorModal.addEventListener('click', (event) => {
            if (event.target === actorModal) {
                closeActorModal();
            }
        });
    }
    
    // Series CRUD operations - add event listeners for buttons
    if (series) {
        // Add event listener for watchlist button
        const watchlistButton = document.getElementById('watchlist');
        if (watchlistButton) {
            watchlistButton.addEventListener('click', () => {
                // Get the currently displayed series
                fetch(`https://localhost:7103/SeriesRecommendations/GetSeriesDetails/${series.series_id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error fetching series details.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        addToWatchlist(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Ett fel inträffade. Kunde inte hämta seriedetaljer.', 'error');
                    });
            });
        }

        // Add event listener for like button
        const likeButton = document.getElementById('like');
        if (likeButton) {
            likeButton.addEventListener('click', () => {
                fetch(`https://localhost:7103/SeriesRecommendations/GetSeriesDetails/${series.series_id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error fetching series details.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        addToLikeList(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Ett fel inträffade. Kunde inte hämta seriedetaljer.', 'error');
                    });
            });
        }

        // Add event listener for dislike button
        const dislikeButton = document.getElementById('dislike');
        if (dislikeButton) {
            dislikeButton.addEventListener('click', () => {
                fetch(`https://localhost:7103/SeriesRecommendations/GetSeriesDetails/${series.series_id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error fetching series details.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        addToDislikeList(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Ett fel inträffade. Kunde inte hämta seriedetaljer.', 'error');
                    });
            });
        }
    }
});
