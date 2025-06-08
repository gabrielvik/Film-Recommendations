import { Link } from 'react-router-dom'
import { Film, Search, TrendingUp, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const HomePage = () => {
  const featuredMovies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      year: 1994,
      rating: 9.3,
      poster: "https://images.unsplash.com/photo-1489599242705-34052dd0a3bc?w=300&h=450&fit=crop"
    },
    {
      id: 2,
      title: "The Godfather",
      year: 1972,
      rating: 9.2,
      poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop"
    },
    {
      id: 3,
      title: "The Dark Knight",
      year: 2008,
      rating: 9.0,
      poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop"
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Discover Your Next
          </h1>
          <h1 className="text-4xl md:text-6xl font-bold">
            Favorite Movie
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized movie recommendations, read reviews, and discover hidden gems with our intelligent movie discovery platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/movies">
            <Button size="lg" className="w-full sm:w-auto">
              <Film className="mr-2 h-5 w-5" />
              Explore Movies
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Search className="mr-2 h-5 w-5" />
              Search Movies
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="p-6 text-center space-y-4">
          <TrendingUp className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-xl font-semibold">Trending Movies</h3>
          <p className="text-muted-foreground">
            Stay up to date with the latest trending movies and discover what everyone is watching.
          </p>
        </Card>
        
        <Card className="p-6 text-center space-y-4">
          <Star className="h-12 w-12 text-accent mx-auto" />
          <h3 className="text-xl font-semibold">Smart Recommendations</h3>
          <p className="text-muted-foreground">
            Get personalized movie recommendations based on your viewing history and preferences.
          </p>
        </Card>
        
        <Card className="p-6 text-center space-y-4">
          <Users className="h-12 w-12 text-secondary mx-auto" />
          <h3 className="text-xl font-semibold">Community Reviews</h3>
          <p className="text-muted-foreground">
            Read reviews from fellow movie lovers and share your own thoughts and ratings.
          </p>
        </Card>
      </section>

      {/* Featured Movies */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Featured Movies</h2>
          <Link to="/movies">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {featuredMovies.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[2/3] bg-muted">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{movie.year}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
