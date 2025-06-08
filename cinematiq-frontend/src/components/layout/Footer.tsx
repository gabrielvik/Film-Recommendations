import { Link } from 'react-router-dom'
import { Film, Heart } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CinematIQ
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover your next favorite movie with intelligent recommendations and comprehensive reviews.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navigation</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/movies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Movies
              </Link>
              <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Search
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="font-semibold">Account</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CinematIQ. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center mt-2 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for movie lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
