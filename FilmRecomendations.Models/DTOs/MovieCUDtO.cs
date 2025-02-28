namespace FilmRecomendations.Models.DTOs;
public class MovieCUDtO
{
    public Guid MovieId { get; set; }
    public string Title { get; set; } = "";
    public int? TMDbId { get; set; } = null;
    public bool? Liked { get; set; } = null;
    public required string UserId { get; set; }
}