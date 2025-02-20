using Film_Recommendations.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace Film_Recommendations.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        public async Task<IActionResult> GetRecommendations(string prompt)
        {
            try
            {
                var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(prompt);
                // You can return the raw JSON or deserialize it into a model, then return a view.
                return Content(recommendationsJson, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching movie recommendations.");
                return StatusCode(500, "An error occurred while fetching recommendations.");
            }
        }
    }
}
