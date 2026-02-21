using HanaServe.Core.Models;

namespace HanaServe.Core.Services;

public interface ISkillService
{
    List<SkillCategory> GetAllCategories();
    SkillCategory? GetCategoryById(string id);
    List<string> ExtractSkillsFromText(string text);
    List<string> ExtractCategoriesFromText(string text);
    decimal CalculateSuggestedRate(IEnumerable<string> skillCategories, int completedJobs, double rating);
}
