using HanaServe.Core.Models;

namespace HanaServe.Core.Repositories;

public interface IProviderRepository
{
    Task<Provider?> GetByIdAsync(string id);
    Task<Provider?> GetByUserIdAsync(string userId);
    Task<Provider> CreateAsync(Provider provider, string partitionKey);
    Task<Provider> UpdateAsync(Provider provider, string id, string partitionKey);
    Task<List<Provider>> FindBySkillCategoriesNearLocationAsync(
        List<string> categories,
        double longitude,
        double latitude,
        double radiusKm);
    Task<List<Provider>> GetActiveProvidersAsync();
}
