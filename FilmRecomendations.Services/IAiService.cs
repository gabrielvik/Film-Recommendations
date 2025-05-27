using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Services;

public interface IAiService
{
    Task<string> GetMovieRecommendationsAsync(string prompt, List<MovieGetDto>? userMovies);
}