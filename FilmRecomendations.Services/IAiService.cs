namespace FilmRecomendations.Services;

public interface IAiService
{
    Task<string> GetMovieRecommendationsAsync(string prompt);
    Task<string> GetTVSeriesRecommendationsAsync(string prompt);
    Task<string> GetMixedContentRecommendationsAsync(string prompt, bool includeMovies = true, bool includeTVSeries = true);
}