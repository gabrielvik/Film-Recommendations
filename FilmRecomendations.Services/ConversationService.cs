using FilmRecomendations.Models.DTOs;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace FilmRecomendations.Services;

public class ConversationService : IConversationService
{
    private readonly IAiService _aiService;
    private readonly ITMDBService _tmdbService;
    private readonly ILogger<ConversationService> _logger;
    private readonly ConcurrentDictionary<string, ConversationStateDto> _conversations = new();

    public ConversationService(IAiService aiService, ITMDBService tmdbService, ILogger<ConversationService> logger)
    {
        _aiService = aiService;
        _tmdbService = tmdbService;
        _logger = logger;
    }

    public async Task<ConversationStateDto> StartConversationAsync(string initialPrompt)
    {
        var conversationId = Guid.NewGuid().ToString();
        var conversation = new ConversationStateDto
        {
            ConversationId = conversationId,
            PreviousPrompts = new List<string> { initialPrompt },
            CurrentCriteria = initialPrompt
        };

        // Get initial recommendations
        var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(initialPrompt);
        var recommendations = ParseAndConvertRecommendations(recommendationsJson);
        conversation.CurrentRecommendations = recommendations;

        _conversations[conversationId] = conversation;
        return conversation;
    }

    public async Task<ConversationStateDto> ContinueConversationAsync(string conversationId, string additionalPrompt)
    {
        if (!_conversations.TryGetValue(conversationId, out var conversation))
        {
            throw new KeyNotFoundException($"Conversation with ID {conversationId} not found");
        }

        // Update conversation state
        conversation.PreviousPrompts.Add(additionalPrompt);

        // Build a comprehensive prompt that includes previous context and feedback
        string fullPrompt = BuildPromptWithContext(conversation, additionalPrompt);
        
        // Get updated recommendations based on the full context
        var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(fullPrompt);
        var recommendations = ParseAndConvertRecommendations(recommendationsJson);
        
        // Filter out explicitly excluded movies
        recommendations = recommendations
            .Where(r => !conversation.ExcludedMovieIds.Contains(r.MovieId))
            .ToList();
            
        conversation.CurrentRecommendations = recommendations;
        conversation.CurrentCriteria = additionalPrompt;

        return conversation;
    }

    public async Task<ConversationStateDto> ExcludeMovieAsync(string conversationId, int movieId)
    {
        if (!_conversations.TryGetValue(conversationId, out var conversation))
        {
            throw new KeyNotFoundException($"Conversation with ID {conversationId} not found");
        }

        // Add the movie to excluded list and remove from recommendations
        conversation.ExcludedMovieIds.Add(movieId);
        conversation.CurrentRecommendations = conversation.CurrentRecommendations
            .Where(m => m.MovieId != movieId)
            .ToList();

        // If we need to get new recommendations to replace the excluded one
        if (conversation.CurrentRecommendations.Count < 3)
        {
            string refreshPrompt = BuildPromptWithContext(conversation, 
                "Suggest more movies like the ones I liked but different from the ones I excluded");
            
            var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(refreshPrompt);
            var newRecommendations = ParseAndConvertRecommendations(recommendationsJson)
                .Where(r => !conversation.ExcludedMovieIds.Contains(r.MovieId))
                .ToList();
            
            // Add new recommendations without duplicates
            foreach (var newRec in newRecommendations)
            {
                if (!conversation.CurrentRecommendations.Any(r => r.MovieId == newRec.MovieId))
                {
                    conversation.CurrentRecommendations.Add(newRec);
                }
            }
        }

        return conversation;
    }

    public async Task<ConversationStateDto> LikeMovieAsync(string conversationId, int movieId)
    {
        if (!_conversations.TryGetValue(conversationId, out var conversation))
        {
            throw new KeyNotFoundException($"Conversation with ID {conversationId} not found");
        }

        // Add the movie to liked list
        if (!conversation.LikedMovieIds.Contains(movieId))
        {
            conversation.LikedMovieIds.Add(movieId);
        }

        // If needed, get more recommendations similar to the liked movie
        var likedMovie = conversation.CurrentRecommendations.FirstOrDefault(m => m.MovieId == movieId);
        if (likedMovie != null)
        {
            string likePrompt = $"Give me more movies similar to {likedMovie.MovieName} ({likedMovie.ReleaseYear})";
            
            var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(likePrompt);
            var similarRecommendations = ParseAndConvertRecommendations(recommendationsJson)
                .Where(r => !conversation.ExcludedMovieIds.Contains(r.MovieId))
                .ToList();
            
            // Add new similar recommendations without duplicates
            foreach (var newRec in similarRecommendations)
            {
                if (!conversation.CurrentRecommendations.Any(r => r.MovieId == newRec.MovieId))
                {
                    conversation.CurrentRecommendations.Add(newRec);
                }
            }
        }

        return conversation;
    }

    public ConversationStateDto GetConversation(string conversationId)
    {
        if (!_conversations.TryGetValue(conversationId, out var conversation))
        {
            throw new KeyNotFoundException($"Conversation with ID {conversationId} not found");
        }
        
        return conversation;
    }

    private string BuildPromptWithContext(ConversationStateDto conversation, string additionalPrompt)
    {
        // Build a comprehensive prompt that includes previous context and feedback
        var promptBuilder = new System.Text.StringBuilder();
        
        // Add original request
        promptBuilder.AppendLine("Original request: " + conversation.PreviousPrompts.First());
        
        // Add info about excluded movies
        if (conversation.ExcludedMovieIds.Count > 0)
        {
            promptBuilder.AppendLine("I don't want movies like: ");
            var excludedMovies = conversation.CurrentRecommendations
                .Where(r => conversation.ExcludedMovieIds.Contains(r.MovieId))
                .Select(r => $"{r.MovieName} ({r.ReleaseYear})");
            
            promptBuilder.AppendLine(string.Join(", ", excludedMovies));
        }
        
        // Add info about liked movies
        if (conversation.LikedMovieIds.Count > 0)
        {
            promptBuilder.AppendLine("I like movies like: ");
            var likedMovies = conversation.CurrentRecommendations
                .Where(r => conversation.LikedMovieIds.Contains(r.MovieId))
                .Select(r => $"{r.MovieName} ({r.ReleaseYear})");
            
            promptBuilder.AppendLine(string.Join(", ", likedMovies));
        }
        
        // Add the new request
        promptBuilder.AppendLine("New request: " + additionalPrompt);
        
        return promptBuilder.ToString();
    }

    private List<MovieRecommendationDto> ParseAndConvertRecommendations(string recommendationsJson)
    {
        try
        {
            // Parse the recommendationsJson to extract MovieRecommendationDto objects
            // This depends on how your AiService formats its responses
            var movieRecommendations = System.Text.Json.JsonSerializer.Deserialize<List<MovieDetail>>(recommendationsJson);
            
            if (movieRecommendations == null || !movieRecommendations.Any())
            {
                return new List<MovieRecommendationDto>();
            }
            
            return movieRecommendations.Select(r => new MovieRecommendationDto
            {
                MovieId = r.movie_id,
                MovieName = r.movie_name,
                ReleaseYear = r.release_year,
                PosterPath = r.poster_path
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing movie recommendations JSON");
            return new List<MovieRecommendationDto>();
        }
    }

    // This class should match the structure of your AI service response JSON
    private class MovieDetail
    {
        public int movie_id { get; set; }
        public string movie_name { get; set; }
        public int release_year { get; set; }
        public string poster_path { get; set; }
    }
}