using HanaServe.Core.Models;
using HanaServe.Core.Repositories;

namespace HanaServe.Data.Repositories;

public class UserRepository : CosmosRepository<User>, IUserRepository
{
    public UserRepository(CosmosDbContext context) : base(context.Users)
    {
    }

    public new async Task<User?> GetByIdAsync(string id, string partitionKey)
    {
        return await base.GetByIdAsync(id, partitionKey);
    }

    public new async Task<User> CreateAsync(User user, string partitionKey)
    {
        return await base.CreateAsync(user, partitionKey);
    }

    public new async Task<User> UpdateAsync(User user, string id, string partitionKey)
    {
        return await base.UpdateAsync(user, id, partitionKey);
    }

    public new async Task DeleteAsync(string id, string partitionKey)
    {
        await base.DeleteAsync(id, partitionKey);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var query = "SELECT * FROM c WHERE c.email = @email";
        var parameters = new Dictionary<string, object> { { "@email", email } };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }

    public async Task<User?> GetByGoogleIdAsync(string googleId)
    {
        var query = "SELECT * FROM c WHERE c.googleId = @googleId";
        var parameters = new Dictionary<string, object> { { "@googleId", googleId } };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        var query = "SELECT * FROM c WHERE c.refreshToken = @refreshToken AND c.refreshTokenExpiresAt > @now";
        var parameters = new Dictionary<string, object>
        {
            { "@refreshToken", refreshToken },
            { "@now", DateTime.UtcNow }
        };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }
}
