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
    Task<MovieIdResponse> GetMovieIdAsync(string movieName, int releaseYear);

    /// <summary>
    /// Fetches movie details by movie id
    /// </summary>
    /// <param name="movieId">ID of the movie in TMDB</param>
    /// <returns>Movie details</returns>
    Task<Movie?> GetMovieDetailsAsync(int movieId);

    /// <summary>
    /// Fetches streaming providers for a movie by movie id
    /// </summary>
    /// <param name="movieId">ID of the movie in TMDB</param>
    /// <returns>Streaming provider information</returns>
    Task<StreamingProviderResponse> GetStreamingProvidersAsync(int movieId);
    
    /// <summary>
    /// Fetches movie trailers by movie id
    /// </summary>
    /// <param name="movieId">ID of the movie in TMDB</param>
    /// <returns>List of movie trailers</returns>
    Task<List<MovieTrailer>> GetMovieTrailersAsync(int movieId);
    
    /// <summary>
    /// Searches for a TV series by name
    /// </summary>
    /// <param name="seriesName">Name of the TV series</param>
    /// <param name="firstAirYear">Optional first air year</param>
    /// <returns>TV series ID response</returns>
    Task<TVSeriesIdResponse> GetTVSeriesIdAsync(string seriesName, int? firstAirYear = null);
    
    /// <summary>
    /// Fetches TV series details by series id
    /// </summary>
    /// <param name="seriesId">ID of the TV series in TMDB</param>
    /// <returns>TV series details</returns>
    Task<TVSeriesDetails?> GetTVSeriesDetailsAsync(int seriesId);
    
    /// <summary>
    /// Fetches season details for a TV series
    /// </summary>
    /// <param name="seriesId">ID of the TV series</param>
    /// <param name="seasonNumber">Season number</param>
    /// <returns>Season details including episodes</returns>
    Task<SeasonDetails?> GetSeasonDetailsAsync(int seriesId, int seasonNumber);
    
    /// <summary>
    /// Fetches streaming providers for a TV series
    /// </summary>
    /// <param name="seriesId">ID of the TV series</param>
    /// <returns>Streaming provider information</returns>
    Task<StreamingProviderResponse> GetTVStreamingProvidersAsync(int seriesId);
    
    /// <summary>
    /// Fetches trailers for a TV series
    /// </summary>
    /// <param name="seriesId">ID of the TV series</param>
    /// <returns>List of TV series trailers</returns>
    Task<List<MovieTrailer>> GetTVTrailersAsync(int seriesId);
}