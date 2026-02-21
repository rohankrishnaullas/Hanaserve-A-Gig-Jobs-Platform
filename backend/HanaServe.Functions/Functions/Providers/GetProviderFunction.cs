using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Providers;

public class GetProviderFunction
{
    private readonly IProviderService _providerService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<GetProviderFunction> _logger;

    public GetProviderFunction(
        IProviderService providerService,
        JwtHelper jwtHelper,
        ILogger<GetProviderFunction> logger)
    {
        _providerService = providerService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("GetProvider")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "providers/{id}")]
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

            var provider = await _providerService.GetProviderByIdAsync(id);
            if (provider == null)
            {
                return await AuthMiddleware.CreateNotFoundResponse(req, "Provider not found");
            }

            var response = ProviderResponse.FromProvider(provider);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting provider {ProviderId}", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }

    [Function("GetMyProvider")]
    public async Task<HttpResponseData> GetMyProvider(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "providers/me")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            var provider = await _providerService.GetProviderByUserIdAsync(userId);
            if (provider == null)
            {
                return await AuthMiddleware.CreateNotFoundResponse(req, "Provider profile not found. Please create a provider profile first.");
            }

            var response = ProviderResponse.FromProvider(provider);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user's provider profile");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
