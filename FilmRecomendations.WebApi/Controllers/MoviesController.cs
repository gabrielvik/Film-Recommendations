using System.Security.Claims;
using FilmRecomendations.Db.DbModels;
using FilmRecomendations.Db.Repos;
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

    public MoviesController(IMovieRepo movieRepo, UserManager<ApplicationUser> userManager)
    {
        _movieRepo = movieRepo;
        _userManager = userManager;
    }
    [HttpGet("watchlist")]
    [ProducesResponseType(200, Type = typeof(IEnumerable<MovieDbM>))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> GetWatchList(string? filter = null, int pageNumber = 0, int pageSize = 10)
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
}