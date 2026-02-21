using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Providers;

public class AcceptMatchFunction
{
    private readonly IMatchingService _matchingService;
    private readonly IProviderService _providerService;
    private readonly INotificationService _notificationService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<AcceptMatchFunction> _logger;

    public AcceptMatchFunction(
        IMatchingService matchingService,
        IProviderService providerService,
        INotificationService notificationService,
        JwtHelper jwtHelper,
        ILogger<AcceptMatchFunction> logger)
    {
        _matchingService = matchingService;
        _providerService = providerService;
        _notificationService = notificationService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("AcceptMatch")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "providers/{providerId}/accept-match/{matchId}")]
        HttpRequestData req,
        string providerId,
        string matchId)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            // Verify the provider belongs to this user
            var provider = await _providerService.GetProviderByIdAsync(providerId);
            if (provider == null)
            {
                return await AuthMiddleware.CreateNotFoundResponse(req, "Provider not found");
            }

            if (provider.UserId != userId)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "You can only accept your own matches");
            }

            var match = await _matchingService.AcceptMatchAsync(matchId, providerId);

            // Notify the requester
            await _notificationService.NotifyRequesterAboutMatchAcceptedAsync(match);

            var response = MatchResponse.FromMatch(match);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Accept match failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized accept match attempt");
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting match {MatchId}", matchId);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
