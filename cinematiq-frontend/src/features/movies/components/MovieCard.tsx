import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Clock, Heart, Bookmark, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl, formatDate, formatRuntime, truncateText } from '@/utils';
import type { Movie } from '@/lib/api/types';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'compact' | 'featured';
  showGenres?: boolean;
  onWatchlistAdd?: (movieId: number) => void;
  onFavoriteAdd?: (movieId: number) => void;
  isInWatchlist?: boolean;
  isInFavorites?: boolean;
}

export const MovieCard = memo(({
  movie,
  variant = 'default',
  showGenres = true,
  onWatchlistAdd,
  onFavoriteAdd,
  isInWatchlist = false,
  isInFavorites = false,
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = getImageUrl(movie.poster_path, 'w300');
  const backdropUrl = getImageUrl(movie.backdrop_path, 'w500');

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWatchlistAdd?.(movie.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteAdd?.(movie.id);
  };

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  if (variant === 'compact') {
    return (
      <Link to={`/movie/${movie.id}`} className="block group">
        <Card className="p-3 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
          <div className="flex space-x-3">
            <div className="relative w-16 h-24 flex-shrink-0">
              {!imageError && posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {movie.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
              </p>
              <div className="flex items-center mt-2">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/movie/${movie.id}`} className="block group">
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
          <div className="relative h-80">
            {!imageError && (backdropUrl || posterUrl) ? (
              <img
                src={backdropUrl || posterUrl}
                alt={movie.title}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Play className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant={isInFavorites ? "default" : "secondary"}
                onClick={handleFavoriteClick}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${isInFavorites ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant={isInWatchlist ? "default" : "secondary"}
                onClick={handleWatchlistClick}
                className="h-8 w-8 p-0"
              >
                <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Movie info overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{movie.title}</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                </div>
              </div>
              {movie.overview && (
                <p className="text-sm text-gray-200 mt-2 line-clamp-2">
                  {truncateText(movie.overview, 120)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/movie/${movie.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {!imageError && posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={isInFavorites ? "default" : "secondary"}
                onClick={handleFavoriteClick}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${isInFavorites ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant={isInWatchlist ? "default" : "secondary"}
                onClick={handleWatchlistClick}
                className="h-8 w-8 p-0"
              >
                <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                {movie.vote_average.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="p-4">
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{movie.release_date ? formatDate(movie.release_date) : 'TBA'}</span>
          </div>

          {movie.overview && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {truncateText(movie.overview, 100)}
            </p>
          )}

          {/* Genres */}
          {showGenres && movie.genre_ids && movie.genre_ids.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genre_ids.slice(0, 2).map((genreId) => (
                <Badge key={genreId} variant="outline" className="text-xs">
                  Genre {genreId}
                </Badge>
              ))}
              {movie.genre_ids.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{movie.genre_ids.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});

MovieCard.displayName = 'MovieCard';
