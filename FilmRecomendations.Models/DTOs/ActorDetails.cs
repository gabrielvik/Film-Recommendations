namespace FilmRecomendations.Models.DTOs;

public class ActorDetails
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? ProfilePath { get; set; }
    public string? Biography { get; set; }
    public string? Birthday { get; set; }
    public string? Deathday { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? KnownForDepartment { get; set; }
    public double Popularity { get; set; }
    public List<MovieCredit>? KnownFor { get; set; }
}

public class MovieCredit
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Character { get; set; }
    public string? PosterPath { get; set; }
    public string? ReleaseDate { get; set; }
}