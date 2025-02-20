using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FilmRecomendations.Db.DbModels;

public class Movie
{
    public int MovieId { get; set; }
    public required string Title { get; set; }
    public int? ReleaseYear { get; set; }
    public int DirectorId { get; set; }
    public List<Genere> Generes { get; set; } = new List<Genere>();
    public Director Director { get; set; } = new Director();
    public List<Actor> Actors { get; set; } = new List<Actor>();
}
