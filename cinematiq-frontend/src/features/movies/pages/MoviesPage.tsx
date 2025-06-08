import { Button } from '@/components/ui/button'

const MoviesPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Discover Movies</h1>
        <p className="text-muted-foreground">Explore trending, popular, and latest movies</p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-4 border-b">
        <Button variant="ghost" className="border-b-2 border-primary">
          <span className="mr-2">📈</span>
          Trending
        </Button>
        <Button variant="ghost">
          <span className="mr-2">⭐</span>
          Popular
        </Button>
        <Button variant="ghost">
          <span className="mr-2">📅</span>
          Latest
        </Button>
      </div>

      <div className="text-center py-12">
        <div className="h-16 w-16 text-muted-foreground mx-auto mb-4 text-6xl">🎬</div>
        <h3 className="text-xl font-semibold mb-2">Movies Coming Soon</h3>
        <p className="text-muted-foreground">This feature will be implemented in the next phase</p>
      </div>
    </div>
  )
}

export default MoviesPage
