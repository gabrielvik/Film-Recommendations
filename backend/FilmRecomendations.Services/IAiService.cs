namespace FilmRecomendations.Services;

public interface IAiService
{
    Task<string> GetMovieRecommendationsAsync(string prompt);
}