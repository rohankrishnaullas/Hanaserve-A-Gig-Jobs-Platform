using HanaServe.Core.Models;
using HanaServe.Core.Utils;
using HanaServe.Core.Repositories;

namespace HanaServe.Core.Services;

public class MatchingService : IMatchingService
{
    private readonly IProviderRepository _providerRepository;
    private readonly IMatchRepository _matchRepository;
    private readonly IJobService _jobService;

    private const double MaxRadiusKm = 10.0;
    private const double MinMatchThreshold = 0.30;

    // Weights from requirements doc
    private const double SkillWeight = 0.40;
    private const double DistanceWeight = 0.30;
    private const double RatingWeight = 0.20;
    private const double AvailabilityWeight = 0.10;

    public MatchingService(
        IProviderRepository providerRepository,
        IMatchRepository matchRepository,
        IJobService jobService)
    {
        _providerRepository = providerRepository;
        _matchRepository = matchRepository;
        _jobService = jobService;
    }

    public async Task<List<Match>> FindMatchesForJobAsync(Job job)
    {
        if (!job.SkillCategories.Any())
        {
            return new List<Match>();
        }

        // Query providers with matching skill categories within radius
        var providers = await _providerRepository.FindBySkillCategoriesNearLocationAsync(
            job.SkillCategories,
            job.Location.Longitude,
            job.Location.Latitude,
            MaxRadiusKm
        );

        var matches = new List<Match>();

        foreach (var provider in providers.Where(p => p.IsActive))
        {
            // Skip if provider is the job requester
            if (provider.UserId == job.RequesterId)
                continue;

            var distance = GeoSpatial.HaversineDistance(
                job.Location.Latitude, job.Location.Longitude,
                provider.Location.Latitude, provider.Location.Longitude
            );

            if (distance > MaxRadiusKm) continue;

            var scores = CalculateScores(job, provider, distance);
            var totalScore = CalculateTotalScore(scores);

            if (totalScore >= MinMatchThreshold)
            {
                matches.Add(new Match
                {
                    JobId = job.Id,
                    ProviderId = provider.Id,
                    ProviderName = provider.Name,
                    ProviderRating = provider.Rating,
                    JobTitle = job.Title,
                    JobDescription = job.Description,
                    RequesterId = job.RequesterId,
                    RequesterName = job.RequesterName,
                    MatchScore = Math.Round(totalScore, 2),
                    Distance = Math.Round(distance, 2),
                    SkillScore = Math.Round(scores.Skill, 2),
                    DistanceScore = Math.Round(scores.Distance, 2),
                    RatingScore = Math.Round(scores.Rating, 2),
                    AvailabilityScore = Math.Round(scores.Availability, 2),
                    Status = MatchStatus.Pending,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                });
            }
        }

        // Sort by score descending
        return matches.OrderByDescending(m => m.MatchScore).ToList();
    }

    public async Task SaveMatchesAsync(List<Match> matches)
    {
        if (matches.Any())
        {
            await _matchRepository.CreateManyAsync(matches);
        }
    }

    public async Task<List<Match>> GetMatchesForProviderAsync(string providerId)
    {
        return await _matchRepository.GetPendingMatchesForProviderAsync(providerId);
    }

    public async Task<Match> AcceptMatchAsync(string matchId, string providerId)
    {
        var match = await _matchRepository.GetByIdAsync(matchId);
        if (match == null)
        {
            throw new InvalidOperationException("Match not found");
        }

        if (match.ProviderId != providerId)
        {
            throw new UnauthorizedAccessException("You can only accept your own matches");
        }

        if (match.Status != MatchStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot accept a match that is {match.Status}");
        }

        if (match.ExpiresAt < DateTime.UtcNow)
        {
            match.Status = MatchStatus.Expired;
            await _matchRepository.UpdateAsync(match, match.Id, match.JobId);
            throw new InvalidOperationException("This match has expired");
        }

        // Update the match
        match.Status = MatchStatus.Accepted;
        match.RespondedAt = DateTime.UtcNow;
        await _matchRepository.UpdateAsync(match, match.Id, match.JobId);

        // Update the job to assign this provider
        var provider = await _providerRepository.GetByIdAsync(providerId);
        if (provider != null)
        {
            await _jobService.AssignProviderAsync(match.JobId, providerId, provider.Name);
        }

        // Decline all other pending matches for this job
        var otherMatches = await _matchRepository.GetByJobIdAsync(match.JobId);
        var matchesToDecline = otherMatches
            .Where(m => m.Id != matchId && m.Status == MatchStatus.Pending)
            .ToList();

        foreach (var m in matchesToDecline)
        {
            m.Status = MatchStatus.Declined;
            m.RespondedAt = DateTime.UtcNow;
        }

        if (matchesToDecline.Any())
        {
            await _matchRepository.UpdateManyAsync(matchesToDecline);
        }

        return match;
    }

    public async Task<Match> DeclineMatchAsync(string matchId, string providerId)
    {
        var match = await _matchRepository.GetByIdAsync(matchId);
        if (match == null)
        {
            throw new InvalidOperationException("Match not found");
        }

        if (match.ProviderId != providerId)
        {
            throw new UnauthorizedAccessException("You can only decline your own matches");
        }

        if (match.Status != MatchStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot decline a match that is {match.Status}");
        }

        match.Status = MatchStatus.Declined;
        match.RespondedAt = DateTime.UtcNow;
        await _matchRepository.UpdateAsync(match, match.Id, match.JobId);

        return match;
    }

    private MatchScores CalculateScores(Job job, Provider provider, double distance)
    {
        // Skill score: overlapping categories / required categories
        var matchingCategories = job.SkillCategories
            .Intersect(provider.SkillCategories).Count();
        var skillScore = job.SkillCategories.Count > 0
            ? (double)matchingCategories / job.SkillCategories.Count
            : 0;

        // Distance score: closer is better (1.0 at 0km, 0.0 at max radius)
        var distanceScore = Math.Max(0, 1.0 - (distance / MaxRadiusKm));

        // Rating score: normalized to 0-1 (default to 0.5 for new providers)
        var ratingScore = provider.TotalRatings > 0 ? provider.Rating / 5.0 : 0.5;

        // Availability score: 1 if available, 0 if not
        var availabilityScore = CheckAvailability(provider.Availability, job) ? 1.0 : 0.5;

        return new MatchScores(skillScore, distanceScore, ratingScore, availabilityScore);
    }

    private double CalculateTotalScore(MatchScores scores)
    {
        return (scores.Skill * SkillWeight) +
               (scores.Distance * DistanceWeight) +
               (scores.Rating * RatingWeight) +
               (scores.Availability * AvailabilityWeight);
    }

    private bool CheckAvailability(Availability availability, Job job)
    {
        if (availability == null || !job.ScheduledDate.HasValue)
            return true; // Assume available if no schedule specified

        var slot = availability.GetSlotForDay(job.ScheduledDate.Value.DayOfWeek);
        if (slot == null || !slot.Available)
            return false;

        // If scheduled time is provided, check if it falls within the slot
        if (!string.IsNullOrEmpty(job.ScheduledTime) && TimeSpan.TryParse(job.ScheduledTime, out var scheduledTime))
        {
            if (TimeSpan.TryParse(slot.Start, out var slotStart) &&
                TimeSpan.TryParse(slot.End, out var slotEnd))
            {
                return scheduledTime >= slotStart && scheduledTime <= slotEnd;
            }
        }

        return true;
    }

    private record MatchScores(double Skill, double Distance, double Rating, double Availability);
}
