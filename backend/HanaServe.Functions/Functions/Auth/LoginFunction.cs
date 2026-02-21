using HanaServe.Core.DTOs.Auth;
using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Auth;

public class LoginFunction
{
    private readonly IAuthService _authService;
    private readonly ILogger<LoginFunction> _logger;

    public LoginFunction(IAuthService authService, ILogger<LoginFunction> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [Function("Login")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/login")]
        HttpRequestData req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<LoginRequest>();
            if (request == null)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Invalid request body");
            }

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Email and password are required");
            }

            var result = await _authService.LoginAsync(request);

            return await AuthMiddleware.CreateSuccessResponse(req, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Login failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
