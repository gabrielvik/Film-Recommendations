using OpenAI.Chat;
using System.ClientModel;
using System.Net.Http;
using System.Text.Json;
using System.Web;

namespace FilmRecomendations.Services
{
    public class AiService : IAiService
    {
        private readonly ChatClient _chatClient;
        private ITMDBService _tmdbService;

        public AiService(ITMDBService tmdbService)
        {
            _chatClient = InitializeChatClient();
            _tmdbService = tmdbService;

        }

        private ChatClient InitializeChatClient()
        {
            // string apiKey = Environment.GetEnvironmentVariable("GROK_API_KEY");

            // Set up the API key and endpoint for GROK.
            var apiKey = Environment.GetEnvironmentVariable("GROK_API_KEY");
            var credential = new ApiKeyCredential(apiKey);
            var baseURL = new OpenAI.OpenAIClientOptions
            {
                Endpoint = new Uri("https://api.x.ai/v1")
            };

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new InvalidOperationException("API key for GROK is not set in the environment variables.");
            }

            // Initialize the chat client with GROK.
            return new ChatClient("grok-2-latest", credential, baseURL);

            // Initialize the chat client with GPT.
            // return new ChatClient("gpt-4o-mini", apiKey);
        }

        public async Task<string> GetMovieRecommendationsAsync(string prompt)
        {
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(
                    "You are a movie recommendation assistant. When given a movie description, " +
                    "you must return raw JSON only any number of movies that are similar to the input description and nothing else. The output must be a valid JSON array " +
                    "of objects in the following exact format (do not include any markdown, explanation, or extra text):\n\n" +
                    "[\n" +
                    "  {\n" +
                    "    \"movie_name\": \"Name of the movie\",\n" +
                    "    \"release_year\": 2000\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"movie_name\": \"Name of the movie 2\",\n" +
                    "    \"release_year\": 2001\n" +
                    "  }\n" +
                    "]\n\n" +
                    "Make sure that your entire output is only this JSON without any additional commentary."
                ),
                new UserChatMessage(prompt)
            };

            var completionOptions = new ChatCompletionOptions
            {
                Temperature = 0.7f,
            };

            ChatCompletion chatCompletion = await _chatClient.CompleteChatAsync(messages, completionOptions);
            string responseContent = chatCompletion.Content[0].Text;


            return await GetMovieIdAndPoster(responseContent);
        }

        public async Task<string> GetMovieIdAndPoster(string gptResponse)
        {
             // Parse the GPT response to extract the list of movies.
            var movieRecommendations = JsonSerializer.Deserialize<List<MovieRecommendation>>(gptResponse);
            if (movieRecommendations == null || movieRecommendations.Count == 0)
            {
                return "[]";
            }

            var resultList = new List<MovieDetail>();

            foreach (var rec in movieRecommendations)
            {
                
                // Fetch the movie ID from TMDB.
                var movieIdResponse = await _tmdbService.GetMovieIdAsync(rec.movie_name, rec.release_year);
                if (movieIdResponse.Id <= 0)
                {
                    continue;
                }

                // Add the movie details to the result list.
                resultList.Add(new MovieDetail
                {
                    movie_id = movieIdResponse.Id,
                    movie_name = rec.movie_name,
                    release_year = rec.release_year,
                    poster_path = movieIdResponse.poster_path
                });
        
            }

            // Return aggregated results as a JSON array.
            return JsonSerializer.Serialize(resultList);

        }

        private class MovieRecommendation
        {
            public string movie_name { get; set; }
            public int release_year { get; set; }
        }

        private class MovieDetail
        {
            public int movie_id { get; set; }
            public string movie_name { get; set; }
            public int release_year { get; set; }
            public string poster_path { get; set; }
        }

    }
}
