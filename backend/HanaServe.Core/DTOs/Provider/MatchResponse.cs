using System.Text.Json.Serialization;
using HanaServe.Core.Models;

namespace HanaServe.Core.DTOs.Provider;

public class MatchResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("jobId")]
    public string JobId { get; set; } = string.Empty;

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
    public double Distance { get; set; }

    [JsonPropertyName("skillScore")]
    public double SkillScore { get; set; }

    [JsonPropertyName("distanceScore")]
    public double DistanceScore { get; set; }

    [JsonPropertyName("ratingScore")]
    public double RatingScore { get; set; }

    [JsonPropertyName("availabilityScore")]
    public double AvailabilityScore { get; set; }

    [JsonPropertyName("status")]
    public MatchStatus Status { get; set; }

    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    public static MatchResponse FromMatch(Match match)
    {
        return new MatchResponse
        {
            Id = match.Id,
            JobId = match.JobId,
            JobTitle = match.JobTitle,
            JobDescription = match.JobDescription,
            RequesterId = match.RequesterId,
            RequesterName = match.RequesterName,
            MatchScore = match.MatchScore,
            Distance = match.Distance,
            SkillScore = match.SkillScore,
            DistanceScore = match.DistanceScore,
            RatingScore = match.RatingScore,
            AvailabilityScore = match.AvailabilityScore,
            Status = match.Status,
            ExpiresAt = match.ExpiresAt,
            CreatedAt = match.CreatedAt
        };
    }
}
