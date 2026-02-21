using HanaServe.Core.Models;
using HanaServe.Core.Utils;

namespace HanaServe.Core.Services;

public class SkillService : ISkillService
{
    private static readonly List<SkillCategory> _categories;

    static SkillService()
    {
        var displayNames = SkillCategories.GetCategoryDisplayNames();
        var baseRates = RateCalculator.GetAllBaseRates();

        _categories = SkillCategories.Categories.Select(kvp => new SkillCategory
        {
            Id = kvp.Key,
            Name = kvp.Key,
            DisplayName = displayNames.TryGetValue(kvp.Key, out var name) ? name : kvp.Key,
            Keywords = kvp.Value.ToList(),
            BaseHourlyRate = baseRates.TryGetValue(kvp.Key, out var rate) ? rate : 150m,
            IsActive = true
        }).ToList();
    }

    public List<SkillCategory> GetAllCategories()
    {
        return _categories.Where(c => c.IsActive).ToList();
    }

    public SkillCategory? GetCategoryById(string id)
    {
        return _categories.FirstOrDefault(c => c.Id == id);
    }

    public List<string> ExtractSkillsFromText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return new List<string>();

        var lowerText = text.ToLowerInvariant();
        var matchedSkills = new HashSet<string>();

        foreach (var category in SkillCategories.Categories)
        {
            foreach (var keyword in category.Value)
            {
                if (lowerText.Contains(keyword))
                {
                    matchedSkills.Add(keyword);
                }
            }
        }

        return matchedSkills.ToList();
    }

    public List<string> ExtractCategoriesFromText(string text)
    {
        return SkillCategories.ExtractCategories(text);
    }

    public decimal CalculateSuggestedRate(IEnumerable<string> skillCategories, int completedJobs, double rating)
    {
        return RateCalculator.CalculateSuggestedRate(skillCategories, completedJobs, rating);
    }
}
