using HanaServe.Core.Utils;

namespace HanaServe.Tests.Utils;

public class SkillCategoriesTests
{
    [Fact]
    public void ExtractCategories_FindsPetCare()
    {
        var categories = SkillCategories.ExtractCategories("I need someone for dog walking");

        Assert.Contains("pet_care", categories);
    }

    [Fact]
    public void ExtractCategories_FindsMultipleCategories()
    {
        var categories = SkillCategories.ExtractCategories("I need help with cleaning and grocery shopping");

        Assert.Contains("cleaning", categories);
        Assert.Contains("shopping", categories);
    }

    [Fact]
    public void ExtractCategories_ReturnsEmpty_ForNoMatch()
    {
        var categories = SkillCategories.ExtractCategories("random text with no skills");

        Assert.Empty(categories);
    }

    [Fact]
    public void ExtractCategories_IsCaseInsensitive()
    {
        var categories = SkillCategories.ExtractCategories("DOG WALKING and BABYSITTING");

        Assert.Contains("pet_care", categories);
        Assert.Contains("childcare", categories);
    }

    [Fact]
    public void ExtractCategories_HandlesNullOrEmpty()
    {
        Assert.Empty(SkillCategories.ExtractCategories(null!));
        Assert.Empty(SkillCategories.ExtractCategories(""));
        Assert.Empty(SkillCategories.ExtractCategories("   "));
    }

    [Fact]
    public void MapSkillsToCategories_MapsCorrectly()
    {
        var skills = new[] { "dog walking", "pet sitting", "grocery shopping" };
        var categories = SkillCategories.MapSkillsToCategories(skills);

        Assert.Contains("pet_care", categories);
        Assert.Contains("shopping", categories);
    }

    [Fact]
    public void MapSkillsToCategories_HandlesNull()
    {
        var categories = SkillCategories.MapSkillsToCategories(null!);
        Assert.Empty(categories);
    }

    [Fact]
    public void GetCategoryDisplayNames_ReturnsAllCategories()
    {
        var displayNames = SkillCategories.GetCategoryDisplayNames();

        Assert.Contains("pet_care", displayNames.Keys);
        Assert.Contains("childcare", displayNames.Keys);
        Assert.Contains("shopping", displayNames.Keys);

        Assert.Equal("Pet Care", displayNames["pet_care"]);
        Assert.Equal("Childcare", displayNames["childcare"]);
    }

    [Fact]
    public void GetKeywordsForCategory_ReturnsKeywords()
    {
        var keywords = SkillCategories.GetKeywordsForCategory("pet_care");

        Assert.NotEmpty(keywords);
        Assert.Contains("dog walking", keywords);
        Assert.Contains("pet sitting", keywords);
    }

    [Fact]
    public void GetKeywordsForCategory_ReturnsEmpty_ForUnknownCategory()
    {
        var keywords = SkillCategories.GetKeywordsForCategory("unknown_category");
        Assert.Empty(keywords);
    }

    [Fact]
    public void HasMatchingCategory_ReturnsTrue_WhenMatches()
    {
        var result = SkillCategories.HasMatchingCategory(
            "dog walking services",
            new[] { "pet_care", "cleaning" }
        );
        Assert.True(result);
    }

    [Fact]
    public void HasMatchingCategory_ReturnsFalse_WhenNoMatch()
    {
        var result = SkillCategories.HasMatchingCategory(
            "random text",
            new[] { "pet_care", "cleaning" }
        );
        Assert.False(result);
    }
}
