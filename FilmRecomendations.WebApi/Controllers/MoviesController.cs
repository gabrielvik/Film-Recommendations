using FilmRecomendations.Db.DbModels;
using FilmRecomendations.Db.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FilmRecomendations.WebApi.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class MoviesController(MovieRepo _movieRepo, ILogger _logger, UserManager<ApplicationUser> _userManager) : ControllerBase
{
    [HttpGet()]
    [ProducesResponseType(200, Type = typeof(IEnumerable<MovieDbM>))]
    [ProducesResponseType(400, Type = typeof(string))]
    public async Task<IActionResult> GetWatchList(string? filter = null, int pageNumber = 0, int pageSize = 10)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return BadRequest("User not found");
        }

        var watchList = await _movieRepo.GetWatchlistAsync(user.Id, filter, pageNumber, pageSize);
        
        return Ok(watchList);
    }
}