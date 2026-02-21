using System.Text.Json.Serialization;
using HanaServe.Core.Models;

namespace HanaServe.Core.DTOs.Job;

public class JobResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("requesterId")]
    public string RequesterId { get; set; } = string.Empty;

    [JsonPropertyName("requesterName")]
    public string RequesterName { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("skills")]
    public List<string> Skills { get; set; } = new();

    [JsonPropertyName("skillCategories")]
    public List<string> SkillCategories { get; set; } = new();

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("scheduledDate")]
    public DateTime? ScheduledDate { get; set; }

    [JsonPropertyName("scheduledTime")]
    public string? ScheduledTime { get; set; }

    [JsonPropertyName("estimatedDuration")]
    public int EstimatedDuration { get; set; }

    [JsonPropertyName("budget")]
    public decimal? Budget { get; set; }

    [JsonPropertyName("status")]
    public JobStatus Status { get; set; }

    [JsonPropertyName("assignedProviderId")]
    public string? AssignedProviderId { get; set; }

    [JsonPropertyName("assignedProviderName")]
    public string? AssignedProviderName { get; set; }

    [JsonPropertyName("completedAt")]
    public DateTime? CompletedAt { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    public static JobResponse FromJob(Models.Job job)
    {
        return new JobResponse
        {
            Id = job.Id,
            RequesterId = job.RequesterId,
            RequesterName = job.RequesterName,
            Title = job.Title,
            Description = job.Description,
            Skills = job.Skills,
            SkillCategories = job.SkillCategories,
            Latitude = job.Location.Latitude,
            Longitude = job.Location.Longitude,
            Address = job.Address,
            City = job.City,
            ScheduledDate = job.ScheduledDate,
            ScheduledTime = job.ScheduledTime,
            EstimatedDuration = job.EstimatedDuration,
            Budget = job.Budget,
            Status = job.Status,
            AssignedProviderId = job.AssignedProviderId,
            AssignedProviderName = job.AssignedProviderName,
            CompletedAt = job.CompletedAt,
            CreatedAt = job.CreatedAt
        };
    }
}
