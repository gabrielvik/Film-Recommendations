using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;

namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class ContentRecommendationsController : ControllerBase
{
    private readonly ILogger<ContentRecommendationsController> _logger;
    private readonly IAiService _aiService;
    
    public ContentRecommendationsController(
        ILogger<ContentRecommendationsController> logger, 
        IAiService aiService)
    {
        _logger = logger;
        _aiService = aiService;
    }

    [HttpGet("GetRecommendations")]
    public async Task<IActionResult> GetRecommendations(string prompt, string contentType = "all")
    {
        try
        {
            if (string.IsNullOrWhiteSpace(prompt))
            {
                return BadRequest("Prompt is required");
            }
            
            string recommendationsJson;
            
            // Based on the contentType parameter, call the appropriate method
            switch (contentType.ToLower())
            {
                case "movies":
                case "movie":
                    recommendationsJson = await _aiService.GetMovieRecommendationsAsync(prompt);
                    break;
                
                case "tv":
                case "series":
                case "tvseries":
                    recommendationsJson = await _aiService.GetTVSeriesRecommendationsAsync(prompt);
                    break;
                
                case "all":
                case "mixed":
                default:
                    recommendationsJson = await _aiService.GetMixedContentRecommendationsAsync(prompt);
                    break;
            }
            
            return Content(recommendationsJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching content recommendations.");
            return StatusCode(500, "An error occurred while fetching recommendations.");
        }
    }
}