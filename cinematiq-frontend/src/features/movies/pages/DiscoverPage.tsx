import { useState } from 'react';
import { usePopularMovies, useTopRatedMovies, useUpcomingMovies, useNowPlayingMovies } from '@/hooks/useMovies';
import { MovieCard, LoadingSkeleton } from '../components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, Calendar, Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiscoverPage = () => {
  const [watchlistIds] = useState<Set<number>>(new Set());
  const [favoriteIds] = useState<Set<number>>(new Set());

  const { data: popularMovies, isLoading: popularLoading } = usePopularMovies();
  const { data: topRatedMovies, isLoading: topRatedLoading } = useTopRatedMovies();
  const { data: upcomingMovies, isLoading: upcomingLoading } = useUpcomingMovies();
  const { data: nowPlayingMovies, isLoading: nowPlayingLoading } = useNowPlayingMovies();

  const handleWatchlistAdd = (movieId: number) => {
    console.log('Add to watchlist:', movieId);
  };

  const handleFavoriteAdd = (movieId: number) => {
    console.log('Add to favorites:', movieId);
  };

  const sections = [
    {
      title: 'Trending Now',
      subtitle: 'Most popular movies right now',
      icon: TrendingUp,
      iconColor: 'text-red-500',
      data: popularMovies?.results,
      isLoading: popularLoading,
      link: '/search?sort=popularity.desc',
      variant: 'featured' as const,
      limit: 3,
    },
    {
      title: 'Top Rated',
      subtitle: 'Highest rated movies of all time',
      icon: Star,
      iconColor: 'text-yellow-500',
      data: topRatedMovies?.results,
      isLoading: topRatedLoading,
      link: '/search?sort=vote_average.desc',
      variant: 'default' as const,
      limit: 12,
    },
    {
      title: 'Coming Soon',
      subtitle: 'Upcoming releases to watch out for',
      icon: Calendar,
      iconColor: 'text-blue-500',
      data: upcomingMovies?.results,
      isLoading: upcomingLoading,
      link: '/search?sort=release_date.desc',
      variant: 'default' as const,
      limit: 8,
    },
    {
      title: 'Now Playing',
      subtitle: 'Currently in theaters',
      icon: Play,
      iconColor: 'text-green-500',
      data: nowPlayingMovies?.results,
      isLoading: nowPlayingLoading,
      link: '/search?sort=popularity.desc&now_playing=true',
      variant: 'compact' as const,
      limit: 6,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Discover Amazing Movies
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore thousands of movies, from trending blockbusters to hidden gems waiting to be discovered
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/search">
            <Button size="lg" className="text-base">
              Advanced Search
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/search?sort=vote_average.desc">
            <Button variant="outline" size="lg" className="text-base">
              <Star className="mr-2 h-4 w-4" />
              Top Rated
            </Button>
          </Link>
        </div>
      </div>

      {/* Movie Sections */}
      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <section.icon className={`h-6 w-6 ${section.iconColor}`} />
              <div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.subtitle}</p>
              </div>
            </div>
            <Link to={section.link}>
              <Button variant="ghost">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {section.isLoading ? (
            <div className={`grid gap-4 ${
              section.variant === 'featured' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : section.variant === 'compact'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            }`}>
              <LoadingSkeleton count={section.limit} variant={section.variant} />
            </div>
          ) : (
            <div className={`grid gap-4 ${
              section.variant === 'featured' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : section.variant === 'compact'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            }`}>
              {section.data?.slice(0, section.limit).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  variant={section.variant}
                  onWatchlistAdd={handleWatchlistAdd}
                  onFavoriteAdd={handleFavoriteAdd}
                  isInWatchlist={watchlistIds.has(movie.id)}
                  isInFavorites={favoriteIds.has(movie.id)}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      {/* CTA Section */}
      <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h3>
        <p className="text-muted-foreground mb-6">
          Use our advanced search and filtering system to discover exactly what you want to watch
        </p>
        <Link to="/search">
          <Button size="lg">
            Try Advanced Search
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default DiscoverPage;
