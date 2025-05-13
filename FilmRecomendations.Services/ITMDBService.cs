using FilmRecomendations.Models.DTOs;
using FilmRecomendations.Models.DTOs.Series;

namespace FilmRecomendations.Services;

public interface ITMDBService
{
    // Movie-related methods
    /// <summary>
    /// Fetches the movie id by searching the movie database by name and release year
    /// </summary>
    /// <param name="movieName">Name of the movie</param>
    /// <param name="releaseYear">Release year of the movie</param>
    /// <returns>Movie ID from TMDB</returns>
    Task<MovieIdResponse> GetMovieIdAsync(string movieName, int releaseYear);

    /// <summary>
    /// Fetches movie details by movie id
    /// </summary>
    /// <param name="movieId">ID of the movie in TMDB</param>
    /// <returns>Movie details</returns>
    Task<Movie> GetMovieDetailsAsync(int movieId);
    
    /// <summary>
    /// Fetches streaming providers for a movie by movie id
    /// </summary>
    /// <param name="movieId">ID of the movie in TMDB</param>
    /// <returns>Streaming provider information</returns>
    Task<StreamingProviderResponse> GetStreamingProvidersAsync(int movieId);
    
    Task<List<MovieTrailer>> GetMovieTrailersAsync(int movieId);
    Task<List<Director>> GetMovieDirectorsAsync(int movieId);
    Task<List<Actor>> GetMovieActorsAsync(int movieId);
    
    /// <summary>
    /// Fetches detailed information for an actor including biography and known for movies
    /// </summary>
    /// <param name="actorId">ID of the actor in TMDB</param>
    /// <returns>Actor details with known for movies</returns>
    Task<ActorDetails> GetActorDetailsAsync(int actorId);
    
    // Series-related methods
    /// <summary>
    /// Fetches the series id by searching the tv database by name and first air year
    /// </summary>
    /// <param name="seriesName">Name of the series</param>
    /// <param name="firstAirYear">First air year of the series</param>
    /// <returns>Series ID from TMDB</returns>
    Task<SeriesIdResponse> GetSeriesIdAsync(string seriesName, int firstAirYear);
    
    /// <summary>
    /// Fetches series details by series id
    /// </summary>
    /// <param name="seriesId">ID of the series in TMDB</param>
    /// <returns>Series details</returns>
    Task<Series> GetSeriesDetailsAsync(int seriesId);
    
    /// <summary>
    /// Fetches streaming providers for a series by series id
    /// </summary>
    /// <param name="seriesId">ID of the series in TMDB</param>
    /// <returns>Streaming provider information</returns>
    Task<StreamingProviderResponse> GetSeriesStreamingProvidersAsync(int seriesId);
    
    Task<List<SeriesTrailer>> GetSeriesTrailersAsync(int seriesId);
    Task<List<Creator>> GetSeriesCreatorsAsync(int seriesId);
    Task<List<Actor>> GetSeriesActorsAsync(int seriesId);
}