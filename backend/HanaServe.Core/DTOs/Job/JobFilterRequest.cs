using System.Text.Json.Serialization;
using HanaServe.Core.Models;

namespace HanaServe.Core.DTOs.Job;

public class JobFilterRequest
{
    [JsonPropertyName("status")]
    public JobStatus? Status { get; set; }

    [JsonPropertyName("skillCategories")]
    public List<string>? SkillCategories { get; set; }

    [JsonPropertyName("latitude")]
    public double? Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double? Longitude { get; set; }

    [JsonPropertyName("radiusKm")]
    public double? RadiusKm { get; set; }

    [JsonPropertyName("fromDate")]
    public DateTime? FromDate { get; set; }

    [JsonPropertyName("toDate")]
    public DateTime? ToDate { get; set; }

    [JsonPropertyName("page")]
    public int Page { get; set; } = 1;

    [JsonPropertyName("pageSize")]
    public int PageSize { get; set; } = 20;
}
