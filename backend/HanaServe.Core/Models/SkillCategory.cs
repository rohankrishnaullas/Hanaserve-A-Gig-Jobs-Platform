using System.Text.Json.Serialization;

namespace HanaServe.Core.Models;

public class SkillCategory
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("keywords")]
    public List<string> Keywords { get; set; } = new();

    [JsonPropertyName("iconName")]
    public string? IconName { get; set; }

    [JsonPropertyName("baseHourlyRate")]
    public decimal BaseHourlyRate { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; } = true;
}
