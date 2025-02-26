using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;
using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class ConversationController : ControllerBase
{
    private readonly ILogger<ConversationController> _logger;
    private readonly IConversationService _conversationService;
    
    public ConversationController(
        ILogger<ConversationController> logger, 
        IConversationService conversationService)
    {
        _logger = logger;
        _conversationService = conversationService;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartConversation([FromBody] PromptRequest request)
    {
        try
        {
            var conversationState = await _conversationService.StartConversationAsync(request.Prompt);
            return Ok(conversationState);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting conversation");
            return StatusCode(500, "An error occurred while starting the conversation");
        }
    }

    [HttpPost("continue")]
    public async Task<IActionResult> ContinueConversation([FromBody] ContinueRequest request)
    {
        try
        {
            var conversationState = await _conversationService.ContinueConversationAsync(
                request.ConversationId, request.Prompt);
            return Ok(conversationState);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Conversation with ID {request.ConversationId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error continuing conversation");
            return StatusCode(500, "An error occurred while continuing the conversation");
        }
    }

    [HttpPost("exclude")]
    public async Task<IActionResult> ExcludeMovie([FromBody] MovieActionRequest request)
    {
        try
        {
            var conversationState = await _conversationService.ExcludeMovieAsync(
                request.ConversationId, request.MovieId);
            return Ok(conversationState);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Conversation with ID {request.ConversationId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error excluding movie");
            return StatusCode(500, "An error occurred while excluding the movie");
        }
    }

    [HttpPost("like")]
    public async Task<IActionResult> LikeMovie([FromBody] MovieActionRequest request)
    {
        try
        {
            var conversationState = await _conversationService.LikeMovieAsync(
                request.ConversationId, request.MovieId);
            return Ok(conversationState);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Conversation with ID {request.ConversationId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error liking movie");
            return StatusCode(500, "An error occurred while liking the movie");
        }
    }

    [HttpGet("{conversationId}")]
    public IActionResult GetConversation(string conversationId)
    {
        try
        {
            var conversationState = _conversationService.GetConversation(conversationId);
            return Ok(conversationState);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Conversation with ID {conversationId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversation");
            return StatusCode(500, "An error occurred while retrieving the conversation");
        }
    }
}

// Request DTOs for the controller
public class PromptRequest
{
    public string Prompt { get; set; }
}

public class ContinueRequest
{
    public string ConversationId { get; set; }
    public string Prompt { get; set; }
}

public class MovieActionRequest
{
    public string ConversationId { get; set; }
    public int MovieId { get; set; }
}