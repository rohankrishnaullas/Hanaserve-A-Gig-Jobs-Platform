using HanaServe.Core.Models;

namespace HanaServe.Core.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id, string partitionKey);
    Task<User> CreateAsync(User entity, string partitionKey);
    Task<User> UpdateAsync(User entity, string id, string partitionKey);
    Task DeleteAsync(string id, string partitionKey);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByGoogleIdAsync(string googleId);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
}
