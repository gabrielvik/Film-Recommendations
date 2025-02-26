// Preserve dark mode setting
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Retrieve the movie data from sessionStorage
const movie = JSON.parse(sessionStorage.getItem('selectedMovie'));

if (!movie) {
    document.getElementById('movieDetailsContent').innerHTML = `
        <div class="text-center p-4">No movie details available.</div>
    `;
} else {
    document.getElementById('movieDetailsContent').innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="w-3/5 sm:w-1/2 md:w-1/4 lg:w-1/5 rounded-lg">
        <div class="flex flex-col gap-6">
        <div class="mt-4 md:mt-0 md:ml-6">
        <p class="mb-2 flex items-center font-bold">
                <span>${movie.rating}</span>
                <img src="/src/assets/star.png" alt="Star" class="w-3 h-3 ml-1" />
            </p>
            <h2 class="text-3xl font-bold mb-4">${movie.title} (${movie.releaseYear})</h2>
            <p class="mb-2"><span class="font-semibold w-24">${movie.genre}</p>
            <p class="mb-2"><span class="w-24">${movie.plot}</p>
            <p class="mb-2"><span class="font-semibold w-24">Land:</span> USA</p>
            <p class="mb-2"><span class="font-semibold w-24">Regissör:</span> ${movie.director}</p>
            <p class="mb-2"><span class="font-semibold w-24">Skådespelare:</span> ${movie.actors}</p>
            <p class="mb-2"><span class="font-semibold w-24">Length:</span> ${movie.length}</p>
            <hr class="border-t border-gray-300 dark:border-gray-700 mt-4">
        </div>
        <div class="mt-2 md:mt-0 md:ml-6">
            <button class="bg-transparent hover:bg-blue-500 dark:hover:bg-blue-700 text-blue-700 dark:text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 dark:border-blue-300 hover:border-transparent rounded my-1">
                <div class="flex items-center">
                    <img src="${currentTheme === 'dark' ? '/src/assets/play.png' : '/src/assets/play1.png'}" class="w-4 h-4 me-2"> Trailer
                </div>
        </button>
        <button class="bg-transparent hover:bg-blue-500 dark:hover:bg-blue-700 text-blue-700 dark:text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 dark:border-blue-300 hover:border-transparent rounded mx-4 my-1">
            <div class="flex items-center">
                    <img src="${currentTheme === 'dark' ? '/src/assets/layer-plus1.png' : '/src/assets/layer-plus.png'}" class="w-4 h-4 me-2"> Lägg till i lista
            </div>
        </button>
        <button class="bg-transparent hover:bg-blue-500 dark:hover:bg-blue-700 text-blue-700 dark:text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 dark:border-blue-300 hover:border-transparent rounded my-1">
            <div class="flex items-center">
                    <img src="${currentTheme === 'dark' ? '/src/assets/check1.png' : '/src/assets/check.png'}" class="w-4 h-4 me-2"> Markera som sett
            </div>
        </button>
        </div>
        <details class="group mt-4 md:mt-0 md:ml-6">
            <summary class="text-l font-bold cursor-pointer">
                Var kan jag streama ${movie.title}?
            </summary>
            <div class="overflow-hidden max-h-0 transition-all duration-300 group-open:max-h-96">
                <hr class="border-t border-gray-300 dark:border-gray-700 mt-2">
                <p class="mt-2">
                    Här kan du hitta detaljer om var du kan streama filmen.
                </p>
            </div>
        </details>
        </div>
    `;
    // Update URL in the address bar without reloading the page
    const movieSlug = movie.title.toLowerCase().replace(/\s+/g, '-');
    window.history.replaceState(null, '', movieSlug);
}

// Back button event listener to return to the movie results page
document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});