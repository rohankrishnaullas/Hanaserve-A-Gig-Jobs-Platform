using HanaServe.Core.Models;
using HanaServe.Core.Services;
using HanaServe.Core.Repositories;
using Moq;
using JobMatch = HanaServe.Core.Models.Match;

namespace HanaServe.Tests.Services;

public class MatchingServiceTests
{
    private readonly Mock<IProviderRepository> _providerRepoMock;
    private readonly Mock<IMatchRepository> _matchRepoMock;
    private readonly Mock<IJobService> _jobServiceMock;
    private readonly MatchingService _matchingService;

    public MatchingServiceTests()
    {
        _providerRepoMock = new Mock<IProviderRepository>();
        _matchRepoMock = new Mock<IMatchRepository>();
        _jobServiceMock = new Mock<IJobService>();

        _matchingService = new MatchingService(
            _providerRepoMock.Object,
            _matchRepoMock.Object,
            _jobServiceMock.Object
        );
    }

    [Fact]
    public async Task FindMatchesForJob_ReturnsMatchesOrderedByScore()
    {
        // Arrange
        var job = CreateTestJob();
        var providers = new List<Provider>
        {
            CreateTestProvider("provider1", "user1", new[] { "pet_care" }, 12.97, 77.60, 4.5),
            CreateTestProvider("provider2", "user2", new[] { "pet_care" }, 12.98, 77.61, 3.5),
            CreateTestProvider("provider3", "user3", new[] { "pet_care", "cleaning" }, 12.96, 77.59, 5.0)
        };

        _providerRepoMock.Setup(r => r.FindBySkillCategoriesNearLocationAsync(
            It.IsAny<List<string>>(),
            It.IsAny<double>(),
            It.IsAny<double>(),
            It.IsAny<double>()
        )).ReturnsAsync(providers);

        // Act
        var matches = await _matchingService.FindMatchesForJobAsync(job);

        // Assert
        Assert.NotEmpty(matches);
        Assert.True(matches.Count <= providers.Count);
        Assert.True(matches.All(m => m.MatchScore >= 0.30));

        // Verify ordering by score descending
        for (int i = 1; i < matches.Count; i++)
        {
            Assert.True(matches[i - 1].MatchScore >= matches[i].MatchScore);
        }
    }

    [Fact]
    public async Task FindMatchesForJob_ExcludesJobRequester()
    {
        // Arrange
        var job = CreateTestJob();
        job.RequesterId = "user1"; // Same as one provider

        var providers = new List<Provider>
        {
            CreateTestProvider("provider1", "user1", new[] { "pet_care" }, 12.97, 77.60, 4.5), // Should be excluded
            CreateTestProvider("provider2", "user2", new[] { "pet_care" }, 12.98, 77.61, 3.5)
        };

        _providerRepoMock.Setup(r => r.FindBySkillCategoriesNearLocationAsync(
            It.IsAny<List<string>>(),
            It.IsAny<double>(),
            It.IsAny<double>(),
            It.IsAny<double>()
        )).ReturnsAsync(providers);

        // Act
        var matches = await _matchingService.FindMatchesForJobAsync(job);

        // Assert
        Assert.All(matches, m => Assert.NotEqual("provider1", m.ProviderId));
    }

    [Fact]
    public async Task FindMatchesForJob_ExcludesInactiveProviders()
    {
        // Arrange
        var job = CreateTestJob();
        var providers = new List<Provider>
        {
            CreateTestProvider("provider1", "user1", new[] { "pet_care" }, 12.97, 77.60, 4.5),
            CreateTestProvider("provider2", "user2", new[] { "pet_care" }, 12.98, 77.61, 3.5, isActive: false)
        };

        _providerRepoMock.Setup(r => r.FindBySkillCategoriesNearLocationAsync(
            It.IsAny<List<string>>(),
            It.IsAny<double>(),
            It.IsAny<double>(),
            It.IsAny<double>()
        )).ReturnsAsync(providers);

        // Act
        var matches = await _matchingService.FindMatchesForJobAsync(job);

        // Assert
        Assert.All(matches, m => Assert.NotEqual("provider2", m.ProviderId));
    }

    [Fact]
    public async Task FindMatchesForJob_ReturnsEmptyForNoSkillCategories()
    {
        // Arrange
        var job = CreateTestJob();
        job.SkillCategories = new List<string>();

        // Act
        var matches = await _matchingService.FindMatchesForJobAsync(job);

        // Assert
        Assert.Empty(matches);
    }

