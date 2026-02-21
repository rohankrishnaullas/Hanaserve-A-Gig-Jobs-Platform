using HanaServe.Core.Models;
using HanaServe.Core.Repositories;

namespace HanaServe.Data.Repositories;

public class ProviderRepository : CosmosRepository<Provider>, IProviderRepository
{
    public ProviderRepository(CosmosDbContext context) : base(context.Providers)
    {
    }

    public async Task<Provider?> GetByIdAsync(string id)
    {
        var query = "SELECT * FROM c WHERE c.id = @id";
        var parameters = new Dictionary<string, object> { { "@id", id } };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }

    public async Task<Provider?> GetByUserIdAsync(string userId)
    {
        var query = "SELECT * FROM c WHERE c.userId = @userId";
        var parameters = new Dictionary<string, object> { { "@userId", userId } };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }

    public new async Task<Provider> CreateAsync(Provider provider, string partitionKey)
    {
        return await base.CreateAsync(provider, partitionKey);
    }

    public new async Task<Provider> UpdateAsync(Provider provider, string id, string partitionKey)
    {
        return await base.UpdateAsync(provider, id, partitionKey);
    }

    public async Task<List<Provider>> FindBySkillCategoriesNearLocationAsync(
        List<string> categories,
        double longitude,
        double latitude,
        double radiusKm)
    {
        // Cosmos DB spatial query to find providers within radius with matching skill categories
        // ST_DISTANCE returns distance in meters, so we convert radiusKm to meters
        var query = @"
            SELECT * FROM c
            WHERE c.isActive = true
            AND ST_DISTANCE(c.location, {'type': 'Point', 'coordinates': [@lon, @lat]}) < @radius";

        var parameters = new Dictionary<string, object>
        {
            { "@lon", longitude },
            { "@lat", latitude },
            { "@radius", radiusKm * 1000 } // Convert to meters
        };

        var allProviders = await QueryAsync(query, parameters);

        // Filter by skill categories in memory (Cosmos DB doesn't support ARRAY_INTERSECT in all scenarios)
        return allProviders
            .Where(p => p.SkillCategories.Intersect(categories).Any())
            .ToList();
    }

    public async Task<List<Provider>> GetActiveProvidersAsync()
    {
        var query = "SELECT * FROM c WHERE c.isActive = true";
        return await QueryAsync(query);
    }
}
