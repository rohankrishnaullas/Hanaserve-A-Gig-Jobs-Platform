using System.Text.Json.Serialization;
using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Skills;

public class ExtractSkillsFunction
{
    private readonly ISkillService _skillService;
    private readonly ILogger<ExtractSkillsFunction> _logger;

    public ExtractSkillsFunction(
        ISkillService skillService,
        ILogger<ExtractSkillsFunction> logger)
    {
        _skillService = skillService;
        _logger = logger;
    }

    [Function("ExtractSkills")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "skills/extract")]
        HttpRequestData req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<ExtractSkillsRequest>();
            if (request == null || string.IsNullOrWhiteSpace(request.Text))
            {
                return await AuthMiddleware.CreateBadRequestResponse(req, "Text is required");
            }

            var skills = _skillService.ExtractSkillsFromText(request.Text);
            var categories = _skillService.ExtractCategoriesFromText(request.Text);

            var response = new ExtractSkillsResponse
            {
                Skills = skills,
                Categories = categories
            };

            return await AuthMiddleware.CreateSuccessResponse(req, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting skills");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }

    private class ExtractSkillsRequest
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }

    private class ExtractSkillsResponse
    {
        [JsonPropertyName("skills")]
        public List<string> Skills { get; set; } = new();

        [JsonPropertyName("categories")]
        public List<string> Categories { get; set; } = new();
    }
}
