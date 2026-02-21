using System.Net;
using HanaServe.Core.DTOs.Provider;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Providers;

public class CreateProviderFunction
{
    private readonly IProviderService _providerService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<CreateProviderFunction> _logger;

    public CreateProviderFunction(
        IProviderService providerService,
        JwtHelper jwtHelper,
        ILogger<CreateProviderFunction> logger)
    {
        _providerService = providerService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("CreateProvider")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "providers")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            var request = await req.ReadFromJsonAsync<CreateProviderRequest>();
            if (request == null)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Invalid request body");
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Name is required");
            }

            if (request.Skills == null || !request.Skills.Any())
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "At least one skill is required");
            }

            if (string.IsNullOrWhiteSpace(request.City))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "City is required");
            }

            var provider = await _providerService.CreateProviderAsync(userId, request);
            var response = ProviderResponse.FromProvider(provider);

            return await AuthMiddleware.CreateSuccessResponse(req, response, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Provider creation failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating provider");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
