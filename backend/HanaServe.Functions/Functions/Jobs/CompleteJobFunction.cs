using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Jobs;

public class CompleteJobFunction
{
    private readonly IJobService _jobService;
    private readonly INotificationService _notificationService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<CompleteJobFunction> _logger;

    public CompleteJobFunction(
        IJobService jobService,
        INotificationService notificationService,
        JwtHelper jwtHelper,
        ILogger<CompleteJobFunction> logger)
    {
        _jobService = jobService;
        _notificationService = notificationService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("CompleteJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "jobs/{id}/complete")]
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

            var job = await _jobService.CompleteJobAsync(id, userId);

            // Notify the provider about completion
            if (!string.IsNullOrEmpty(job.AssignedProviderId))
            {
                await _notificationService.CreateNotificationAsync(
                    job.AssignedProviderId,
                    NotificationType.JobCompleted,
                    "Job Completed!",
                    $"The job '{job.Title}' has been marked as completed.",
                    new Dictionary<string, object>
                    {
                        ["jobId"] = job.Id,
                        ["jobTitle"] = job.Title
                    }
                );
            }

            var response = JobResponse.FromJob(job);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Complete job failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized complete job attempt");
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing job {JobId}", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
