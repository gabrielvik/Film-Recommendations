using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Services;

public interface IConversationService
{
    Task<ConversationStateDto> StartConversationAsync(string initialPrompt);
    Task<ConversationStateDto> ContinueConversationAsync(string conversationId, string additionalPrompt);
    Task<ConversationStateDto> ExcludeMovieAsync(string conversationId, int movieId);
    Task<ConversationStateDto> LikeMovieAsync(string conversationId, int movieId);
    ConversationStateDto GetConversation(string conversationId);
}