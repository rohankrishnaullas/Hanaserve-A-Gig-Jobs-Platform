using System.Text.Json.Serialization;

namespace HanaServe.Core.Models;

public class Match
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("jobId")]
    public string JobId { get; set; } = string.Empty;

    [JsonPropertyName("providerId")]
    public string ProviderId { get; set; } = string.Empty;

    [JsonPropertyName("providerName")]
    public string ProviderName { get; set; } = string.Empty;

    [JsonPropertyName("providerRating")]
    public double ProviderRating { get; set; }

    [JsonPropertyName("jobTitle")]
    public string JobTitle { get; set; } = string.Empty;

    [JsonPropertyName("jobDescription")]
    public string? JobDescription { get; set; }

    [JsonPropertyName("requesterId")]
    public string RequesterId { get; set; } = string.Empty;

    [JsonPropertyName("requesterName")]
    public string RequesterName { get; set; } = string.Empty;

    [JsonPropertyName("matchScore")]
    public double MatchScore { get; set; }

    [JsonPropertyName("distance")]
    public double Distance { get; set; } // in km

    [JsonPropertyName("skillScore")]
    public double SkillScore { get; set; }

    [JsonPropertyName("distanceScore")]
    public double DistanceScore { get; set; }

    [JsonPropertyName("ratingScore")]
    public double RatingScore { get; set; }

    [JsonPropertyName("availabilityScore")]
    public double AvailabilityScore { get; set; }

    [JsonPropertyName("status")]
    public MatchStatus Status { get; set; } = MatchStatus.Pending;

    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }

    [JsonPropertyName("respondedAt")]
    public DateTime? RespondedAt { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MatchStatus
{
    Pending,
    Accepted,
    Declined,
    Expired
}
