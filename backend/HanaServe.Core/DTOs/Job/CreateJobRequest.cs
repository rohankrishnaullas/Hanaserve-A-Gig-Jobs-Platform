using System.Text.Json.Serialization;

namespace HanaServe.Core.DTOs.Job;

public class CreateJobRequest
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("skills")]
    public List<string>? Skills { get; set; }

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
    public int? EstimatedDuration { get; set; }

    [JsonPropertyName("budget")]
    public decimal? Budget { get; set; }
}
