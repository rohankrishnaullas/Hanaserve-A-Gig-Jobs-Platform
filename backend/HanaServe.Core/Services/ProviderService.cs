using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Models;
using HanaServe.Core.Utils;
using HanaServe.Core.Repositories;

namespace HanaServe.Core.Services;

public class ProviderService : IProviderService
{
    private readonly IProviderRepository _providerRepository;
    private readonly IUserRepository _userRepository;

    public ProviderService(
        IProviderRepository providerRepository,
        IUserRepository userRepository)
    {
        _providerRepository = providerRepository;
        _userRepository = userRepository;
    }

    public async Task<Provider> CreateProviderAsync(string userId, CreateProviderRequest request)
    {
        // Check if provider already exists for this user
        var existingProvider = await _providerRepository.GetByUserIdAsync(userId);
        if (existingProvider != null)
        {
            throw new InvalidOperationException("Provider profile already exists for this user");
        }

        // Get user details
        var user = await _userRepository.GetByIdAsync(userId, userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Map skills to categories
        var skillCategories = SkillCategories.MapSkillsToCategories(request.Skills);

        // Calculate suggested hourly rate if not provided
        var hourlyRate = request.HourlyRate ?? RateCalculator.CalculateSuggestedRate(skillCategories, 0, 0);

        var provider = new Provider
        {
            UserId = userId,
            Name = request.Name,
            Email = user.Email,
            Phone = request.Phone,
            Bio = request.Bio,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Skills = request.Skills,
            SkillCategories = skillCategories,
            Location = new GeoPoint(request.Longitude, request.Latitude),
            City = request.City,
            Address = request.Address,
            Availability = request.Availability ?? new Availability(),
            HourlyRate = hourlyRate
        };

        await _providerRepository.CreateAsync(provider, provider.UserId);

        // Update user's isProvider flag
        user.IsProvider = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, user.Id, user.Id);

        return provider;
    }

    public async Task<Provider?> GetProviderByIdAsync(string id)
    {
        return await _providerRepository.GetByIdAsync(id);
    }

    public async Task<Provider?> GetProviderByUserIdAsync(string userId)
    {
        return await _providerRepository.GetByUserIdAsync(userId);
    }

    public async Task<Provider> UpdateProviderAsync(string userId, UpdateProviderRequest request)
    {
        var provider = await _providerRepository.GetByUserIdAsync(userId);
        if (provider == null)
        {
            throw new InvalidOperationException("Provider profile not found");
        }

        // Update fields if provided
        if (request.Name != null)
            provider.Name = request.Name;

        if (request.Phone != null)
            provider.Phone = request.Phone;

        if (request.Bio != null)
            provider.Bio = request.Bio;

        if (request.Skills != null)
        {
            provider.Skills = request.Skills;
            provider.SkillCategories = SkillCategories.MapSkillsToCategories(request.Skills);
        }

        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            provider.Location = new GeoPoint(request.Longitude.Value, request.Latitude.Value);
        }

        if (request.City != null)
            provider.City = request.City;

        if (request.Address != null)
            provider.Address = request.Address;

        if (request.Availability != null)
            provider.Availability = request.Availability;

        if (request.HourlyRate.HasValue)
            provider.HourlyRate = request.HourlyRate.Value;

        if (request.IsActive.HasValue)
            provider.IsActive = request.IsActive.Value;

        provider.UpdatedAt = DateTime.UtcNow;

        return await _providerRepository.UpdateAsync(provider, provider.Id, provider.UserId);
    }

    public async Task<List<Provider>> GetActiveProvidersAsync()
    {
        return await _providerRepository.GetActiveProvidersAsync();
    }
}
