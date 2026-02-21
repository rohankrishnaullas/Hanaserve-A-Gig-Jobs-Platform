using HanaServe.Core.Models;

namespace HanaServe.Core.Repositories;

public interface IMatchRepository
{
    Task<Match?> GetByIdAsync(string id);
    Task<List<Match>> GetByJobIdAsync(string jobId);
    Task<List<Match>> GetByProviderIdAsync(string providerId);
    Task<List<Match>> GetPendingMatchesForProviderAsync(string providerId);
    Task<Match?> GetAcceptedMatchForJobAsync(string jobId);
    Task<Match> CreateAsync(Match entity, string partitionKey);
    Task<Match> UpdateAsync(Match entity, string id, string partitionKey);
    Task CreateManyAsync(List<Match> matches);
    Task UpdateManyAsync(List<Match> matches);
}
