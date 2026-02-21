using HanaServe.Core.Models;
using HanaServe.Core.Repositories;

namespace HanaServe.Data.Repositories;

public class NotificationRepository : CosmosRepository<Notification>, INotificationRepository
{
    public NotificationRepository(CosmosDbContext context) : base(context.Notifications)
    {
    }

    public new async Task<Notification> CreateAsync(Notification notification, string partitionKey)
    {
        return await base.CreateAsync(notification, partitionKey);
    }

    public async Task<List<Notification>> GetByUserIdAsync(string userId, int limit = 50)
    {
        var query = $"SELECT TOP {limit} * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC";
        var parameters = new Dictionary<string, object> { { "@userId", userId } };
        return await QueryWithPartitionAsync(query, userId, parameters);
    }

    public async Task<List<Notification>> GetUnreadByUserIdAsync(string userId)
    {
        var query = "SELECT * FROM c WHERE c.userId = @userId AND c.isRead = false ORDER BY c.createdAt DESC";
        var parameters = new Dictionary<string, object> { { "@userId", userId } };
        return await QueryWithPartitionAsync(query, userId, parameters);
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var query = "SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId AND c.isRead = false";
        var parameters = new Dictionary<string, object> { { "@userId", userId } };

        var queryDefinition = new Microsoft.Azure.Cosmos.QueryDefinition(query)
            .WithParameter("@userId", userId);

        var queryOptions = new Microsoft.Azure.Cosmos.QueryRequestOptions
        {
            PartitionKey = new Microsoft.Azure.Cosmos.PartitionKey(userId)
        };

        using var iterator = _container.GetItemQueryIterator<int>(queryDefinition, requestOptions: queryOptions);

        if (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            return response.FirstOrDefault();
        }

        return 0;
    }

    public async Task MarkAsReadAsync(string id, string userId)
    {
        var notification = await GetByIdAsync(id, userId);
        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await UpdateAsync(notification, id, userId);
        }
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var unread = await GetUnreadByUserIdAsync(userId);
        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await UpdateAsync(notification, notification.Id, userId);
        }
    }
}
