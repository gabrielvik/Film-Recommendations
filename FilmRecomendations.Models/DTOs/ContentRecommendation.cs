namespace FilmRecomendations.Models.DTOs;

public class ContentRecommendation
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string PosterPath { get; set; }
    public int Year { get; set; }
    public ContentType Type { get; set; }
    
    // Additional properties for TV shows
    public int? NumberOfSeasons { get; set; }
    public string? FirstAirDate { get; set; }
}

public enum ContentType
{
    Movie = 0,
    TVSeries = 1
}