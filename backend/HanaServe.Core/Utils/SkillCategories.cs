namespace HanaServe.Core.Utils;

public static class SkillCategories
{
    public static readonly Dictionary<string, string[]> Categories = new()
    {
        ["pet_care"] = new[]
        {
            "dog walking", "pet sitting", "animal care", "dog care", "cat care",
            "pet feeding", "pet grooming", "dog training", "pet exercise"
        },
        ["childcare"] = new[]
        {
            "babysitting", "child care", "tutoring", "homework help", "kids",
            "children", "nanny", "after school care", "infant care"
        },
        ["shopping"] = new[]
        {
            "grocery shopping", "buying stuff", "errands", "shopping", "purchases",
            "grocery delivery", "personal shopping", "gift shopping"
        },
        ["companionship"] = new[]
        {
            "company", "companionship", "elderly care", "visiting", "chatting",
            "talking", "social visits", "senior care", "friendly visits"
        },
        ["tutoring"] = new[]
        {
            "tutoring", "teaching", "homework help", "education", "learning",
            "academic help", "math tutoring", "english tutoring", "test prep"
        },
        ["cleaning"] = new[]
        {
            "cleaning", "housekeeping", "tidying", "organizing", "house cleaning",
            "deep cleaning", "laundry", "ironing", "decluttering"
        },
        ["delivery"] = new[]
        {
            "delivery", "pickup", "transport", "moving", "courier",
            "package delivery", "document delivery", "food delivery"
        },
        ["tech_help"] = new[]
        {
            "computer help", "tech support", "phone help", "internet help",
            "wifi setup", "device setup", "software help", "troubleshooting"
        },
        ["gardening"] = new[]
        {
            "gardening", "lawn care", "yard work", "landscaping", "planting",
            "weeding", "mowing", "tree trimming", "garden maintenance"
        },
        ["handyman"] = new[]
        {
            "handyman", "repairs", "fixing", "maintenance", "assembly",
            "furniture assembly", "minor repairs", "home maintenance"
        },
        ["cooking"] = new[]
        {
            "cooking", "meal prep", "baking", "food preparation", "chef",
            "personal chef", "meal planning", "catering"
        },
        ["fitness"] = new[]
        {
            "fitness", "personal training", "exercise", "yoga", "workout",
            "fitness instruction", "stretching", "wellness coaching"
        }
    };

    /// <summary>
    /// Extracts skill categories from a text description using keyword matching.
    /// </summary>
    public static List<string> ExtractCategories(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return new List<string>();

        var lowerText = text.ToLowerInvariant();
        var result = new HashSet<string>();

        foreach (var (category, keywords) in Categories)
        {
            if (keywords.Any(k => lowerText.Contains(k)))
            {
                result.Add(category);
            }
        }

        return result.ToList();
    }

    /// <summary>
    /// Maps a list of skills to their corresponding categories.
    /// </summary>
    public static List<string> MapSkillsToCategories(IEnumerable<string> skills)
    {
        if (skills == null)
            return new List<string>();

        var categories = new HashSet<string>();
        foreach (var skill in skills)
        {
            categories.UnionWith(ExtractCategories(skill));
        }
        return categories.ToList();
    }

    /// <summary>
    /// Gets all available categories with their display names.
    /// </summary>
    public static Dictionary<string, string> GetCategoryDisplayNames()
    {
        return new Dictionary<string, string>
        {
            ["pet_care"] = "Pet Care",
            ["childcare"] = "Childcare",
            ["shopping"] = "Shopping & Errands",
            ["companionship"] = "Companionship",
            ["tutoring"] = "Tutoring",
            ["cleaning"] = "Cleaning",
            ["delivery"] = "Delivery",
            ["tech_help"] = "Tech Help",
            ["gardening"] = "Gardening",
            ["handyman"] = "Handyman",
            ["cooking"] = "Cooking",
            ["fitness"] = "Fitness"
        };
    }

    /// <summary>
    /// Gets all keywords for a specific category.
    /// </summary>
    public static string[] GetKeywordsForCategory(string category)
    {
        return Categories.TryGetValue(category, out var keywords) ? keywords : Array.Empty<string>();
    }

    /// <summary>
    /// Checks if a skill text matches any category.
    /// </summary>
    public static bool HasMatchingCategory(string skillText, IEnumerable<string> categories)
    {
        var extractedCategories = ExtractCategories(skillText);
        return extractedCategories.Intersect(categories).Any();
    }
}
