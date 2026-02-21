using System.Text.Json.Serialization;

namespace HanaServe.Core.Models;

public class Availability
{
    [JsonPropertyName("monday")]
    public TimeSlot? Monday { get; set; }

    [JsonPropertyName("tuesday")]
    public TimeSlot? Tuesday { get; set; }

    [JsonPropertyName("wednesday")]
    public TimeSlot? Wednesday { get; set; }

    [JsonPropertyName("thursday")]
    public TimeSlot? Thursday { get; set; }

    [JsonPropertyName("friday")]
    public TimeSlot? Friday { get; set; }

    [JsonPropertyName("saturday")]
    public TimeSlot? Saturday { get; set; }

    [JsonPropertyName("sunday")]
    public TimeSlot? Sunday { get; set; }

    public TimeSlot? GetSlotForDay(DayOfWeek day)
    {
        return day switch
        {
            DayOfWeek.Monday => Monday,
            DayOfWeek.Tuesday => Tuesday,
            DayOfWeek.Wednesday => Wednesday,
            DayOfWeek.Thursday => Thursday,
            DayOfWeek.Friday => Friday,
            DayOfWeek.Saturday => Saturday,
            DayOfWeek.Sunday => Sunday,
            _ => null
        };
    }
}

public class TimeSlot
{
    [JsonPropertyName("start")]
    public string Start { get; set; } = "09:00";

    [JsonPropertyName("end")]
    public string End { get; set; } = "17:00";

    [JsonPropertyName("available")]
    public bool Available { get; set; } = true;
}
