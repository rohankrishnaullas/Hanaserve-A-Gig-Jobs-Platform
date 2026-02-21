using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;
using HanaServe.Core.Repositories;

namespace HanaServe.Data.Repositories;

public class JobRepository : CosmosRepository<Job>, IJobRepository
{
    public JobRepository(CosmosDbContext context) : base(context.Jobs)
    {
    }

    public async Task<Job?> GetByIdAsync(string id)
    {
        var query = "SELECT * FROM c WHERE c.id = @id";
        var parameters = new Dictionary<string, object> { { "@id", id } };
        var results = await QueryAsync(query, parameters);
        return results.FirstOrDefault();
    }

    public async Task<Job> CreateAsync(Job job)
    {
        return await CreateAsync(job, job.RequesterId);
    }

    public async Task<Job> UpdateAsync(Job job)
    {
        return await UpdateAsync(job, job.Id, job.RequesterId);
    }

    public async Task<List<Job>> GetByRequesterIdAsync(string requesterId)
    {
        var query = "SELECT * FROM c WHERE c.requesterId = @requesterId ORDER BY c.createdAt DESC";
        var parameters = new Dictionary<string, object> { { "@requesterId", requesterId } };
        return await QueryWithPartitionAsync(query, requesterId, parameters);
    }

    public async Task<List<Job>> GetOpenJobsAsync()
    {
        var query = "SELECT * FROM c WHERE c.status = 'Open' ORDER BY c.createdAt DESC";
        return await QueryAsync(query);
    }

    public async Task<(List<Job> Items, int Total)> GetFilteredJobsAsync(JobFilterRequest filter)
    {
        var conditions = new List<string> { "1=1" };
        var parameters = new Dictionary<string, object>();

        if (filter.Status.HasValue)
        {
            conditions.Add("c.status = @status");
            parameters["@status"] = filter.Status.Value.ToString();
        }

        if (filter.FromDate.HasValue)
        {
            conditions.Add("c.createdAt >= @fromDate");
            parameters["@fromDate"] = filter.FromDate.Value;
        }

        if (filter.ToDate.HasValue)
        {
            conditions.Add("c.createdAt <= @toDate");
            parameters["@toDate"] = filter.ToDate.Value;
        }

        if (filter.Latitude.HasValue && filter.Longitude.HasValue && filter.RadiusKm.HasValue)
        {
            conditions.Add("ST_DISTANCE(c.location, {'type': 'Point', 'coordinates': [@lon, @lat]}) < @radius");
            parameters["@lon"] = filter.Longitude.Value;
            parameters["@lat"] = filter.Latitude.Value;
            parameters["@radius"] = filter.RadiusKm.Value * 1000;
        }

        var whereClause = string.Join(" AND ", conditions);
        var dataQuery = $"SELECT * FROM c WHERE {whereClause} ORDER BY c.createdAt DESC";

        var allResults = await QueryAsync(dataQuery, parameters);

        // Apply skill category filter in memory if needed
        if (filter.SkillCategories?.Any() == true)
        {
            allResults = allResults
                .Where(j => j.SkillCategories.Intersect(filter.SkillCategories).Any())
                .ToList();
        }

        var total = allResults.Count;
        var skip = (filter.Page - 1) * filter.PageSize;
        var items = allResults.Skip(skip).Take(filter.PageSize).ToList();

        return (items, total);
    }
}
