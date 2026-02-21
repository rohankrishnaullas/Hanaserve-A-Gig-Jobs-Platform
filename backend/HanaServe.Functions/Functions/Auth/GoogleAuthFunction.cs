using HanaServe.Core.DTOs.Auth;
using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Auth;

public class GoogleAuthFunction
{
    private readonly IAuthService _authService;
    private readonly ILogger<GoogleAuthFunction> _logger;

    public GoogleAuthFunction(IAuthService authService, ILogger<GoogleAuthFunction> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [Function("GoogleAuth")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/google")]
        HttpRequestData req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<GoogleAuthRequest>();
            if (request == null || string.IsNullOrWhiteSpace(request.IdToken))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Google ID token is required");
            }

            var result = await _authService.GoogleAuthAsync(request);

            return await AuthMiddleware.CreateSuccessResponse(req, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Google auth failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Google authentication");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
