using System.Collections.Generic;

namespace FilmRecomendations.Models.DTOs;

public class TVSeriesDetails
{
    public bool Adult { get; set; }
    public string BackdropPath { get; set; }
    public List<Creator> CreatedBy { get; set; }
    public List<int> EpisodeRunTime { get; set; }
    public string FirstAirDate { get; set; }
    public List<Genre> Genres { get; set; }
    public string Homepage { get; set; }
    public int Id { get; set; }
    public bool InProduction { get; set; }
    public List<string> Languages { get; set; }
    public string LastAirDate { get; set; }
    public Episode LastEpisodeToAir { get; set; }
    public string Name { get; set; }
    public Episode NextEpisodeToAir { get; set; }
    public List<Network> Networks { get; set; }
    public int NumberOfEpisodes { get; set; }
    public int NumberOfSeasons { get; set; }
    public List<string> OriginCountry { get; set; }
    public string OriginalLanguage { get; set; }
    public string OriginalName { get; set; }
    public string Overview { get; set; }
    public double Popularity { get; set; }
    public string PosterPath { get; set; }
    public List<ProductionCompany> ProductionCompanies { get; set; }
    public List<ProductionCountry> ProductionCountries { get; set; }
    public List<Season> Seasons { get; set; }
    public List<SpokenLanguage> SpokenLanguages { get; set; }
    public string Status { get; set; }
    public string Tagline { get; set; }
    public string Type { get; set; }
    public double VoteAverage { get; set; }
    public int VoteCount { get; set; }
}

public class Creator
{
    public int Id { get; set; }
    public string CreditId { get; set; }
    public string Name { get; set; }
    public int Gender { get; set; }
    public string ProfilePath { get; set; }
}

public class Episode
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Overview { get; set; }
    public double VoteAverage { get; set; }
    public int VoteCount { get; set; }
    public string AirDate { get; set; }
    public int EpisodeNumber { get; set; }
    public string ProductionCode { get; set; }
    public int RuntimeMinutes { get; set; }
    public int SeasonNumber { get; set; }
    public int ShowId { get; set; }
    public string StillPath { get; set; }
}

public class Network
{
    public int Id { get; set; }
    public string LogoPath { get; set; }
    public string Name { get; set; }
    public string OriginCountry { get; set; }
}

public class Season
{
    public string AirDate { get; set; }
    public int EpisodeCount { get; set; }
    public int Id { get; set; }
    public string Name { get; set; }
    public string Overview { get; set; }
    public string PosterPath { get; set; }
    public int SeasonNumber { get; set; }
    public double VoteAverage { get; set; }
}