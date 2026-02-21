using HanaServe.Core.Repositories;
using HanaServe.Core.Services;
using HanaServe.Core.Utils;
using HanaServe.Data;
using HanaServe.Data.Repositories;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureAppConfiguration((context, config) =>
    {
        config.AddJsonFile("local.settings.json", optional: true, reloadOnChange: true);
        config.AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Configuration
        var configuration = context.Configuration;

        // Register CosmosDbContext
        services.AddSingleton<CosmosDbContext>();

        // Register Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProviderRepository, ProviderRepository>();
        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IMatchRepository, MatchRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        // Register Utils
        services.AddSingleton<JwtHelper>();

        // Register Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProviderService, ProviderService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IMatchingService, MatchingService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ISkillService, SkillService>();
    })
    .Build();

host.Run();
