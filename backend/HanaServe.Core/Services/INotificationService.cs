using HanaServe.Core.Models;

namespace HanaServe.Core.Services;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(
        string userId,
        NotificationType type,
        string title,
        string message,
        Dictionary<string, object>? data = null);
    Task NotifyProvidersAboutMatchesAsync(List<Match> matches);
    Task NotifyRequesterAboutMatchAcceptedAsync(Match match);
    Task<List<Notification>> GetNotificationsAsync(string userId, int limit = 50);
    Task<int> GetUnreadCountAsync(string userId);
    Task MarkAsReadAsync(string notificationId, string userId);
    Task MarkAllAsReadAsync(string userId);
}
