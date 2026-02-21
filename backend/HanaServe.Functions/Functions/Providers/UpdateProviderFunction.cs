using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Providers;

public class UpdateProviderFunction
{
    private readonly IProviderService _providerService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<UpdateProviderFunction> _logger;

    public UpdateProviderFunction(
        IProviderService providerService,
        JwtHelper jwtHelper,
        ILogger<UpdateProviderFunction> logger)
    {
        _providerService = providerService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("UpdateProvider")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "providers/{id}")]
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
            var existingProvider = await _providerService.GetProviderByIdAsync(id);
            if (existingProvider == null)
            {
                return await AuthMiddleware.CreateNotFoundResponse(req, "Provider not found");
            }

            if (existingProvider.UserId != userId)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "You can only update your own provider profile");
            }

            var request = await req.ReadFromJsonAsync<UpdateProviderRequest>();
            if (request == null)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Invalid request body");
            }

            var provider = await _providerService.UpdateProviderAsync(userId, request);
            var response = ProviderResponse.FromProvider(provider);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Provider update failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating provider {ProviderId}", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
