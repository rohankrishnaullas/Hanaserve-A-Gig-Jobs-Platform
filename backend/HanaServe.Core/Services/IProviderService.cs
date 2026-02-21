using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Models;

namespace HanaServe.Core.Services;

public interface IProviderService
{
    Task<Provider> CreateProviderAsync(string userId, CreateProviderRequest request);
    Task<Provider?> GetProviderByIdAsync(string id);
    Task<Provider?> GetProviderByUserIdAsync(string userId);
    Task<Provider> UpdateProviderAsync(string userId, UpdateProviderRequest request);
    Task<List<Provider>> GetActiveProvidersAsync();
}
