using HanaServe.Core.DTOs.Auth;
using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Auth;

public class RefreshTokenFunction
{
    private readonly IAuthService _authService;
    private readonly ILogger<RefreshTokenFunction> _logger;

    public RefreshTokenFunction(IAuthService authService, ILogger<RefreshTokenFunction> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [Function("RefreshToken")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/refresh")]
        HttpRequestData req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<RefreshTokenRequest>();
            if (request == null || string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Refresh token is required");
            }

            var result = await _authService.RefreshTokenAsync(request);

            return await AuthMiddleware.CreateSuccessResponse(req, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Token refresh failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
