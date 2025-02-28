using System.Linq;
using FilmRecomendations.Db.DbModels;
using FilmRecomendations.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FilmRecomendations.Db.Repos;

public class MovieRepo(FilmDbContext _context) : IMovieRepo
{
    public async Task<MovieDbM> AddMovieAsync(MovieCUDtO item)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == item.UserId) ?? 
            throw new ArgumentException($"User {item.UserId} does not exist in the database");

        var movie = new MovieDbM()
        {
            Title = item.Title,
            TMDbId = item.TMDbId,
            Liked = item.Liked,
            User = user
        };

        _context.Movies.Add(movie);

        await _context.SaveChangesAsync();

        return movie;
    }

    public async Task<MovieDbM> DeleteMovieAsync(Guid movieId)
    {
        var query = _context.Movies
            .Where(m => m.MovieId == movieId);

        var item = await query.FirstOrDefaultAsync() ?? 
            throw new ArgumentException($"Item {movieId} does not exist in the database");

        _context.Movies.Remove(item);

        await _context.SaveChangesAsync();

        return item;
    }

    public async Task<MovieDbM?> GetMovieAsync(Guid movieId)
    {
        return await _context.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.MovieId == movieId);
    }


    public async Task<ResponsePageDto<MovieDbM>> GetMoviesAsync(string filter, int pageNumber, int pageSize)
    {
        filter ??= "";
        filter = filter.ToLower();
        IQueryable<MovieDbM> query = _context.Movies.AsNoTracking();
        return new ResponsePageDto<MovieDbM>()
        {
            DbItemsCount = await query
                .Where(m => m.Title.ToLower().Contains(filter))
                .CountAsync(),
            
            PageItems = await query
                .Where(m => m.Title.ToLower().Contains(filter))
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync(),

            PageNr = pageNumber,
            PageSize = pageSize
        };
        
    }

    public async Task<ResponsePageDto<MovieDbM>> GetWatchlistAsync(string filter, int pageNumber, int pageSize)
    {
        filter ??= "";
        filter = filter.ToLower();
        IQueryable<MovieDbM> query = _context.Movies.AsNoTracking();
        return new ResponsePageDto<MovieDbM>()
        {
            DbItemsCount = await query
                .Where(m => m.Title.ToLower().Contains(filter)
                    && m.Liked == null)
                .CountAsync(),
            
            PageItems = await query
                .Where(m => m.Title.ToLower().Contains(filter)
                    && m.Liked == null)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync(),

            PageNr = pageNumber,
            PageSize = pageSize
        };
        
    }
    

    public async Task<MovieDbM> UpdateMovieAsync(MovieCUDtO item)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == item.UserId) ?? 
            throw new ArgumentException($"User {item.UserId} does not exist in the database");

        var query = _context.Movies
            .Where(m => m.MovieId == item.MovieId);

        var movie = await query.FirstOrDefaultAsync() ?? 
            throw new ArgumentException($"Item {item.MovieId} does not exist in the database");

        movie.Title = item.Title;
        movie.TMDbId = item.TMDbId;
        movie.Liked = item.Liked;
        movie.User = user;

        await _context.SaveChangesAsync();

        return movie;
    }
}