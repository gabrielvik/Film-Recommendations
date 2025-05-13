// Helper functions for debugging and error handling

// Helper function to add debugging information
export function displayDebugInfo(data, seriesId) {
    // Only show in development mode or when enabled by query param
    const url = new URL(window.location);
    const debugMode = url.searchParams.get('debug') === 'true' || 
                      localStorage.getItem('debugMode') === 'true';
    
    if (!debugMode) return '';
    
    return `
        <div class="mt-8 p-4 bg-gray-900 rounded-lg text-xs">
            <div class="font-bold mb-2">Debug Info:</div>
            <div>Series ID: ${seriesId}</div>
            <div>API endpoint: https://localhost:7103/SeriesRecommendations/GetSeriesDetails/${seriesId}</div>
            <div class="mt-2">Data structure:</div>
            <pre class="overflow-auto max-h-40">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
}

// Display fallback static series data in case of API failure
export function displayStaticSeriesData(series) {
    const seriesDetailsContent = document.getElementById('seriesDetailsContent');
    
    seriesDetailsContent.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="flex flex-col md:flex-row items-start md:items-start gap-8">
                <div class="w-full md:w-1/3 flex justify-center md:justify-start">
                    <img src="${series.poster_path || '/src/assets/default-poster.png'}" 
                        alt="${series.series_name}" 
                        class="w-4/5 md:w-full max-w-xs rounded-lg shadow-lg"
                        onerror="this.src='/src/assets/default-poster.png'">
                </div>
                <div class="w-full md:w-2/3 flex flex-col gap-6">
                    <div>
                        <h2 class="text-3xl font-bold mb-4">${series.series_name || 'Unknown Series'} ${series.first_air_year ? `(${series.first_air_year})` : ''}</h2>
                        <p class="mb-4 text-gray-300">Unable to load detailed information at this time.</p>
                        <div class="bg-red-800 bg-opacity-20 text-red-200 p-4 rounded-lg mb-4">
                            <p>We're having trouble connecting to the series database. Please try again later.</p>
                            <p class="text-xs mt-2">Series ID: ${series.series_id}</p>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-xl font-semibold mb-4">Main Cast:</h3>
                            <p class="text-gray-300">Cast information not available at this time.</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button id="trailerButton" class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                            <div class="flex items-center">
                                <img src="/src/assets/play.png" class="w-4 h-4 me-2"> Trailer
                            </div>
                        </button>
                        <button id="backToResultsButton" class="bg-transparent hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-300 hover:border-transparent rounded">
                            Back to Results
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for trailer button - will show "no trailer available" message
    document.getElementById('trailerButton').addEventListener('click', () => {
        const trailerModal = document.getElementById('trailerModal');
        const trailerContainer = document.getElementById('trailerContainer');
        
        if (trailerContainer) {
            trailerContainer.innerHTML = `
                <div class="flex items-center justify-center h-64 bg-black">
                    <div class="text-center text-white p-4">
                        <p class="text-xl font-bold mb-2">No trailer available</p>
                        <p>There is currently no trailer available for this series.</p>
                    </div>
                </div>
            `;
        }
        
        if (trailerModal) {
            trailerModal.classList.remove('hidden');
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Add event listener for back button
    document.getElementById('backToResultsButton').addEventListener('click', () => {
        window.history.back();
    });
}