    [Fact]
    public async Task FindMatchesForJob_CalculatesDistanceCorrectly()
    {
        // Arrange
        var job = CreateTestJob();
        var providers = new List<Provider>
        {
            CreateTestProvider("provider1", "user1", new[] { "pet_care" }, 12.97, 77.60, 4.5)
        };

        _providerRepoMock.Setup(r => r.FindBySkillCategoriesNearLocationAsync(
            It.IsAny<List<string>>(),
            It.IsAny<double>(),
            It.IsAny<double>(),
            It.IsAny<double>()
        )).ReturnsAsync(providers);

        // Act
        var matches = await _matchingService.FindMatchesForJobAsync(job);

        // Assert
        Assert.Single(matches);
        Assert.True(matches[0].Distance >= 0);
        Assert.True(matches[0].Distance <= 10.0); // Within max radius
    }

    [Fact]
    public async Task AcceptMatch_UpdatesMatchStatus()
    {
        // Arrange
        var match = CreateTestMatch("match1", "job1", "provider1", MatchStatus.Pending);
        var provider = CreateTestProvider("provider1", "user1", new[] { "pet_care" }, 12.97, 77.60, 4.5);

        _matchRepoMock.Setup(r => r.GetByIdAsync("match1")).ReturnsAsync(match);
        _matchRepoMock.Setup(r => r.UpdateAsync(It.IsAny<JobMatch>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((JobMatch m, string id, string pk) => m);
        _matchRepoMock.Setup(r => r.GetByJobIdAsync("job1")).ReturnsAsync(new List<JobMatch> { match });
        _providerRepoMock.Setup(r => r.GetByIdAsync("provider1")).ReturnsAsync(provider);
        _jobServiceMock.Setup(s => s.AssignProviderAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(new Job());

        // Act
        var result = await _matchingService.AcceptMatchAsync("match1", "provider1");

        // Assert
        Assert.Equal(MatchStatus.Accepted, result.Status);
        Assert.NotNull(result.RespondedAt);
    }

    [Fact]
    public async Task AcceptMatch_ThrowsForWrongProvider()
    {
        // Arrange
        var match = CreateTestMatch("match1", "job1", "provider1", MatchStatus.Pending);

        _matchRepoMock.Setup(r => r.GetByIdAsync("match1")).ReturnsAsync(match);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _matchingService.AcceptMatchAsync("match1", "provider2")
        );
    }

    [Fact]
    public async Task AcceptMatch_ThrowsForExpiredMatch()
    {
        // Arrange
        var match = CreateTestMatch("match1", "job1", "provider1", MatchStatus.Pending);
        match.ExpiresAt = DateTime.UtcNow.AddMinutes(-1); // Expired

        _matchRepoMock.Setup(r => r.GetByIdAsync("match1")).ReturnsAsync(match);
        _matchRepoMock.Setup(r => r.UpdateAsync(It.IsAny<JobMatch>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((JobMatch m, string id, string pk) => m);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _matchingService.AcceptMatchAsync("match1", "provider1")
        );
    }

    [Fact]
    public async Task DeclineMatch_UpdatesMatchStatus()
    {
        // Arrange
        var match = CreateTestMatch("match1", "job1", "provider1", MatchStatus.Pending);

        _matchRepoMock.Setup(r => r.GetByIdAsync("match1")).ReturnsAsync(match);
        _matchRepoMock.Setup(r => r.UpdateAsync(It.IsAny<JobMatch>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((JobMatch m, string id, string pk) => m);

        // Act
        var result = await _matchingService.DeclineMatchAsync("match1", "provider1");

        // Assert
        Assert.Equal(MatchStatus.Declined, result.Status);
        Assert.NotNull(result.RespondedAt);
    }

    private static Job CreateTestJob()
    {
        return new Job
        {
            Id = "job1",
            RequesterId = "requester1",
            RequesterName = "Test Requester",
            Title = "Walk my dog",
            Description = "Need someone to walk my dog",
            SkillCategories = new List<string> { "pet_care" },
            Location = new GeoPoint(77.59, 12.97),
            City = "Bangalore",
            Status = JobStatus.Open
        };
    }

    private static Provider CreateTestProvider(
        string id,
        string userId,
        string[] skillCategories,
        double lat,
        double lon,
        double rating,
        bool isActive = true)
    {
        return new Provider
        {
            Id = id,
            UserId = userId,
            Name = $"Provider {id}",
            SkillCategories = skillCategories.ToList(),
            Location = new GeoPoint(lon, lat),
            Rating = rating,
            TotalRatings = 10,
            IsActive = isActive
        };
    }

    private static JobMatch CreateTestMatch(string id, string jobId, string providerId, MatchStatus status)
    {
        return new JobMatch
        {
            Id = id,
            JobId = jobId,
            ProviderId = providerId,
            Status = status,
            MatchScore = 0.75,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
    }
}
