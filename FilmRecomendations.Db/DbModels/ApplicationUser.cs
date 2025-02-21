using Microsoft.AspNetCore.Identity;
using Database.Seeder;

namespace FilmRecomendations.Db.DbModels;

public class ApplicationUser: IdentityUser
{
    public string? ProfilePicture { get; set; } = ProfilePictureSeeder.RandomizeProfilePicture();

    //if a movie is here, the user has watched it. He may or may not have rated it
    public List<Movie> Movies { get; set; } = new List<Movie>();
}
