using System.Text.Json.Serialization;
using HanaServe.Core.Models;

namespace HanaServe.Core.DTOs.Provider;

public class ProviderResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }

    [JsonPropertyName("profilePictureUrl")]
    public string? ProfilePictureUrl { get; set; }

    [JsonPropertyName("skills")]
    public List<string> Skills { get; set; } = new();

    [JsonPropertyName("skillCategories")]
    public List<string> SkillCategories { get; set; } = new();

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("address")]
    public string? Address { get; set; }

    [JsonPropertyName("availability")]
    public Availability? Availability { get; set; }

    [JsonPropertyName("hourlyRate")]
    public decimal HourlyRate { get; set; }

    [JsonPropertyName("rating")]
    public double Rating { get; set; }

    [JsonPropertyName("totalRatings")]
    public int TotalRatings { get; set; }

    [JsonPropertyName("completedJobs")]
    public int CompletedJobs { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("isVerified")]
    public bool IsVerified { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    public static ProviderResponse FromProvider(Models.Provider provider)
    {
        return new ProviderResponse
        {
            Id = provider.Id,
            UserId = provider.UserId,
            Name = provider.Name,
            Email = provider.Email,
            Phone = provider.Phone,
            Bio = provider.Bio,
            ProfilePictureUrl = provider.ProfilePictureUrl,
            Skills = provider.Skills,
            SkillCategories = provider.SkillCategories,
            Latitude = provider.Location.Latitude,
            Longitude = provider.Location.Longitude,
            City = provider.City,
            Address = provider.Address,
            Availability = provider.Availability,
            HourlyRate = provider.HourlyRate,
            Rating = provider.Rating,
            TotalRatings = provider.TotalRatings,
            CompletedJobs = provider.CompletedJobs,
            IsActive = provider.IsActive,
            IsVerified = provider.IsVerified,
            CreatedAt = provider.CreatedAt
        };
    }
}
