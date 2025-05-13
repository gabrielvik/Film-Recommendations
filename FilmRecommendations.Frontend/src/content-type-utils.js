document.addEventListener('DOMContentLoaded', () => {
    // Movie suggestion bubbles
    const movieSuggestions = [
        "Filmer regisserade av Christopher Nolan",
        "Romantisk komedi från 00-talet",
        "Filmer för hela familjen"
    ];

    // Series suggestion bubbles
    const seriesSuggestions = [
        "Nordiska kriminalserier",
        "Dokumentärserier om historia",
        "Fantasy-serier som Game of Thrones"
    ];

    // Get the suggestions container and the content type
    const suggestionsContainer = document.querySelector('.flex.flex-wrap.gap-2.justify-center.mt-4');
    const currentContentType = localStorage.getItem('contentType') || 'movies';

    // Function to update suggestions based on content type
    function updateSuggestions() {
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = '';
        
        const suggestions = currentContentType === 'movies' ? movieSuggestions : seriesSuggestions;
        
        suggestions.forEach(suggestion => {
            const span = document.createElement('span');
            span.classList.add(
                'suggestion',
                'bg-blue-500',
                'dark:bg-blue-900',
                'text-blue-50',
                'dark:text-blue-100',
                'px-3',
                'py-1',
                'rounded-full',
                'cursor-pointer'
            );
            span.textContent = suggestion;
            
            // Add click event to set the suggestion as the input value
            span.addEventListener('click', () => {
                document.getElementById('promptInput').value = suggestion;
            });
            
            suggestionsContainer.appendChild(span);
        });
    }

    // Initial update of suggestions
    updateSuggestions();

    // Listen for content type changes
    const contentTypeToggle = document.getElementById('contentTypeToggle');
    if (contentTypeToggle) {
        contentTypeToggle.addEventListener('click', () => {
            // Use a direct approach instead of setTimeout for more reliable execution
            const newContentType = currentContentType === 'movies' ? 'series' : 'movies';
            currentContentType = newContentType;
            updateSuggestions();
            
            // Force page reload if needed instead of relying on other script behaviors
            // This ensures complete refresh of the view when switching content types
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                // We're on the main page, don't reload but let main.js handle it
                // The updates in main.js will take care of properly rendering the content
            }
        });
    }

    // Update page title based on content type
    function updatePageTitle() {
        const pageTitle = document.querySelector('h1.mt-10.text-2xl');
        if (pageTitle) {
            if (currentContentType === 'movies') {
                pageTitle.textContent = 'Vilken typ av film vill du se?';
            } else {
                pageTitle.textContent = 'Vilken typ av serie vill du se?';
            }
        }
    }

    // Initial update of page title
    updatePageTitle();

    // Listen for content type changes for page title
    if (contentTypeToggle) {
        contentTypeToggle.addEventListener('click', () => {
            // Update immediately instead of using setTimeout for more reliable execution
            const newContentType = localStorage.getItem('contentType') || 'movies';
            if (newContentType !== currentContentType) {
                currentContentType = newContentType;
            }
            updatePageTitle();
        });
    }
});