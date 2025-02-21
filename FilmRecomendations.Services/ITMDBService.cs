using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Services;

public interface ITMDBService
{
    /// <summary>
    /// Fetches the movie id by searching the movie database by name and release year
    /// </summary>
    /// <param name="movieName">Name of the movie</param>
    /// <param name="releaseYear">Release year of the movie</param>
    /// <returns>Movie ID from TMDB</returns>
    Task<int> GetMovieIdAsync(string movieName, int releaseYear);

    /// <summary>
    /// Fetches movie details by movie id
    /// </summary>
    /// <param name="movieId">ID of the movie in TMDB</param>
    /// <returns>Movie details</returns>
    Task<Movie?> GetMovieDetailsAsync(int movieId);
}