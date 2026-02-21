using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Notifications;

public class GetNotificationsFunction
{
    private readonly INotificationService _notificationService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<GetNotificationsFunction> _logger;

    public GetNotificationsFunction(
        INotificationService notificationService,
        JwtHelper jwtHelper,
        ILogger<GetNotificationsFunction> logger)
    {
        _notificationService = notificationService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("GetNotifications")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "notifications")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var limit = int.TryParse(queryParams["limit"], out var l) ? Math.Min(l, 100) : 50;

            var notifications = await _notificationService.GetNotificationsAsync(userId, limit);
            var unreadCount = await _notificationService.GetUnreadCountAsync(userId);

            var response = new
            {
                notifications,
                unreadCount
            };

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
