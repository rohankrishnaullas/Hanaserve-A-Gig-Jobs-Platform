using Microsoft.Azure.Cosmos;

namespace HanaServe.Data.Repositories;

public abstract class CosmosRepository<T> where T : class
{
    protected readonly Container _container;

    protected CosmosRepository(Container container)
    {
        _container = container;
    }

    public virtual async Task<T?> GetByIdAsync(string id, string partitionKey)
    {
        try
        {
            var response = await _container.ReadItemAsync<T>(id, new PartitionKey(partitionKey));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public virtual async Task<T> CreateAsync(T entity, string partitionKey)
    {
        var response = await _container.CreateItemAsync(entity, new PartitionKey(partitionKey));
        return response.Resource;
    }

    public virtual async Task<T> UpdateAsync(T entity, string id, string partitionKey)
    {
        var response = await _container.ReplaceItemAsync(entity, id, new PartitionKey(partitionKey));
        return response.Resource;
    }

    public virtual async Task DeleteAsync(string id, string partitionKey)
    {
        await _container.DeleteItemAsync<T>(id, new PartitionKey(partitionKey));
    }

    public virtual async Task<List<T>> QueryAsync(string query, Dictionary<string, object>? parameters = null)
    {
        var queryDefinition = new QueryDefinition(query);

        if (parameters != null)
        {
            foreach (var (key, value) in parameters)
            {
                queryDefinition = queryDefinition.WithParameter(key, value);
            }
        }

        var results = new List<T>();
        using var iterator = _container.GetItemQueryIterator<T>(queryDefinition);

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    protected async Task<List<T>> QueryWithPartitionAsync(string query, string partitionKey, Dictionary<string, object>? parameters = null)
    {
        var queryDefinition = new QueryDefinition(query);

        if (parameters != null)
        {
            foreach (var (key, value) in parameters)
            {
                queryDefinition = queryDefinition.WithParameter(key, value);
            }
        }

        var queryOptions = new QueryRequestOptions
        {
            PartitionKey = new PartitionKey(partitionKey)
        };

        var results = new List<T>();
        using var iterator = _container.GetItemQueryIterator<T>(queryDefinition, requestOptions: queryOptions);

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }
}
