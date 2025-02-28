using FilmRecomendations.Db.DbModels;
using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Db.Repos;

public interface IMovieRepo
{
    Task<MovieDbM> AddMovieAsync(MovieCUDtO item);
    Task<ResponsePageDto<MovieDbM>> GetMoviesAsync(string filter, int pageNumber, int pageSize);
    Task<ResponsePageDto<MovieDbM>> GetWatchlistAsync(string filter, int pageNumber, int pageSize);
    Task<MovieDbM?> GetMovieAsync(Guid MovieDbId);
    Task<MovieDbM> UpdateMovieAsync(MovieCUDtO item);
    Task<MovieDbM> DeleteMovieAsync(Guid MovieDbId);
}