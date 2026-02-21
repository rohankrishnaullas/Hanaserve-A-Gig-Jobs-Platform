using HanaServe.Core.Models;
using HanaServe.Core.Repositories;

namespace HanaServe.Core.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IProviderRepository _providerRepository;

    public NotificationService(
        INotificationRepository notificationRepository,
        IProviderRepository providerRepository)
    {
        _notificationRepository = notificationRepository;
        _providerRepository = providerRepository;
    }

    public async Task<Notification> CreateNotificationAsync(
        string userId,
        NotificationType type,
        string title,
        string message,
        Dictionary<string, object>? data = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            Data = data
        };

        return await _notificationRepository.CreateAsync(notification, userId);
    }

    public async Task NotifyProvidersAboutMatchesAsync(List<Match> matches)
    {
        foreach (var match in matches)
        {
            var provider = await _providerRepository.GetByIdAsync(match.ProviderId);
            if (provider == null) continue;

            await CreateNotificationAsync(
                provider.UserId,
                NotificationType.NewJobMatch,
                "New Job Match!",
                $"You have a new job match: {match.JobTitle}. Match score: {match.MatchScore:P0}",
                new Dictionary<string, object>
                {
                    ["matchId"] = match.Id,
                    ["jobId"] = match.JobId,
                    ["jobTitle"] = match.JobTitle,
                    ["matchScore"] = match.MatchScore,
                    ["distance"] = match.Distance
                }
            );
        }
    }

    public async Task NotifyRequesterAboutMatchAcceptedAsync(Match match)
    {
        await CreateNotificationAsync(
            match.RequesterId,
            NotificationType.MatchAccepted,
            "Provider Accepted!",
            $"{match.ProviderName} has accepted your job: {match.JobTitle}",
            new Dictionary<string, object>
            {
                ["matchId"] = match.Id,
                ["jobId"] = match.JobId,
                ["providerId"] = match.ProviderId,
                ["providerName"] = match.ProviderName
            }
        );
    }

    public async Task<List<Notification>> GetNotificationsAsync(string userId, int limit = 50)
    {
        return await _notificationRepository.GetByUserIdAsync(userId, limit);
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId);
    }

    public async Task MarkAsReadAsync(string notificationId, string userId)
    {
        await _notificationRepository.MarkAsReadAsync(notificationId, userId);
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
    }
}
