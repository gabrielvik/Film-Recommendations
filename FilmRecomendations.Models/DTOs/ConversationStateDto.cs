namespace FilmRecomendations.Models.DTOs;

public class ConversationStateDto
{
    public string? ConversationId { get; set; }
    public List<string> PreviousPrompts { get; set; } = new List<string>();
    public List<int> ExcludedMovieIds { get; set; } = new List<int>();
    public List<int> LikedMovieIds { get; set; } = new List<int>();
    public string? CurrentCriteria { get; set; }
    public List<MovieRecommendationDto> CurrentRecommendations { get; set; } = new List<MovieRecommendationDto>();
}

public class MovieRecommendationDto
{
    public int MovieId { get; set; }
    public string MovieName { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public string? PosterPath { get; set; }
}