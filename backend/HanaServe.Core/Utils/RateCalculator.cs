namespace HanaServe.Core.Utils;

public static class RateCalculator
{
    // Base hourly rates by category (in INR for Bangalore market)
    private static readonly Dictionary<string, decimal> BaseRates = new()
    {
        ["pet_care"] = 200m,
        ["childcare"] = 250m,
        ["shopping"] = 150m,
        ["companionship"] = 200m,
        ["tutoring"] = 300m,
        ["cleaning"] = 180m,
        ["delivery"] = 120m,
        ["tech_help"] = 350m,
        ["gardening"] = 150m,
        ["handyman"] = 250m,
        ["cooking"] = 300m,
        ["fitness"] = 400m
    };

    // Experience multipliers
    private static readonly Dictionary<string, decimal> ExperienceMultipliers = new()
    {
        ["beginner"] = 1.0m,      // 0-1 years or < 10 jobs
        ["intermediate"] = 1.2m,   // 1-3 years or 10-50 jobs
        ["experienced"] = 1.4m,    // 3+ years or 50+ jobs
        ["expert"] = 1.6m          // 5+ years or 100+ jobs with high rating
    };

    /// <summary>
    /// Calculates suggested hourly rate based on skills and experience.
    /// </summary>
    public static decimal CalculateSuggestedRate(
        IEnumerable<string> skillCategories,
        int completedJobs,
        double rating)
    {
        var categories = skillCategories.ToList();
        if (!categories.Any())
            return 150m; // Default minimum rate

        // Get the highest base rate from all skill categories
        var maxBaseRate = categories
            .Where(c => BaseRates.ContainsKey(c))
            .Select(c => BaseRates[c])
            .DefaultIfEmpty(150m)
            .Max();

        // Determine experience level
        var experienceLevel = DetermineExperienceLevel(completedJobs, rating);
        var experienceMultiplier = ExperienceMultipliers[experienceLevel];

        // Apply rating bonus (up to 10% for 5-star rating)
        var ratingBonus = 1.0m + (decimal)(rating / 50.0); // 0-10% bonus

        var suggestedRate = maxBaseRate * experienceMultiplier * ratingBonus;

        // Round to nearest 10
        return Math.Round(suggestedRate / 10) * 10;
    }

    /// <summary>
    /// Calculates estimated job cost based on rate and duration.
    /// </summary>
    public static decimal CalculateJobCost(decimal hourlyRate, int durationMinutes)
    {
        var hours = durationMinutes / 60.0m;
        var cost = hourlyRate * hours;

        // Minimum charge of 1 hour
        if (cost < hourlyRate)
            cost = hourlyRate;

        return Math.Round(cost, 2);
    }

    /// <summary>
    /// Gets the base rate for a specific category.
    /// </summary>
    public static decimal GetBaseRateForCategory(string category)
    {
        return BaseRates.TryGetValue(category, out var rate) ? rate : 150m;
    }

    /// <summary>
    /// Gets all base rates for display.
    /// </summary>
    public static Dictionary<string, decimal> GetAllBaseRates()
    {
        return new Dictionary<string, decimal>(BaseRates);
    }

    private static string DetermineExperienceLevel(int completedJobs, double rating)
    {
        if (completedJobs >= 100 && rating >= 4.5)
            return "expert";
        if (completedJobs >= 50)
            return "experienced";
        if (completedJobs >= 10)
            return "intermediate";
        return "beginner";
    }
}
