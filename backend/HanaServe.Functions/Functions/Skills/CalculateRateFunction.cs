using System.Text.Json.Serialization;
using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Skills;

public class CalculateRateFunction
{
    private readonly ISkillService _skillService;
    private readonly ILogger<CalculateRateFunction> _logger;

    public CalculateRateFunction(
        ISkillService skillService,
        ILogger<CalculateRateFunction> logger)
    {
        _skillService = skillService;
        _logger = logger;
    }

    [Function("CalculateRate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rates/calculate")]
        HttpRequestData req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<CalculateRateRequest>();
            if (request == null || request.SkillCategories == null || !request.SkillCategories.Any())
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "At least one skill category is required");
            }

            var suggestedRate = _skillService.CalculateSuggestedRate(
                request.SkillCategories,
                request.CompletedJobs,
                request.Rating
            );

            var response = new CalculateRateResponse
            {
                SuggestedRate = suggestedRate,
                Currency = "INR",
                Period = "hourly"
            };

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating rate");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }

    private class CalculateRateRequest
    {
        [JsonPropertyName("skillCategories")]
        public List<string> SkillCategories { get; set; } = new();

        [JsonPropertyName("completedJobs")]
        public int CompletedJobs { get; set; }

        [JsonPropertyName("rating")]
        public double Rating { get; set; }
    }

    private class CalculateRateResponse
    {
        [JsonPropertyName("suggestedRate")]
        public decimal SuggestedRate { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = "INR";

        [JsonPropertyName("period")]
        public string Period { get; set; } = "hourly";
    }
}
