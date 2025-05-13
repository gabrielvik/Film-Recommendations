namespace FilmRecomendations.Models.DTOs.Series;

public class Series
{
    public bool adult { get; set; }
    public string backdrop_path { get; set; }
    public List<int> episode_run_time { get; set; }
    public string first_air_date { get; set; }
    public List<Genre> genres { get; set; }
    public string homepage { get; set; }
    public int id { get; set; }
    public bool in_production { get; set; }
    public List<string> languages { get; set; }
    public string last_air_date { get; set; }
    public string name { get; set; }
    public List<Network> networks { get; set; }
    public int number_of_episodes { get; set; }
    public int number_of_seasons { get; set; }
    public string original_language { get; set; }
    public string original_name { get; set; }
    public string overview { get; set; }
    public double popularity { get; set; }
    public string poster_path { get; set; }
    public List<ProductionCompany> production_companies { get; set; }
    public List<ProductionCountry> production_countries { get; set; }
    public List<Season> seasons { get; set; }
    public List<SpokenLanguage> spoken_languages { get; set; }
    public string status { get; set; }
    public string tagline { get; set; }
    public string type { get; set; }
    public double vote_average { get; set; }
    public int vote_count { get; set; }
    
    // Extensions for additional data
    public List<SeriesTrailer> Trailers { get; set; }
    public StreamingProviderResponse StreamingProviders { get; set; }
    public List<Creator> Creators { get; set; }
    public List<Actor> Actors { get; set; }
}

public class Genre
{
    public int id { get; set; }
    public string name { get; set; }
}

public class Network
{
    public int id { get; set; }
    public string logo_path { get; set; }
    public string name { get; set; }
    public string origin_country { get; set; }
}

public class Season
{
    public string air_date { get; set; }
    public int episode_count { get; set; }
    public int id { get; set; }
    public string name { get; set; }
    public string overview { get; set; }
    public string poster_path { get; set; }
    public int season_number { get; set; }
    public double vote_average { get; set; }
}
