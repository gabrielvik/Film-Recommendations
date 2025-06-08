import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, Filter, Grid } from 'lucide-react'

const SearchPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search Movies</h1>
        <p className="text-muted-foreground">Find your next favorite movie with our advanced search</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for movies..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      <div className="text-center py-12">
        <Grid className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
        <p className="text-muted-foreground">Enter a movie title above to get started</p>
      </div>
    </div>
  )
}

export default SearchPage
