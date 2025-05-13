using FilmRecomendations.Db.DbModels;
using FilmRecomendations.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserProfileController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("profile-picture")]
    public async Task<IActionResult> GetProfilePicture()
    {
        var user = await GetCurrentUser();
        if (user == null)
        {
            return Unauthorized();
        }

        if (string.IsNullOrEmpty(user.ProfilePicture))
        {
            return NotFound("No profile picture found");
        }

        return Ok(new { ProfilePicture = user.ProfilePicture });
    }

     // Update/add profile picture
    [HttpPost("profile-picture")]
    public async Task<IActionResult> AddOrUpdateProfilePicture([FromBody] ProfilePictureDto profilePictureDto)
    {
        if (profilePictureDto == null || string.IsNullOrEmpty(profilePictureDto.ImageData))
        {
            return BadRequest("Invalid profile picture data");
        }

        var user = await GetCurrentUser();
        if (user == null)
        {
            return Unauthorized();
        }

        user.ProfilePicture = profilePictureDto.ImageData;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return StatusCode(500, "Error updating profile picture");
        }
        return Ok(new { Message = "Profile picture updated successfully" });
    }

    // Delete profile picture
    [HttpDelete("profile-picture")]
    public async Task<IActionResult> DeleteProfilePicture()
    {
        var user = await GetCurrentUser();
        if (user == null)
        {
            return Unauthorized();
        }

        user.ProfilePicture = null;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
        }

        return Ok(new { Message = "Profile picture deleted successfully" });
    }

    // Helper method to get current user
    private async Task<ApplicationUser> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _userManager.FindByIdAsync(userId);
    }
}