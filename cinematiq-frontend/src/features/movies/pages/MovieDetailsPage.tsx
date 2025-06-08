import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Star, Clock, Calendar, Heart } from 'lucide-react'

const MovieDetailsPage = () => {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Movie Poster</span>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">Movie Title</h1>
              <p className="text-muted-foreground">Movie details for ID: {id}</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>8.5/10</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>142 min</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>2024</span>
              </div>
            </div>
            
            <p className="text-muted-foreground">
              Movie details and synopsis will be displayed here. This is a placeholder for the movie details page.
            </p>
            
            <div className="flex space-x-4">
              <Button>
                <Heart className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button variant="outline">Rate Movie</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default MovieDetailsPage
