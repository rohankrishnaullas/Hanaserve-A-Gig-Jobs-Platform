using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Notifications;

public class MarkReadFunction
{
    private readonly INotificationService _notificationService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<MarkReadFunction> _logger;

    public MarkReadFunction(
        INotificationService notificationService,
        JwtHelper jwtHelper,
        ILogger<MarkReadFunction> logger)
    {
        _notificationService = notificationService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("MarkNotificationRead")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "notifications/{id}/read")]
        HttpRequestData req,
        string id)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            await _notificationService.MarkAsReadAsync(id, userId);

            return await AuthMiddleware.CreateSuccessResponse(req, new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification {NotificationId} as read", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }

    [Function("MarkAllNotificationsRead")]
    public async Task<HttpResponseData> MarkAllRead(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "notifications/read-all")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            await _notificationService.MarkAllAsReadAsync(userId);

            return await AuthMiddleware.CreateSuccessResponse(req, new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
