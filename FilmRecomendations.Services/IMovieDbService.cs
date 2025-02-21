using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Services;

public interface IMovieDbService
{
    /// <summary>
    /// Fetches the movie id by searching the movie database by name and release year
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    public Task<int> GetMovieIdsAsync(string movieName, int releaseYear);

    /// <summary>
    /// fetches movie details by movie id
    /// </summary>
    /// <param name="movieIds"></param>
    /// <returns></returns>
    public Movie GetMovieDetails(int movieId);
}
