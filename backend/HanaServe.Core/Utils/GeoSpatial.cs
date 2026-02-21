namespace HanaServe.Core.Utils;

public static class GeoSpatial
{
    private const double EarthRadiusKm = 6371.0;

    /// <summary>
    /// Calculates the Haversine distance between two points on Earth.
    /// </summary>
    /// <param name="lat1">Latitude of point 1 in degrees</param>
    /// <param name="lon1">Longitude of point 1 in degrees</param>
    /// <param name="lat2">Latitude of point 2 in degrees</param>
    /// <param name="lon2">Longitude of point 2 in degrees</param>
    /// <returns>Distance in kilometers</returns>
    public static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    /// <summary>
    /// Checks if a point is within a given radius of another point.
    /// </summary>
    public static bool IsWithinRadius(
        double centerLat, double centerLon,
        double pointLat, double pointLon,
        double radiusKm)
    {
        var distance = HaversineDistance(centerLat, centerLon, pointLat, pointLon);
        return distance <= radiusKm;
    }

    /// <summary>
    /// Gets the bounding box for a point with a given radius (for efficient filtering).
    /// </summary>
    public static (double MinLat, double MaxLat, double MinLon, double MaxLon) GetBoundingBox(
        double lat, double lon, double radiusKm)
    {
        var latDelta = radiusKm / 111.0; // Approximate degrees per km at equator
        var lonDelta = radiusKm / (111.0 * Math.Cos(ToRadians(lat)));

        return (
            MinLat: lat - latDelta,
            MaxLat: lat + latDelta,
            MinLon: lon - lonDelta,
            MaxLon: lon + lonDelta
        );
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;

    private static double ToDegrees(double radians) => radians * 180.0 / Math.PI;
}
