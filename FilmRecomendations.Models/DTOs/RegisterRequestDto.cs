namespace FilmRecomendations.Models.DTOs;

public class RegisterRequestDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string UserName { get; set; }
}
