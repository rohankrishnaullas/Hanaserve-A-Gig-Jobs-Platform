using System.Text.Json.Serialization;

namespace HanaServe.Core.Models;

public class Job
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

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

    [JsonPropertyName("location")]
    public GeoPoint Location { get; set; } = new();

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("scheduledDate")]
    public DateTime? ScheduledDate { get; set; }

    [JsonPropertyName("scheduledTime")]
    public string? ScheduledTime { get; set; }

    [JsonPropertyName("estimatedDuration")]
    public int EstimatedDuration { get; set; } = 60; // minutes

    [JsonPropertyName("budget")]
    public decimal? Budget { get; set; }

    [JsonPropertyName("status")]
    public JobStatus Status { get; set; } = JobStatus.Open;

    [JsonPropertyName("assignedProviderId")]
    public string? AssignedProviderId { get; set; }

    [JsonPropertyName("assignedProviderName")]
    public string? AssignedProviderName { get; set; }

    [JsonPropertyName("completedAt")]
    public DateTime? CompletedAt { get; set; }

    [JsonPropertyName("cancelledAt")]
    public DateTime? CancelledAt { get; set; }

    [JsonPropertyName("cancellationReason")]
    public string? CancellationReason { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum JobStatus
{
    Open,
    Matched,
    InProgress,
    Completed,
    Cancelled
}
