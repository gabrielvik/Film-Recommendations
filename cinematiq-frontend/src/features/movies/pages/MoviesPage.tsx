import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/Card'
import { 
  usePopularMovies, 
  useTopRatedMovies, 
  useUpcomingMovies, 
  useNowPlayingMovies 
} from '@/hooks/useMovies'
import { createImageUrl } from '@/lib/api'

const MoviesPage = () => {
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated' | 'upcoming' | 'now_playing'>('popular');

  const { data: popularMovies, isLoading: popularLoading } = usePopularMovies(1);
  const { data: topRatedMovies, isLoading: topRatedLoading } = useTopRatedMovies(1);
  const { data: upcomingMovies, isLoading: upcomingLoading } = useUpcomingMovies(1);
  const { data: nowPlayingMovies, isLoading: nowPlayingLoading } = useNowPlayingMovies(1);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'popular':
        return { data: popularMovies, isLoading: popularLoading };
      case 'top_rated':
        return { data: topRatedMovies, isLoading: topRatedLoading };
      case 'upcoming':
        return { data: upcomingMovies, isLoading: upcomingLoading };
      case 'now_playing':
        return { data: nowPlayingMovies, isLoading: nowPlayingLoading };
      default:
        return { data: popularMovies, isLoading: popularLoading };
    }
  };

  const { data, isLoading } = getCurrentData();
  const movies = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Discover Movies</h1>
        <p className="text-muted-foreground">Explore trending, popular, and latest movies</p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-4 border-b">
        <Button 
          variant="ghost" 
          className={activeTab === 'popular' ? 'border-b-2 border-primary' : ''}
          onClick={() => setActiveTab('popular')}
        >
          <span className="mr-2">🔥</span>
          Popular
        </Button>
        <Button 
          variant="ghost"
          className={activeTab === 'top_rated' ? 'border-b-2 border-primary' : ''}
          onClick={() => setActiveTab('top_rated')}
        >
          <span className="mr-2">⭐</span>
          Top Rated
        </Button>
        <Button 
          variant="ghost"
          className={activeTab === 'upcoming' ? 'border-b-2 border-primary' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          <span className="mr-2">📅</span>
          Upcoming
        </Button>
        <Button 
          variant="ghost"
          className={activeTab === 'now_playing' ? 'border-b-2 border-primary' : ''}
          onClick={() => setActiveTab('now_playing')}
        >
          <span className="mr-2">🎬</span>
          Now Playing
        </Button>
      </div>

      {/* Movies Grid */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-muted"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[2/3] bg-muted">
                  <img 
                    src={createImageUrl(movie.poster_path)} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1489599242705-34052dd0a3bc?w=300&h=450&fit=crop';
                    }}
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2" title={movie.title}>
                    {movie.title}
                  </h3>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{new Date(movie.release_date).getFullYear() || 'TBA'}</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MoviesPage
