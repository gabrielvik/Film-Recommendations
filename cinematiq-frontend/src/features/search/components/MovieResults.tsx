/**
 * Movie Results Component
 * Displays AI search results in a grid layout matching the original design
 */

import { type MovieRecommendation } from '@/lib/api/services/search';

interface MovieResultsProps {
  movies: MovieRecommendation[];
  isLoading: boolean;
  error: string | null;
}

export const MovieResults = ({ movies, isLoading, error }: MovieResultsProps) => {
  // Show error state
  if (error && !isLoading) {
    return (
      <div className="w-full max-w-xl mt-6 mb-6 flex items-center justify-center">
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

  // Show movies grid
  if (movies.length > 0) {
    return (
      <div className="w-full max-w-6xl mt-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((movie, index) => (
          <div
            key={movie.movie_id || index}
            className="movie-card bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg transition duration-300 cursor-pointer hover:shadow-xl transform hover:scale-105"
            onClick={() => {
              // TODO: Navigate to movie details (RESTORE-004)
              console.log('Navigate to movie details:', movie);
            }}
          >
            <img
              src={movie.poster_path || '/placeholder-movie.jpg'}
              alt={movie.movie_name}
              className="w-full md:h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-movie.jpg';
              }}
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {movie.movie_name}
              </h2>
              <h5 className="text-sm text-gray-600 dark:text-gray-400">
                ({movie.release_year})
              </h5>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
