using HanaServe.Core.Services;
using HanaServe.Functions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace HanaServe.Functions.Functions.Skills;

public class ListSkillsFunction
{
    private readonly ISkillService _skillService;
    private readonly ILogger<ListSkillsFunction> _logger;

    public ListSkillsFunction(
        ISkillService skillService,
        ILogger<ListSkillsFunction> logger)
    {
        _skillService = skillService;
        _logger = logger;
    }

    [Function("ListSkills")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "skills")]
        HttpRequestData req)
    {
        try
        {
            var categories = _skillService.GetAllCategories();

            return await AuthMiddleware.CreateSuccessResponse(req, categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing skills");
            return await AuthMiddleware.CreateErrorResponse(req, ex);
        }
    }
}
