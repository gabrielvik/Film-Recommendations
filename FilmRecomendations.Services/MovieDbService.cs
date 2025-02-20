using FilmRecomendations.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FilmRecomendations.Services;

class MovieDbService : IMovieDbService
{
    public Task<List<Movie>> GetMovieDetails(List<int> movieIds)
    {
        throw new NotImplementedException();
    }

    public Task<List<int>> GetMovieIdsAsync(List<string> movieNames)
    {
        throw new NotImplementedException();
    }
}
