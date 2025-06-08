import React from 'react'

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void
  className?: string
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  onSuggestionClick, 
  className = '' 
}) => {
  // Predefined queries from original frontend
  const suggestions = [
    "Movies directed by Christopher Nolan",
    "Romantic comedy from the 2000s", 
    "Movies for the whole family"
  ]

  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {suggestions.map((suggestion, index) => (
        <span 
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="suggestion bg-blue-500 dark:bg-blue-900 text-blue-50 dark:text-blue-100 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-800 transition"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSuggestionClick(suggestion)
            }
          }}
        >
          {suggestion}
        </span>
      ))}
    </div>
  )
}

export default SuggestionChips