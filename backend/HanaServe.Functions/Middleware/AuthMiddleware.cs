using System.Net;
using HanaServe.Core.Utils;
using Microsoft.Azure.Functions.Worker.Http;

namespace HanaServe.Functions.Middleware;

public static class AuthMiddleware
{
    public static string? GetUserIdFromRequest(HttpRequestData req, JwtHelper jwtHelper)
    {
        if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            return null;

        var authHeader = authHeaders.FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return null;

        var token = authHeader.Substring("Bearer ".Length);
        return jwtHelper.GetUserIdFromToken(token);
    }

    public static async Task<HttpResponseData> CreateUnauthorizedResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.Unauthorized);
        await response.WriteAsJsonAsync(new
        {
            success = false,
            message = "Unauthorized. Please provide a valid authentication token."
        });
        return response;
    }

    public static async Task<HttpResponseData> CreateBadRequestResponse(HttpRequestData req, string message)
    {
        var response = req.CreateResponse(HttpStatusCode.BadRequest);
        await response.WriteAsJsonAsync(new
        {
            success = false,
            message = message
        });
        return response;
    }

    public static async Task<HttpResponseData> CreateNotFoundResponse(HttpRequestData req, string message)
    {
        var response = req.CreateResponse(HttpStatusCode.NotFound);
        await response.WriteAsJsonAsync(new
        {
            success = false,
            message = message
        });
        return response;
    }

    public static async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, Exception ex)
    {
        var response = req.CreateResponse(HttpStatusCode.InternalServerError);
        await response.WriteAsJsonAsync(new
        {
            success = false,
            message = ex.Message
        });
        return response;
    }

    public static async Task<HttpResponseData> CreateSuccessResponse<T>(HttpRequestData req, T data, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new
        {
            success = true,
            data = data
        });
        return response;
    }
}
