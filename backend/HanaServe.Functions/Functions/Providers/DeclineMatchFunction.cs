using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Providers;

public class DeclineMatchFunction
{
    private readonly IMatchingService _matchingService;
    private readonly IProviderService _providerService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<DeclineMatchFunction> _logger;

    public DeclineMatchFunction(
        IMatchingService matchingService,
        IProviderService providerService,
        JwtHelper jwtHelper,
        ILogger<DeclineMatchFunction> logger)
    {
        _matchingService = matchingService;
        _providerService = providerService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("DeclineMatch")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "providers/{providerId}/decline-match/{matchId}")]
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
                return await AuthMiddleware.CreateBadRequestResponse(req, "You can only decline your own matches");
            }

            var match = await _matchingService.DeclineMatchAsync(matchId, providerId);
            var response = MatchResponse.FromMatch(match);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Decline match failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized decline match attempt");
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error declining match {MatchId}", matchId);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
