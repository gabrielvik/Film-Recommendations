using OpenAI.Chat;

namespace FilmRecomendations.Services
{
    public class AiService : IAiService
    {
        private readonly ChatClient _chatClient;

        public AiService()
        {
            _chatClient = InitializeChatClient();
        }

        private ChatClient InitializeChatClient()
        {
            string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new InvalidOperationException("API key for GPT is not set in the environment variables.");
            }

            return new ChatClient("gpt-4o-mini", apiKey);
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

            return responseContent;
        }
    }
}
