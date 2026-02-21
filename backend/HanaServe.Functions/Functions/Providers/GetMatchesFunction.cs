using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Providers;

public class GetMatchesFunction
{
    private readonly IMatchingService _matchingService;
    private readonly IProviderService _providerService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<GetMatchesFunction> _logger;

    public GetMatchesFunction(
        IMatchingService matchingService,
        IProviderService providerService,
        JwtHelper jwtHelper,
        ILogger<GetMatchesFunction> logger)
    {
        _matchingService = matchingService;
        _providerService = providerService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("GetProviderMatches")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "providers/{id}/matches")]
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

            // Verify the provider belongs to this user
            var provider = await _providerService.GetProviderByIdAsync(id);
            if (provider == null)
            {
                return await AuthMiddleware.CreateNotFoundResponse(req, "Provider not found");
            }

            if (provider.UserId != userId)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "You can only view your own matches");
            }

            var matches = await _matchingService.GetMatchesForProviderAsync(id);
            var response = matches.Select(MatchResponse.FromMatch).ToList();

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting matches for provider {ProviderId}", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
