using System.Collections.Generic;

namespace FilmRecomendations.Models.DTOs;

public class SeasonDetails
{
    public string AirDate { get; set; }
    public List<EpisodeDetail> Episodes { get; set; }
    public string Name { get; set; }
    public string Overview { get; set; }
    public int Id { get; set; }
    public string PosterPath { get; set; }
    public int SeasonNumber { get; set; }
    public double VoteAverage { get; set; }
}

public class EpisodeDetail
{
    public string AirDate { get; set; }
    public int EpisodeNumber { get; set; }
    public int Id { get; set; }
    public string Name { get; set; }
    public string Overview { get; set; }
    public string ProductionCode { get; set; }
    public int RuntimeMinutes { get; set; }
    public int SeasonNumber { get; set; }
    public int ShowId { get; set; }
    public string StillPath { get; set; }
    public double VoteAverage { get; set; }
    public int VoteCount { get; set; }
    public List<Crew> Crew { get; set; }
    public List<GuestStar> GuestStars { get; set; }
}

public class Crew
{
    public string Job { get; set; }
    public string Department { get; set; }
    public string CreditId { get; set; }
    public bool Adult { get; set; }
    public int Gender { get; set; }
    public int Id { get; set; }
    public string KnownForDepartment { get; set; }
    public string Name { get; set; }
    public string OriginalName { get; set; }
    public double Popularity { get; set; }
    public string ProfilePath { get; set; }
}

public class GuestStar
{
    public string Character { get; set; }
    public string CreditId { get; set; }
    public int Order { get; set; }
    public bool Adult { get; set; }
    public int Gender { get; set; }
    public int Id { get; set; }
    public string KnownForDepartment { get; set; }
    public string Name { get; set; }
    public string OriginalName { get; set; }
    public double Popularity { get; set; }
    public string ProfilePath { get; set; }
}