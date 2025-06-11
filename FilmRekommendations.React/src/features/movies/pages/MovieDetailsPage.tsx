import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useMovieDetails, 
  useMovieCredits, 
  useSimilarMovies,
  useMovieVideos
} from '@/hooks/useMovies';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TrailerModal, MovieRating, ShareButton, WatchlistButton } from '@/features/movies/components';
import { 
  Star, 
  Clock, 
  Calendar, 
  Heart, 
  Play, 
  Share2,
  DollarSign,
  Globe,
  Award,
  User
} from 'lucide-react';
import { formatCurrency, formatDate, formatRuntime } from '@/utils';

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0', 10);
  
  const [userRating, setUserRating] = useState<number>(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  
  const { data: movie, isLoading: isMovieLoading, error: movieError } = useMovieDetails(movieId);
  const { data: credits, isLoading: isCreditsLoading } = useMovieCredits(movieId);
  const { data: similarMovies, isLoading: isSimilarLoading } = useSimilarMovies(movieId);
  const { data: videos } = useMovieVideos(movieId);

  if (isMovieLoading) {
    return (
      <div className="space-y-6">
        {/* Hero Section Skeleton */}
        <div className="relative h-96 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg animate-pulse">
          <div className="absolute inset-0 flex items-end p-8">
            <div className="flex space-x-6">
              <div className="w-48 h-72 bg-slate-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 w-64 bg-slate-700 rounded"></div>
                <div className="h-4 w-48 bg-slate-700 rounded"></div>
                <div className="h-16 w-96 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Movie Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the movie you're looking for.
          </p>
        </Card>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : '';
    
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '';

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // TODO: Implement actual rating submission to API
    console.log(`Rated movie ${movie?.title} with ${rating}/10`);
  };

  const handleWatchlistToggle = (isInWatchlist: boolean) => {
    setIsInWatchlist(isInWatchlist);
    // Already handled in WatchlistButton component
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div 
        className="relative h-96 md:h-[500px] rounded-lg overflow-hidden"
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: !backdropUrl ? '#1e293b' : undefined,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end p-6 md:p-8">
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 w-full">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
                {posterUrl ? (
                  <img 
                    src={posterUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-400">No Poster</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Movie Information */}
            <div className="flex-1 space-y-4 text-white">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-lg md:text-xl text-gray-300 italic">"{movie.tagline}"</p>
                )}
              </div>
              
              {/* Movie Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-300 ml-1">({movie.vote_count.toLocaleString()} votes)</span>
                </div>
                
                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-1" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
                
                {movie.budget > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    <span>{formatCurrency(movie.budget)}</span>
                  </div>
                )}
              </div>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="bg-white/20 text-white">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              
              {/* Overview */}
              <p className="text-gray-200 max-w-3xl leading-relaxed">
                {movie.overview}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => setIsTrailerOpen(true)}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Trailer
                </Button>
                
                <WatchlistButton
                  movieId={movieId}
                  movieTitle={movie.title}
                  initialIsInWatchlist={isInWatchlist}
                  onToggle={handleWatchlistToggle}
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black"
                />
                
                <ShareButton
                  title={movie.title}
                  text={movie.overview}
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="similar">Similar Movies</TabsTrigger>
        </TabsList>
        
        {/* Movie Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Production Information */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Production Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{movie.status}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Language:</span>
                  <span className="font-medium">{movie.original_language.toUpperCase()}</span>
                </div>
                
                {movie.budget > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{formatCurrency(movie.budget)}</span>
                  </div>
                )}
                
                {movie.revenue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{formatCurrency(movie.revenue)}</span>
                  </div>
                )}
                
                {movie.homepage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Homepage:</span>
                    <a 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  </div>
                )}
                
                {movie.imdb_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IMDb:</span>
                    <a 
                      href={`https://www.imdb.com/title/${movie.imdb_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View on IMDb
                    </a>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Production Companies */}
            {movie.production_companies.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Production Companies</h3>
                <div className="space-y-3">
                  {movie.production_companies.map((company) => (
                    <div key={company.id} className="flex items-center space-x-3">
                      {company.logo_path && (
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="h-8 w-auto object-contain"
                        />
                      )}
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.origin_country && (
                          <p className="text-sm text-muted-foreground">{company.origin_country}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Cast & Crew Tab */}
        <TabsContent value="cast" className="space-y-6">
          {isCreditsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : credits ? (
            <div className="space-y-6">
              {/* Cast Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {credits.cast.slice(0, 12).map((person) => (
                    <div key={person.credit_id} className="text-center">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Key Crew Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Key Crew</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {credits.crew
                    .filter(person => ['Director', 'Producer', 'Screenplay', 'Story', 'Director of Photography', 'Original Music Composer'].includes(person.job))
                    .slice(0, 9)
                    .map((person) => (
                    <div key={person.credit_id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">{person.job}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cast and crew information available.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* User Rating Section */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Rate This Movie</h3>
            <MovieRating
              currentRating={userRating}
              onRate={handleRating}
              size="lg"
              className="justify-center"
            />
            {userRating > 0 && (
              <p className="text-center mt-4 text-muted-foreground">
                Thank you for rating this movie!
              </p>
            )}
          </Card>
          
          {/* Reviews Placeholder */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">User Reviews</h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground">User reviews feature coming soon!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Rate the movie above to help other users discover great films.
              </p>
            </div>
          </Card>
        </TabsContent>
        
        {/* Similar Movies Tab */}
        <TabsContent value="similar" className="space-y-6">
          {isSimilarLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : similarMovies?.results.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.results.slice(0, 12).map((similarMovie) => (
                <div key={similarMovie.id} className="cursor-pointer hover:scale-105 transition-transform">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    {similarMovie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w342${similarMovie.poster_path}`}
                        alt={similarMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{similarMovie.title}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{similarMovie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No similar movies found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videos={videos?.results || []}
        movieTitle={movie.title}
      />
    </div>
  );
};

export default MovieDetailsPage;