using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;

namespace HanaServe.Core.Repositories;

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(string id);
    Task<Job> CreateAsync(Job job);
    Task<Job> UpdateAsync(Job job);
    Task<List<Job>> GetByRequesterIdAsync(string requesterId);
    Task<List<Job>> GetOpenJobsAsync();
    Task<(List<Job> Items, int Total)> GetFilteredJobsAsync(JobFilterRequest filter);
}
