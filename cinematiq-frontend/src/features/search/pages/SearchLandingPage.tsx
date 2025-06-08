import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/features/auth/hooks/useAuth'

const SearchLandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, logout } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement AI search integration (RESTORE-003)
    console.log('Search query:', searchQuery)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
  }

  const handleLogin = () => {
    // TODO: Open login modal (RESTORE-005)
    console.log('Open login modal')
  }

  const handleRegister = () => {
    // TODO: Open register modal (RESTORE-005)
    console.log('Open register modal')
  }

  const handleLogout = async () => {
    await logout()
  }

  const suggestions = [
    "Movies directed by Christopher Nolan",
    "Romantic comedy from the 2000s", 
    "Movies for the whole family"
  ]

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
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>

        {/* Suggested phrases - matching original exactly */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {suggestions.map((suggestion, index) => (
            <span 
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion bg-blue-500 dark:bg-blue-900 text-blue-50 dark:text-blue-100 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-800 transition"
            >
              {suggestion}
            </span>
          ))}
        </div>

        {/* Movie recommendations container - will be populated in RESTORE-004 */}
        <div id="movieRecommendations" className="w-full max-w-xl mt-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Results will be rendered here */}
        </div>
      </main>
    </div>
  )
}

export default SearchLandingPage