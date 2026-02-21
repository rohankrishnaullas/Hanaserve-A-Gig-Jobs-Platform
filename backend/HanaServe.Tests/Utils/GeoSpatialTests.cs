using HanaServe.Core.Utils;

namespace HanaServe.Tests.Utils;

public class GeoSpatialTests
{
    [Fact]
    public void HaversineDistance_ReturnsSameLocation()
    {
        // Same location should return 0
        var distance = GeoSpatial.HaversineDistance(12.97, 77.59, 12.97, 77.59);
        Assert.Equal(0, distance, precision: 5);
    }

    [Fact]
    public void HaversineDistance_ReturnsCorrectDistance()
    {
        // Bangalore to Chennai is approximately 345 km
        var distance = GeoSpatial.HaversineDistance(12.97, 77.59, 13.08, 80.27);

        Assert.True(distance > 280);
        Assert.True(distance < 320);
    }

    [Fact]
    public void HaversineDistance_IsSymmetric()
    {
        // Distance A to B should equal distance B to A
        var distanceAB = GeoSpatial.HaversineDistance(12.97, 77.59, 13.08, 80.27);
        var distanceBA = GeoSpatial.HaversineDistance(13.08, 80.27, 12.97, 77.59);

        Assert.Equal(distanceAB, distanceBA, precision: 5);
    }

    [Fact]
    public void HaversineDistance_ShortDistance()
    {
        // Two points about 1 km apart in Bangalore
        var distance = GeoSpatial.HaversineDistance(12.9716, 77.5946, 12.9816, 77.5946);

        Assert.True(distance > 0.5);
        Assert.True(distance < 2);
    }

    [Fact]
    public void IsWithinRadius_ReturnsTrue_WhenWithinRadius()
    {
        var result = GeoSpatial.IsWithinRadius(12.97, 77.59, 12.98, 77.60, 10.0);
        Assert.True(result);
    }

    [Fact]
    public void IsWithinRadius_ReturnsFalse_WhenOutsideRadius()
    {
        // Bangalore to Chennai is ~300km, well outside 10km radius
        var result = GeoSpatial.IsWithinRadius(12.97, 77.59, 13.08, 80.27, 10.0);
        Assert.False(result);
    }

    [Fact]
    public void GetBoundingBox_ReturnsValidBox()
    {
        var (minLat, maxLat, minLon, maxLon) = GeoSpatial.GetBoundingBox(12.97, 77.59, 10.0);

        // Center point should be inside the box
        Assert.True(12.97 > minLat);
        Assert.True(12.97 < maxLat);
        Assert.True(77.59 > minLon);
        Assert.True(77.59 < maxLon);

        // Box should be roughly symmetric
        var latDelta = maxLat - 12.97;
        var latDeltaMin = 12.97 - minLat;
        Assert.Equal(latDelta, latDeltaMin, precision: 2);
    }
}
