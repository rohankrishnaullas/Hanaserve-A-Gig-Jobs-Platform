using System.Net;
using HanaServe.Core.DTOs.Auth;
using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Auth;

public class RegisterFunction
{
    private readonly IAuthService _authService;
    private readonly ILogger<RegisterFunction> _logger;

    public RegisterFunction(IAuthService authService, ILogger<RegisterFunction> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [Function("Register")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/register")]
        HttpRequestData req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<RegisterRequest>();
            if (request == null)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Invalid request body");
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Email is required");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Password is required");
            }

            if (request.Password.Length < 6)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Password must be at least 6 characters");
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Name is required");
            }

            var result = await _authService.RegisterAsync(request);

            return await AuthMiddleware.CreateSuccessResponse(req, result, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Registration failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
