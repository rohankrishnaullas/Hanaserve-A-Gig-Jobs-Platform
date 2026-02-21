using System.Text.Json.Serialization;
using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Jobs;

public class CancelJobFunction
{
    private readonly IJobService _jobService;
    private readonly INotificationService _notificationService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<CancelJobFunction> _logger;

    public CancelJobFunction(
        IJobService jobService,
        INotificationService notificationService,
        JwtHelper jwtHelper,
        ILogger<CancelJobFunction> logger)
    {
        _jobService = jobService;
        _notificationService = notificationService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("CancelJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "jobs/{id}/cancel")]
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

            var body = await req.ReadFromJsonAsync<CancelJobRequest>();
            var reason = body?.Reason;

            var job = await _jobService.CancelJobAsync(id, userId, reason);

            // Notify assigned provider if there was one
            if (!string.IsNullOrEmpty(job.AssignedProviderId))
            {
                await _notificationService.CreateNotificationAsync(
                    job.AssignedProviderId,
                    NotificationType.JobCancelled,
                    "Job Cancelled",
                    $"The job '{job.Title}' has been cancelled by the requester.",
                    new Dictionary<string, object>
                    {
                        ["jobId"] = job.Id,
                        ["jobTitle"] = job.Title,
                        ["reason"] = reason ?? "No reason provided"
                    }
                );
            }

            var response = JobResponse.FromJob(job);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cancel job failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized cancel job attempt");
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling job {JobId}", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }

    private class CancelJobRequest
    {
        [JsonPropertyName("reason")]
        public string? Reason { get; set; }
    }
}
