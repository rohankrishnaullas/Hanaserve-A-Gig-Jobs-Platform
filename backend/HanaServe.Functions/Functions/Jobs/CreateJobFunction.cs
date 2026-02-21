using System.Net;
using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Jobs;

public class CreateJobFunction
{
    private readonly IJobService _jobService;
    private readonly IMatchingService _matchingService;
    private readonly INotificationService _notificationService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<CreateJobFunction> _logger;

    public CreateJobFunction(
        IJobService jobService,
        IMatchingService matchingService,
        INotificationService notificationService,
        JwtHelper jwtHelper,
        ILogger<CreateJobFunction> logger)
    {
        _jobService = jobService;
        _matchingService = matchingService;
        _notificationService = notificationService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("CreateJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "jobs")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            var request = await req.ReadFromJsonAsync<CreateJobRequest>();
            if (request == null)
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Invalid request body");
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Title is required");
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Description is required");
            }

            if (string.IsNullOrWhiteSpace(request.Address))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Address is required");
            }

            if (string.IsNullOrWhiteSpace(request.City))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "City is required");
            }

            // Create the job
            var job = await _jobService.CreateJobAsync(userId, request);
            var jobResponse = JobResponse.FromJob(job);

            // Find matches asynchronously (fire and forget, but log errors)
            _ = Task.Run(async () =>
            {
                try
                {
                    var matches = await _matchingService.FindMatchesForJobAsync(job);
                    if (matches.Any())
                    {
                        await _matchingService.SaveMatchesAsync(matches);
                        await _notificationService.NotifyProvidersAboutMatchesAsync(matches);
                        _logger.LogInformation("Found {MatchCount} matches for job {JobId}", matches.Count, job.Id);
                    }
                    else
                    {
                        _logger.LogInformation("No matches found for job {JobId}", job.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error finding matches for job {JobId}", job.Id);
                }
            });

            return await AuthMiddleware.CreateSuccessResponse(req, jobResponse, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Job creation failed: {Message}", ex.Message);
            return await AuthMiddleware.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating job");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
