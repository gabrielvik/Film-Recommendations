/**
 * Movie Results Component
 * Displays AI search results in a grid layout matching the original design exactly
 * Features: responsive grid (1 mobile, 2 tablet, 3 desktop), fade-in animations, movie navigation
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type MovieRecommendation } from '@/lib/api/services/search';

interface MovieResultsProps {
  movies: MovieRecommendation[];
  isLoading: boolean;
  error: string | null;
}

export const MovieResults = ({ movies, isLoading, error }: MovieResultsProps) => {
  const [visibleMovies, setVisibleMovies] = useState<number[]>([]);
  const navigate = useNavigate();

  // Handle fade-in animation for movies
  useEffect(() => {
    if (movies.length > 0 && !isLoading) {
      // Clear previous animations
      setVisibleMovies([]);
      
      // Stagger the fade-in animation for each movie card
      movies.forEach((_, index) => {
        setTimeout(() => {
          setVisibleMovies(prev => [...prev, index]);
        }, index * 150); // 150ms delay between each card
      });
    } else {
      setVisibleMovies([]);
    }
  }, [movies, isLoading]);
  // Handle navigation to movie details
  const handleMovieClick = (movie: MovieRecommendation) => {
    // Use tmdb_id if available, otherwise fall back to movie_id
    const movieId = movie.tmdb_id || movie.movie_id;
    if (movieId) {
      navigate(`/movie/${movieId}`);
    } else {
      console.warn('No valid movie ID found for navigation:', movie);
    }
  };

  // Handle image loading errors
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    target.src = '/placeholder-movie.jpg';
  };

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="w-full max-w-xl mt-6 mb-6 flex items-center justify-center animate-fade-in">
        <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3 text-red-600 dark:text-red-400">
            {error.includes('log in') ? 'Log in to continue' : 'Search Error'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {error.includes('log in') 
              ? 'You need to login or register an account to get movie recommendations.'
              : error
            }
          </p>
        </div>
      </div>
    );
  }
  // Show empty state when no movies and no loading
  if (!isLoading && movies.length === 0) {
    return null; // Let the main component handle empty state
  }

  // Show movies grid with fade-in animations
  if (movies.length > 0) {
    return (
      <div className="w-full max-w-6xl mt-6 mb-6">
        {/* Grid: 1 column mobile, 2 tablet, 3 desktop - matching original exactly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {movies.map((movie, index) => {
            const isVisible = visibleMovies.includes(index);
            
            return (
              <div
                key={movie.movie_id || index}
                className={`movie-card transition-all duration-500 cursor-pointer ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                onClick={() => handleMovieClick(movie)}
              >
                <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">                  {/* Movie Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.poster_path || '/placeholder-movie.jpg'}
                      alt={movie.movie_name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300" />
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                      {movie.movie_name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ({movie.release_year})
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};