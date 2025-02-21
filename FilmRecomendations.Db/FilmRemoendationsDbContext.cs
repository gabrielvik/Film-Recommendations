using FilmRecomendations.Db.DbModels;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace FilmRecomendations.Db;

public class FilmDbContext : IdentityDbContext<ApplicationUser>
{
    public FilmDbContext(DbContextOptions<FilmDbContext> options) : base(options)
    {
    }

    public DbSet<Movie> Movies { get; set; }
}
