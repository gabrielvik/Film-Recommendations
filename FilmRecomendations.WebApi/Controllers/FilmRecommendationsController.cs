using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;
namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class FilmRecomendationsController : ControllerBase
{
    private readonly ILogger<FilmRecomendationsController> _logger;
    private readonly IAiService _aiService;
    public FilmRecomendationsController(ILogger<FilmRecomendationsController> logger, IAiService aiService)
    {
        _logger = logger;
        _aiService = aiService;
    }

    [HttpGet("GetFilmRecommendation")]
    public async Task<IActionResult> GetFilmRecommendation(string prompt)
    {
        try
        {
            var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(prompt);
            return Content(recommendationsJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching movie recommendations.");
            return StatusCode(500, "An error occurred while fetching recommendations.");
        }
    }
}
