using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Jobs;

public class ListJobsFunction
{
    private readonly IJobService _jobService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<ListJobsFunction> _logger;

    public ListJobsFunction(
        IJobService jobService,
        JwtHelper jwtHelper,
        ILogger<ListJobsFunction> logger)
    {
        _jobService = jobService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("ListJobs")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jobs")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            // Parse query parameters
            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);

            var filter = new JobFilterRequest
            {
                Page = int.TryParse(queryParams["page"], out var page) ? page : 1,
                PageSize = int.TryParse(queryParams["pageSize"], out var pageSize) ? Math.Min(pageSize, 100) : 20
            };

            // Optional filters
            if (Enum.TryParse<JobStatus>(queryParams["status"], true, out var status))
            {
                filter.Status = status;
            }

            if (double.TryParse(queryParams["latitude"], out var lat) &&
                double.TryParse(queryParams["longitude"], out var lon))
            {
                filter.Latitude = lat;
                filter.Longitude = lon;
                filter.RadiusKm = double.TryParse(queryParams["radiusKm"], out var radius) ? radius : 10;
            }

            var skillCategories = queryParams["skillCategories"];
            if (!string.IsNullOrEmpty(skillCategories))
            {
                filter.SkillCategories = skillCategories.Split(',').ToList();
            }

            var response = await _jobService.GetFilteredJobsAsync(filter);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing jobs");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }

    [Function("GetMyJobs")]
    public async Task<HttpResponseData> GetMyJobs(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jobs/my")]
        HttpRequestData req)
    {
        try
        {
            var userId = AuthMiddleware.GetUserIdFromRequest(req, _jwtHelper);
            if (userId == null)
            {
                return await AuthMiddleware.CreateUnauthorizedResponse(req);
            }

            var jobs = await _jobService.GetJobsByRequesterIdAsync(userId);
            var response = jobs.Select(JobResponse.FromJob).ToList();

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user's jobs");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
