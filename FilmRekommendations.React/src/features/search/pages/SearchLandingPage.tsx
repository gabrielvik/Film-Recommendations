import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/features/search/hooks/useSearch'
import { LoadingIndicator } from '@/features/search/components/LoadingIndicator'
import { MovieResults } from '@/features/search/components/MovieResults'
import SuggestionChips from '@/features/search/components/SuggestionChips'
import LoginModal from '@/features/auth/components/LoginModal'
import RegisterModal from '@/features/auth/components/RegisterModal'

const SearchLandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { movies, isLoading, error, lastQuery, search, clearResults, clearError } = useSearch()

  // Restore previous search on page load
  useEffect(() => {
    const savedQuery = sessionStorage.getItem('lastSearchQuery')
    const savedMovies = sessionStorage.getItem('movieRecommendations')
    
    if (savedQuery) {
      setSearchQuery(savedQuery)
    }
    
    // If we have saved movies but no current movies, this indicates page refresh
    if (savedMovies && !movies.length && !isLoading) {
      try {
        const parsedMovies = JSON.parse(savedMovies)
        if (parsedMovies.length > 0) {
          // Re-trigger search to restore state properly
          if (savedQuery) {
            search(savedQuery)
          }
        }
      } catch (e) {
        // Clear invalid saved data
        sessionStorage.removeItem('movieRecommendations')
        sessionStorage.removeItem('lastSearchQuery')
      }
    }
  }, [movies.length, isLoading, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    
    if (!query) return
    
    // Clear previous error
    clearError()
    
    // Perform AI search
    await search(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    // Automatically search when suggestion is clicked
    search(suggestion)
  }

  const handleLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const handleRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const handleLogout = async () => {
    await logout()
    clearResults() // Clear search results on logout
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-200 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Top-right controls - matching original exactly */}
      <div className="flex gap-3 absolute top-4 right-6 z-10">
        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <span className="bg-gray-600 text-white font-semibold py-2 px-4 rounded flex items-center">
                Welcome, {user?.name || 'User'}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold hover:text-white py-2 px-4 rounded"
              >
                <div className="flex items-center">
                  Log out
                </div>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleLogin}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold hover:text-white py-2 px-4 rounded"
              >
                <div className="flex items-center">
                  Log in
                </div>
              </button>
              <button 
                onClick={handleRegister}
                className="bg-pink-600 hover:bg-pink-500 text-white font-semibold hover:text-white py-2 px-4 rounded"
              >
                <div className="flex items-center">
                  Create an account
                </div>
              </button>
            </>
          )}
        </div>
        
        {/* Custom theme toggle to match original exactly */}
        <div className="bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
          <ThemeToggle variant="icon" className="h-6 w-6" />
        </div>
      </div>

      {/* Main content area - matching original exactly */}
      <main className="flex-grow flex flex-col items-center px-4 md:px-16 pt-20">
        <h1 className="mt-10 text-xl font-semibold mb-2 text-center dark:text-gray-100 max-w-3xl">
          What kind of movie are you in the mood for?
        </h1>
        
        {/* Input form - matching original exactly */}
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="T.ex. 'I want to see a thriller...'"
              className="flex-grow rounded border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:border-blue-500 transition bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !searchQuery.trim()}
              className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Suggested phrases - matching original exactly */}
        <SuggestionChips 
          onSuggestionClick={handleSuggestionClick}
          className="mt-4"
        />

        {/* Loading indicator */}
        {isLoading && (
          <LoadingIndicator 
            className="mt-8" 
            message="Getting AI-powered movie recommendations..."
          />
        )}

        {/* Movie recommendations */}
        <MovieResults 
          movies={movies}
          isLoading={isLoading}
          error={error}
        />
      </main>

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  )
}

export default SearchLandingPage