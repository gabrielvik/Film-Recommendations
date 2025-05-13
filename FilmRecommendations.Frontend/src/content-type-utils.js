// Move these variables outside the DOMContentLoaded event to make them global to this module
// Movie suggestion bubbles
const movieSuggestions = [
    "Filmer regisserade av Christopher Nolan",
    "Romantisk komedi från 00-talet",
    "Filmer för hela familjen"
];

// Series suggestion bubbles
const seriesSuggestions = [
    "Nordiska kriminalserier",
    "Komediserier från 2010-talet",
    "Sci-fi serier med starka kvinnliga karaktärer"
];

// Create function to get current content type that always reads fresh from localStorage
function getCurrentContentType() {
    return localStorage.getItem('contentType') || 'movies';
}

// Create a function to get the suggestions container that's always up-to-date
function getSuggestionsContainer() {
    return document.querySelector('.flex.flex-wrap.gap-2.justify-center.mt-4');
}

document.addEventListener('DOMContentLoaded', () => {
    // These will be determined dynamically later

    // Function to update suggestions based on content type
    function updateSuggestions() {
        // Always get the latest container and content type
        const suggestionsContainer = getSuggestionsContainer();
        const currentContentType = getCurrentContentType();
        
        if (!suggestionsContainer) return;

        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        // Select suggestions based on current content type
        const suggestions = currentContentType === 'movies' ? movieSuggestions : seriesSuggestions;
        
        console.log(`Updating suggestions for content type: ${currentContentType}`, suggestions);
        
        suggestions.forEach(suggestion => {
            const span = document.createElement('span');
            
            // Add common classes
            span.classList.add(
                'suggestion',
                'px-3',
                'py-1',
                'rounded-full',
                'cursor-pointer',
                'transition-all',
                'duration-300'
            );
            
            // Add different styling based on content type
            if (currentContentType === 'movies') {
                span.classList.add(
                    'bg-blue-500',
                    'hover:bg-blue-600',
                    'dark:bg-blue-900',
                    'dark:hover:bg-blue-800',
                    'text-blue-50',
                    'dark:text-blue-100'
                );
            } else {
                span.classList.add(
                    'bg-indigo-500',
                    'hover:bg-indigo-600',
                    'dark:bg-indigo-900',
                    'dark:hover:bg-indigo-800',
                    'text-indigo-50',
                    'dark:text-indigo-100'
                );
            }
            
            span.textContent = suggestion;
            
            // Add click event to set the suggestion as the input value and trigger search
            span.addEventListener('click', () => {
                const promptInput = document.getElementById('promptInput');
                if (promptInput) {
                    promptInput.value = suggestion;
                    
                    // Optional: Automatically trigger the search when a suggestion is clicked
                    const form = document.getElementById('promptForm');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            });
            
            suggestionsContainer.appendChild(span);
        });
    }

    // Initial update of suggestions
    updateSuggestions();

    // Direct toggle event - this is the most reliable approach
    const contentTypeToggle = document.getElementById('contentTypeToggle');
    if (contentTypeToggle) {
        // Use the capture phase to ensure this runs before other handlers
        contentTypeToggle.addEventListener('click', () => {
            // Immediate update without waiting for event propagation
            console.log('Content type toggled directly - capture phase');
            
            // Force immediate update with no delay - this should run right after localStorage is updated
            // The click event on contentTypeToggle is handled in main.js first, which updates localStorage
            setTimeout(() => {
                updateSuggestions();
                updatePageTitle();
                console.log('Suggestions and title forcefully updated after toggle');
            }, 0);
        }, true); // true = capture phase, runs BEFORE bubbling phase handlers
        
        // Also add a regular event in case the capture phase doesn't work as expected
        contentTypeToggle.addEventListener('click', () => {
            setTimeout(() => {
                updateSuggestions();
                updatePageTitle();
            }, 50); // slightly longer delay as a backup
        });
    }
    
    // Also listen for the custom event as a backup
    document.addEventListener('contentTypeChanged', (event) => {
        console.log('contentTypeChanged event received', event.detail);
        // Immediate update in response to the custom event
        updateSuggestions();
        updatePageTitle();
    });
    
    // Watch for localStorage changes (in case another tab changes the content type)
    window.addEventListener('storage', (event) => {
        if (event.key === 'contentType') {
            console.log('contentType changed in storage', event.newValue);
            updateSuggestions();
            updatePageTitle();
        }
    });
    
    // Add a global event listener for update suggestions event
    document.addEventListener('updateSuggestionsEvent', () => {
        console.log('Update suggestions event received');
        updateSuggestions();
    });
    
    // Export the updateSuggestions function to global scope so it can be called from main.js
    window.updateSuggestions = updateSuggestions;

    // Update page title based on content type
    function updatePageTitle() {
        const pageTitle = document.querySelector('h1.mt-10.text-2xl');
        if (pageTitle) {
            // Always get the latest content type directly from localStorage
            const contentType = getCurrentContentType();
            console.log('Updating page title based on content type:', contentType);
            
            if (contentType === 'movies') {
                pageTitle.textContent = 'Vilken typ av film vill du se?';
            } else {
                pageTitle.textContent = 'Vilken typ av serie vill du se?';
            }
        }
    }

    // Initial update of page title
    updatePageTitle();

    // Setup a periodic check to ensure suggestions stay in sync with the content type
    // This is an extra safety measure in case other event handlers fail
    let lastCheckedContentType = getCurrentContentType();
    setInterval(() => {
        const currentContentType = getCurrentContentType();
        if (currentContentType !== lastCheckedContentType) {
            console.log('Content type change detected in interval check', currentContentType);
            lastCheckedContentType = currentContentType;
            updateSuggestions();
            updatePageTitle();
        }
    }, 500); // Check every half second

    // Page title updates are now handled by the contentTypeChanged event listener
});