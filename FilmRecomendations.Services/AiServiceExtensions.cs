using OpenAI.Chat;
using System.Text.Json;

namespace FilmRecomendations.Services
{
    public partial class AiService : IAiService
    {
        public async Task<string> GetTVSeriesRecommendationsAsync(string prompt)
        {
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(
                    "You are a TV series recommendation assistant. When given a description, " +
                    "you must return raw JSON only of any number of TV series that are similar to the input description and nothing else. The output must be a valid JSON array " +
                    "of objects in the following exact format (do not include any markdown, explanation, or extra text):\n\n" +
                    "[\n" +
                    "  {\n" +
                    "    \"series_name\": \"Name of the TV series\",\n" +
                    "    \"first_air_year\": 2000\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"series_name\": \"Name of the TV series 2\",\n" +
                    "    \"first_air_year\": 2001\n" +
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

            return await GetTVSeriesIdAndPoster(responseContent);
        }

        public async Task<string> GetMixedContentRecommendationsAsync(string prompt, bool includeMovies = true, bool includeTVSeries = true)
        {
            if (!includeMovies && !includeTVSeries)
            {
                throw new ArgumentException("At least one of includeMovies or includeTVSeries must be true");
            }

            var contentTypeString = includeMovies && includeTVSeries
                ? "movies and TV series"
                : includeMovies
                    ? "movies"
                    : "TV series";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(
                    $"You are a {contentTypeString} recommendation assistant. When given a description, " +
                    $"you must return raw JSON only of any number of {contentTypeString} that are similar to the input description and nothing else. " +
                    "The output must be a valid JSON array of objects in the following exact format (do not include any markdown, explanation, or extra text):\n\n" +
                    "[\n" +
                    "  {\n" +
                    "    \"title\": \"Name of the content\",\n" +
                    "    \"year\": 2000,\n" +
                    "    \"type\": \"movie\" or \"series\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"title\": \"Name of the content 2\",\n" +
                    "    \"year\": 2001,\n" +
                    "    \"type\": \"movie\" or \"series\"\n" +
                    "  }\n" +
                    "]\n\n" +
                    $"Note that you should only include movies: {includeMovies}, series: {includeTVSeries}. " +
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

            return await GetMixedContentIdAndPoster(responseContent);
        }

        private async Task<string> GetTVSeriesIdAndPoster(string gptResponse)
        {
            // Parse the GPT response to extract the list of TV series
            var seriesRecommendations = JsonSerializer.Deserialize<List<TVSeriesRecommendation>>(gptResponse);
            if (seriesRecommendations == null || seriesRecommendations.Count == 0)
            {
                return "[]";
            }

            var resultList = new List<TVSeriesDetail>();

            foreach (var rec in seriesRecommendations)
            {
                // Fetch the TV series ID from TMDB
                var seriesIdResponse = await _tmdbService.GetTVSeriesIdAsync(rec.series_name, rec.first_air_year);
                if (seriesIdResponse.Id <= 0)
                {
                    continue;
                }

                // Add the TV series details to the result list
                resultList.Add(new TVSeriesDetail
                {
                    series_id = seriesIdResponse.Id,
                    series_name = rec.series_name,
                    first_air_year = rec.first_air_year,
                    poster_path = seriesIdResponse.PosterPath
                });
            }

            // Return aggregated results as a JSON array
            return JsonSerializer.Serialize(resultList);
        }

        private async Task<string> GetMixedContentIdAndPoster(string gptResponse)
        {
            // Parse the GPT response to extract the list of mixed content
            var contentRecommendations = JsonSerializer.Deserialize<List<MixedContentRecommendation>>(gptResponse);
            if (contentRecommendations == null || contentRecommendations.Count == 0)
            {
                return "[]";
            }

            var resultList = new List<MixedContentDetail>();

            foreach (var rec in contentRecommendations)
            {
                if (rec.type.ToLower() == "movie")
                {
                    // Fetch the movie ID from TMDB
                    var movieIdResponse = await _tmdbService.GetMovieIdAsync(rec.title, rec.year);
                    if (movieIdResponse.Id <= 0)
                    {
                        continue;
                    }

                    // Add the movie details to the result list
                    resultList.Add(new MixedContentDetail
                    {
                        id = movieIdResponse.Id,
                        title = rec.title,
                        year = rec.year,
                        type = "movie",
                        poster_path = movieIdResponse.poster_path
                    });
                }
                else if (rec.type.ToLower() == "series")
                {
                    // Fetch the TV series ID from TMDB
                    var seriesIdResponse = await _tmdbService.GetTVSeriesIdAsync(rec.title, rec.year);
                    if (seriesIdResponse.Id <= 0)
                    {
                        continue;
                    }

                    // Add the TV series details to the result list
                    resultList.Add(new MixedContentDetail
                    {
                        id = seriesIdResponse.Id,
                        title = rec.title,
                        year = rec.year,
                        type = "series",
                        poster_path = seriesIdResponse.PosterPath
                    });
                }
            }

            // Return aggregated results as a JSON array
            return JsonSerializer.Serialize(resultList);
        }

        private class TVSeriesRecommendation
        {
            public string series_name { get; set; }
            public int first_air_year { get; set; }
        }

        private class TVSeriesDetail
        {
            public int series_id { get; set; }
            public string series_name { get; set; }
            public int first_air_year { get; set; }
            public string poster_path { get; set; }
        }

        private class MixedContentRecommendation
        {
            public string title { get; set; }
            public int year { get; set; }
            public string type { get; set; } // "movie" or "series"
        }

        private class MixedContentDetail
        {
            public int id { get; set; }
            public string title { get; set; }
            public int year { get; set; }
            public string type { get; set; } // "movie" or "series"
            public string poster_path { get; set; }
        }
    }
}