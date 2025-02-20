using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Services;

interface IMovieDbService
{
    /// <summary>
    /// Fetches all movie ids by searching the movie database by name
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    public Task<List<int>> GetMovieIdsAsync(List<string> movieNames);

    /// <summary>
    /// fetches movie details by movie id
    /// </summary>
    /// <param name="movieIds"></param>
    /// <returns></returns>
    public Task<List<Movie>> GetMovieDetails(List<int> movieIds);
}
