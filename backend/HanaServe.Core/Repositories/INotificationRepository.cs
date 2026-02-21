using HanaServe.Core.Models;

namespace HanaServe.Core.Repositories;

public interface INotificationRepository
{
    Task<Notification> CreateAsync(Notification entity, string partitionKey);
    Task<List<Notification>> GetByUserIdAsync(string userId, int limit = 50);
    Task<List<Notification>> GetUnreadByUserIdAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task MarkAsReadAsync(string id, string userId);
    Task MarkAllAsReadAsync(string userId);
}
