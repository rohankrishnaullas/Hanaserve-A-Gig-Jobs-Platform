using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace HanaServe.Data;

public class CosmosDbContext : IDisposable
{
    private readonly CosmosClient _client;
    private readonly Database _database;
    private bool _disposed;

    public Container Users { get; }
    public Container Providers { get; }
    public Container Jobs { get; }
    public Container Matches { get; }
    public Container Notifications { get; }

    public CosmosDbContext(IConfiguration configuration)
    {
        var connectionString = configuration["CosmosDb:ConnectionString"]
            ?? throw new ArgumentNullException("CosmosDb:ConnectionString is not configured");
        var databaseName = configuration["CosmosDb:DatabaseName"] ?? "hanaserve";

        var options = new CosmosClientOptions
        {
            SerializerOptions = new CosmosSerializationOptions
            {
                PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
            }
        };

        _client = new CosmosClient(connectionString, options);
        _database = _client.GetDatabase(databaseName);

        Users = _database.GetContainer("Users");
        Providers = _database.GetContainer("Providers");
        Jobs = _database.GetContainer("Jobs");
        Matches = _database.GetContainer("Matches");
        Notifications = _database.GetContainer("Notifications");
    }

    public async Task InitializeDatabaseAsync()
    {
        await _client.CreateDatabaseIfNotExistsAsync("HanaServeDb");

        // Users container - partition by id
        await _database.CreateContainerIfNotExistsAsync(new ContainerProperties
        {
            Id = "Users",
            PartitionKeyPath = "/id"
        });

        // Providers container - partition by userId, with geospatial index
        var providersProperties = new ContainerProperties
        {
            Id = "Providers",
            PartitionKeyPath = "/userId"
        };
        providersProperties.IndexingPolicy.SpatialIndexes.Add(
            new SpatialPath { Path = "/location/*" }
        );
        await _database.CreateContainerIfNotExistsAsync(providersProperties);

        // Jobs container - partition by requesterId, with geospatial index
        var jobsProperties = new ContainerProperties
        {
            Id = "Jobs",
            PartitionKeyPath = "/requesterId"
        };
        jobsProperties.IndexingPolicy.SpatialIndexes.Add(
            new SpatialPath { Path = "/location/*" }
        );
        await _database.CreateContainerIfNotExistsAsync(jobsProperties);

        // Matches container - partition by jobId
        await _database.CreateContainerIfNotExistsAsync(new ContainerProperties
        {
            Id = "Matches",
            PartitionKeyPath = "/jobId"
        });

        // Notifications container - partition by userId
        await _database.CreateContainerIfNotExistsAsync(new ContainerProperties
        {
            Id = "Notifications",
            PartitionKeyPath = "/userId"
        });
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _client?.Dispose();
            _disposed = true;
        }
    }
}
