using Microsoft.AspNetCore.Identity;
using Database.Seeder;

namespace FilmRecomendations.Db.DbModels;

public class AplicationUser: IdentityUser
{
    public string? ProfilePicture { get; set; } = ProfilePictureSeeder.RandomizeProfilePicture();
}
