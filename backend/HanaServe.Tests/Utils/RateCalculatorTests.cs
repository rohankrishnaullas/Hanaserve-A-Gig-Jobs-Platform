using HanaServe.Core.Utils;

namespace HanaServe.Tests.Utils;

public class RateCalculatorTests
{
    [Fact]
    public void CalculateSuggestedRate_ReturnsDefaultForNoCategories()
    {
        var rate = RateCalculator.CalculateSuggestedRate(
            Enumerable.Empty<string>(),
            0,
            0
        );

        Assert.Equal(150m, rate);
    }

    [Fact]
    public void CalculateSuggestedRate_ReturnsHigherForExperience()
    {
        var beginnerRate = RateCalculator.CalculateSuggestedRate(
            new[] { "pet_care" },
            5,  // beginner
            4.0
        );

        var experiencedRate = RateCalculator.CalculateSuggestedRate(
            new[] { "pet_care" },
            100, // expert
            4.8
        );

        Assert.True(experiencedRate > beginnerRate);
    }

    [Fact]
    public void CalculateSuggestedRate_ReturnsHigherForBetterRating()
    {
        var lowRatingRate = RateCalculator.CalculateSuggestedRate(
            new[] { "tutoring" },
            20,
            2.0
        );

        var highRatingRate = RateCalculator.CalculateSuggestedRate(
            new[] { "tutoring" },
            20,
            5.0
        );

        Assert.True(highRatingRate > lowRatingRate);
    }

    [Fact]
    public void CalculateSuggestedRate_UsesHighestBaseRate()
    {
        var fitnessOnlyRate = RateCalculator.CalculateSuggestedRate(
            new[] { "fitness" },  // Base rate 400
            0,
            0
        );

        var deliveryOnlyRate = RateCalculator.CalculateSuggestedRate(
            new[] { "delivery" },  // Base rate 120
            0,
            0
        );

        Assert.True(fitnessOnlyRate > deliveryOnlyRate);
    }

    [Fact]
    public void CalculateJobCost_ReturnsCorrectCost()
    {
        var cost = RateCalculator.CalculateJobCost(300m, 120); // 2 hours
        Assert.Equal(600m, cost);
    }

    [Fact]
    public void CalculateJobCost_ReturnsMinimumOneHour()
    {
        var cost = RateCalculator.CalculateJobCost(300m, 30); // 30 minutes
        Assert.Equal(300m, cost); // Should be minimum 1 hour
    }

    [Fact]
    public void GetBaseRateForCategory_ReturnsCorrectRate()
    {
        var fitnessRate = RateCalculator.GetBaseRateForCategory("fitness");
        var deliveryRate = RateCalculator.GetBaseRateForCategory("delivery");

        Assert.Equal(400m, fitnessRate);
        Assert.Equal(120m, deliveryRate);
    }

    [Fact]
    public void GetBaseRateForCategory_ReturnsDefault_ForUnknown()
    {
        var rate = RateCalculator.GetBaseRateForCategory("unknown");
        Assert.Equal(150m, rate);
    }

    [Fact]
    public void GetAllBaseRates_ReturnsAllCategories()
    {
        var rates = RateCalculator.GetAllBaseRates();

        Assert.NotEmpty(rates);
        Assert.Contains("pet_care", rates.Keys);
        Assert.Contains("fitness", rates.Keys);
        Assert.Contains("tutoring", rates.Keys);
    }
}
