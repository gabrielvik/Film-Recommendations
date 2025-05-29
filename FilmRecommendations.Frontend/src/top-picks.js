import config from './config.js';
import { isAuthenticated } from './auth-utils.js';

// Top Picks functionality
let topPicksData = [];
let currentPage = 0;
const moviesPerPage = 6;

// Initialize Top Picks on page load
export function initializeTopPicks() {
    // Always show top picks - personalized for authenticated users, trending for guests
    fetchTopPicks();
}

// Fetch top picks based on user preferences
async function fetchTopPicks() {
    try {
        let headingText = 'Top picks for you';
        
        if (isAuthenticated()) {
            // Try to get user's liked movies first to personalize recommendations
            const likedMovies = await getUserLikedMovies();
            
            // If user has liked movies, get similar recommendations
            if (likedMovies && likedMovies.length > 0) {
                const recommendations = await getPersonalizedRecommendations(likedMovies);
                topPicksData = recommendations;
                headingText = 'Recommended for you';
            } else {
                // Fallback to trending movies if no user preferences
                const trendingMovies = await getTrendingMovies();
                topPicksData = trendingMovies;
                headingText = 'Popular movies';
            }
        } else {
            // Show trending movies for non-authenticated users
            const trendingMovies = await getTrendingMovies();
            topPicksData = trendingMovies;
            headingText = 'Popular movies';
        }
        
        if (topPicksData && topPicksData.length > 0) {
            updateHeading(headingText);
            displayTopPicks();
            showTopPicksSection();
        }
    } catch (error) {
        console.error('Error fetching top picks:', error);
        // Fallback to sample movies
        topPicksData = getSampleTopPicks();
        updateHeading('Popular movies');
        displayTopPicks();
        showTopPicksSection();
    }
}

// Update the heading text
function updateHeading(text) {
    const heading = document.querySelector('#topPicksSection h2');
    if (heading) {
        heading.textContent = text;
    }
}

// Get user's liked movies from the API
async function getUserLikedMovies() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return [];

        // Try to get user's movies (including liked ones)
        const response = await fetch(`${config.apiBaseUrl}/api/Movies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
            }
            return [];
        }

        const userMovies = await response.json();
        // Filter for liked movies (where liked === true)
        return userMovies.filter(movie => movie.liked === true);
    } catch (error) {
        console.error('Error fetching liked movies:', error);
        return [];
    }
}

// Get personalized recommendations based on liked movies
async function getPersonalizedRecommendations(likedMovies) {
    try {
        // Create a prompt based on the user's liked movies
        const movieTitles = likedMovies.slice(0, 3).map(movie => movie.title).join(', ');
        const prompt = `Movies similar to ${movieTitles}`;
        
        const response = await fetch(`${config.apiBaseUrl}/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(prompt)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get personalized recommendations');
        }

        const recommendations = await response.json();
        return recommendations && recommendations.length > 0 ? recommendations.slice(0, 12) : getSampleTopPicks();
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        return getSampleTopPicks();
    }
}

// Get trending movies as fallback
async function getTrendingMovies() {
    try {
        // Use a generic prompt to get popular movies
        const prompt = 'Popular trending movies from 2020-2024';
        
        const response = await fetch(`${config.apiBaseUrl}/FilmRecomendations/GetFilmRecommendation?prompt=${encodeURIComponent(prompt)}`);

        if (!response.ok) {
            // If API fails, return some sample popular movies
            return getSampleTopPicks();
        }

        const movies = await response.json();
        return movies && movies.length > 0 ? movies.slice(0, 12) : getSampleTopPicks();
    } catch (error) {
        console.error('Error getting trending movies:', error);
        return getSampleTopPicks();
    }
}

// Sample top picks for fallback
function getSampleTopPicks() {
    return [
        {
            movie_id: 597,
            movie_name: "Titanic",
            release_year: 1997,
            poster_path: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg"
        },
        {
            movie_id: 550,
            movie_name: "Fight Club",
            release_year: 1999,
            poster_path: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
        },
        {
            movie_id: 13,
            movie_name: "Forrest Gump",
            release_year: 1994,
            poster_path: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg"
        },
        {
            movie_id: 155,
            movie_name: "The Dark Knight",
            release_year: 2008,
            poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
        },
        {
            movie_id: 680,
            movie_name: "Pulp Fiction",
            release_year: 1994,
            poster_path: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"
        },
        {
            movie_id: 27205,
            movie_name: "Inception",
            release_year: 2010,
            poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
        }
    ];
}

// Display top picks in the horizontal layout
function displayTopPicks() {
    const container = document.getElementById('topPicksContainer');
    if (!container) return;

    container.innerHTML = '';

    // Calculate how many pages we need
    const totalPages = Math.ceil(topPicksData.length / moviesPerPage);
    
    // Create movie cards for current page
    const startIndex = currentPage * moviesPerPage;
    const endIndex = Math.min(startIndex + moviesPerPage, topPicksData.length);
    const currentMovies = topPicksData.slice(startIndex, endIndex);

    currentMovies.forEach((movie) => {
        const movieCard = createTopPicksMovieCard(movie);
        container.appendChild(movieCard);
    });

    // Setup pagination if we have more than one page
    if (totalPages > 1) {
        setupPagination(totalPages);
    }
}

// Create a movie card for Top Picks
function createTopPicksMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add(
        'top-picks-card',
        'bg-white',
        'dark:bg-gray-700',
        'rounded-lg',
        'overflow-hidden',
        'shadow-lg',
        'cursor-pointer'
    );

    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_path;
    posterImg.alt = movie.movie_name;
    posterImg.classList.add('w-full', 'h-72', 'object-cover');

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('p-3');

    const titleText = document.createElement('h3');
    titleText.classList.add('text-sm', 'font-semibold', 'mb-1', 'text-gray-900', 'dark:text-gray-100');
    titleText.textContent = movie.movie_name;

    const releaseYearText = document.createElement('p');
    releaseYearText.classList.add('text-xs', 'text-gray-600', 'dark:text-gray-400');
    releaseYearText.textContent = `(${movie.release_year})`;

    titleDiv.appendChild(titleText);
    titleDiv.appendChild(releaseYearText);
    movieCard.appendChild(posterImg);
    movieCard.appendChild(titleDiv);

    // Add click handler to navigate to movie details
    movieCard.addEventListener('click', () => showMovieDetails(movie));

    return movieCard;
}

// Setup pagination dots
function setupPagination(totalPages) {
    const paginationContainer = document.getElementById('topPicksPagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        if (i === currentPage) {
            dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
            currentPage = i;
            displayTopPicks();
        });

        paginationContainer.appendChild(dot);
    }
}

// Show the Top Picks section
function showTopPicksSection() {
    const section = document.getElementById('topPicksSection');
    if (section) {
        section.classList.remove('hidden');
    }
}

// Navigate to movie details (reuse existing function from main.js)
function showMovieDetails(movie) {
    sessionStorage.setItem('selectedMovie', JSON.stringify(movie));
    const movieSlug = movie.movie_name.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `movie-details.html?movie=${movieSlug}`;
}

// Export for use in main.js
export { fetchTopPicks, displayTopPicks };
