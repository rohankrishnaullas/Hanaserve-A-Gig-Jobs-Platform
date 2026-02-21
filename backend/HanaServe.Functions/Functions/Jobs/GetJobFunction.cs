using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Jobs;

public class GetJobFunction
{
    private readonly IJobService _jobService;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<GetJobFunction> _logger;

    public GetJobFunction(
        IJobService jobService,
        JwtHelper jwtHelper,
        ILogger<GetJobFunction> logger)
    {
        _jobService = jobService;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    [Function("GetJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jobs/{id}")]
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

            var job = await _jobService.GetJobByIdAsync(id);
            if (job == null)
            {
                return await AuthMiddleware.CreateNotFoundResponse(req, "Job not found");
            }

            var response = JobResponse.FromJob(job);

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting job {JobId}", id);
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
