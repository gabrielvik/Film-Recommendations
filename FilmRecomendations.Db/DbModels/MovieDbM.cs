using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FilmRecomendations.Db.DbModels;

//we should only store the neccesary data related to the user, everything movie related can be fetched from TMDb
public class MovieDbM
{
    public Guid MovieId { get; set; }
    public string Title { get; set; } = "";

    //should match TMDb Movieid
    public int? TMDbId { get; set; } = null;

    //null => not rated(on watchlist), true => liked, false => disliked
    public bool? Liked { get; set; } = null;
    //A MovieDbM instance has only one associated user.
    public Guid? UserId { get; set; }
    public ApplicationUser? User { get; set; } 
}
