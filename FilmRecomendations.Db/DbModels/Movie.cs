using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FilmRecomendations.Db.DbModels;

//we should only store the neccesary data related to the user, everything movie related can be fetched from TMDb
public class Movie
{
    public Guid MovieId { get; set; }

    //should match TMDb Movieid
    public int? TMDbId { get; set; } = null;

    //null => not rated, true => liked, false => disliked
    public bool? Liked { get; set; } = null;
    public List<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}
