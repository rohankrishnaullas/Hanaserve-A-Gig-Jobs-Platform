using HanaServe.Core.Models;

namespace HanaServe.Core.Services;

public interface IMatchingService
{
    Task<List<Match>> FindMatchesForJobAsync(Job job);
    Task SaveMatchesAsync(List<Match> matches);
    Task<List<Match>> GetMatchesForProviderAsync(string providerId);
    Task<Match> AcceptMatchAsync(string matchId, string providerId);
    Task<Match> DeclineMatchAsync(string matchId, string providerId);
}
