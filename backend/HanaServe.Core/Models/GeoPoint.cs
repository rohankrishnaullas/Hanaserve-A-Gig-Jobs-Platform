using System.Text.Json.Serialization;

namespace HanaServe.Core.Models;

public class GeoPoint
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Point";

    [JsonPropertyName("coordinates")]
    public double[] Coordinates { get; set; } = new double[2]; // [longitude, latitude]

    public GeoPoint() { }

    public GeoPoint(double longitude, double latitude)
    {
        Coordinates = new[] { longitude, latitude };
    }

    public double Longitude => Coordinates[0];
    public double Latitude => Coordinates[1];
}
