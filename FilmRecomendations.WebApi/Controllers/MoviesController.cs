using System.Security.Claims;
using FilmRecomendations.Db.DbModels;
using FilmRecomendations.Db.Repos;
using FilmRecomendations.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FilmRecomendations.WebApi.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class MoviesController : ControllerBase
{
    private readonly IMovieRepo _movieRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(IMovieRepo movieRepo, UserManager<ApplicationUser> userManager, ILogger<MoviesController> logger)
    {
        _movieRepo = movieRepo;
        _userManager = userManager;
        _logger = logger;
    }
    [HttpGet("watchlist")]
    [ProducesResponseType(200, Type = typeof(IEnumerable<MovieGetDto>))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> GetWatchList(string? filter = null, int pageNumber = 0, int pageSize = 10)
    {
        try
        {
            var username = _userManager.GetUserName(User);
            if (username == null)
            {
                return BadRequest("User not found");
            }
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var watchList = await _movieRepo.GetWatchlistAsync(user.Id, filter, pageNumber, pageSize);

            return Ok(watchList);
        }
        catch(Exception e)
        {
            _logger.LogError(e, "Error in GetWatchList");
            return BadRequest("Error in GetWatchList");
        }
    }

    [HttpGet()]
    [ProducesResponseType(200, Type = typeof(IEnumerable<MovieGetDto>))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> GetMovies(string? filter = null, int pageNumber = 0, int pageSize = 10)
    {
        try
        {
            var username = _userManager.GetUserName(User);
            if (username == null)
            {
                return BadRequest("User not found");
            }
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var movies = await _movieRepo.GetMoviesAsync(user.Id, filter, pageNumber, pageSize);

            return Ok(movies);
        }
        catch(Exception e)
        {
            _logger.LogError(e, "Error in GetMovies");
            return BadRequest("Error in GetMovies");
        }
    }

    [HttpGet("{movieId}")]
    [ProducesResponseType(200, Type = typeof(MovieGetDto))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> GetMovie(Guid movieId)
    {
        try
        {

            var movie = await _movieRepo.GetMovieAsync(movieId);

            return Ok(movie);
        }
        catch(Exception e)
        {
            _logger.LogError(e, "Error in GetMovie");
            return BadRequest("Error in GetMovie");
        }
    }

    /// <summary>
    /// Adds a movie for this user to the database. MovieId and UserId should be null.
    /// Liked = null adds the movie to the users watchlist.
    /// </summary>
    /// <param name="movie"></param>
    /// <returns></returns>
    [HttpPost]
    [ProducesResponseType(200, Type = typeof(MovieGetDto))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> AddMovie(MovieCUDtO movie)
    {
        try
        {
            var username = _userManager.GetUserName(User);
            if (username == null)
            {
                return BadRequest("User not found");
            }
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            movie.UserId = user.Id;

            var addedMovie = await _movieRepo.AddMovieAsync(movie);

            return Ok(addedMovie);
        }
        catch(Exception e)
        {
            _logger.LogError(e, "Error in AddMovie");
            return BadRequest("Error in AddMovie");
        }
    }

    [HttpDelete("{movieId}")]
    [ProducesResponseType(200, Type = typeof(MovieGetDto))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> DeleteMovie(Guid movieId)
    {
        try
        {

            var deletedMovie = await _movieRepo.DeleteMovieAsync(movieId);

            return Ok(deletedMovie);
        }
        catch(Exception e)
        {
            _logger.LogError(e, "Error in DeleteMovie");
            return BadRequest("Error in DeleteMovie");
        }
    }

    [HttpPut()]
    [ProducesResponseType(200, Type = typeof(MovieGetDto))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> UpdateMovie(MovieCUDtO movie)
    {
        try
        {
            
            var updatedMovie = await _movieRepo.UpdateMovieAsync(movie);

            return Ok(updatedMovie);
        }
        catch(Exception e)
        {
            _logger.LogError(e, "Error in UpdateMovie");
            return BadRequest("Error in UpdateMovie");
        }
    }
}