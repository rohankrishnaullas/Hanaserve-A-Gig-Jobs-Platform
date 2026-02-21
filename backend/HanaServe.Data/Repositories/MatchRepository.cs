using HanaServe.Core.Models;
using HanaServe.Core.Repositories;

namespace HanaServe.Data.Repositories;

public class MatchRepository : CosmosRepository<Match>, IMatchRepository
{
    public MatchRepository(CosmosDbContext context) : base(context.Matches)
    {
    }

    public async Task<Match?> GetByIdAsync(string id)
    {
        var query = "SELECT * FROM c WHERE c.id = @id";
        var parameters = new Dictionary<string, object> { { "@id", id } };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }

    public new async Task<Match> CreateAsync(Match entity, string partitionKey)
    {
        return await base.CreateAsync(entity, partitionKey);
    }

    public new async Task<Match> UpdateAsync(Match entity, string id, string partitionKey)
    {
        return await base.UpdateAsync(entity, id, partitionKey);
    }

    public async Task<List<Match>> GetByJobIdAsync(string jobId)
    {
        var query = "SELECT * FROM c WHERE c.jobId = @jobId ORDER BY c.matchScore DESC";
        var parameters = new Dictionary<string, object> { { "@jobId", jobId } };
        return await QueryWithPartitionAsync(query, jobId, parameters);
    }

    public async Task<List<Match>> GetByProviderIdAsync(string providerId)
    {
        var query = "SELECT * FROM c WHERE c.providerId = @providerId ORDER BY c.createdAt DESC";
        var parameters = new Dictionary<string, object> { { "@providerId", providerId } };
        return await QueryAsync(query, parameters);
    }

    public async Task<List<Match>> GetPendingMatchesForProviderAsync(string providerId)
    {
        var query = @"
            SELECT * FROM c
            WHERE c.providerId = @providerId
            AND c.status = 'Pending'
            AND c.expiresAt > @now
            ORDER BY c.matchScore DESC";
        var parameters = new Dictionary<string, object>
        {
            { "@providerId", providerId },
            { "@now", DateTime.UtcNow }
        };
        return await QueryAsync(query, parameters);
    }

    public async Task<Match?> GetAcceptedMatchForJobAsync(string jobId)
    {
        var query = "SELECT * FROM c WHERE c.jobId = @jobId AND c.status = 'Accepted'";
        var parameters = new Dictionary<string, object> { { "@jobId", jobId } };
        var results = await QueryWithPartitionAsync(query, jobId, parameters);
        return results.FirstOrDefault();
    }

    public async Task CreateManyAsync(List<Match> matches)
    {
        foreach (var match in matches)
        {
            await CreateAsync(match, match.JobId);
        }
    }

    public async Task UpdateManyAsync(List<Match> matches)
    {
        foreach (var match in matches)
        {
            await UpdateAsync(match, match.Id, match.JobId);
        }
    }
}
