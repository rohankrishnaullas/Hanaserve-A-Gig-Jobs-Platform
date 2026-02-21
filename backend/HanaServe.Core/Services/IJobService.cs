using HanaServe.Core.DTOs;
using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;

namespace HanaServe.Core.Services;

public interface IJobService
{
    Task<Job> CreateJobAsync(string requesterId, CreateJobRequest request);
    Task<Job?> GetJobByIdAsync(string id);
    Task<List<Job>> GetJobsByRequesterIdAsync(string requesterId);
    Task<PaginatedResponse<JobResponse>> GetFilteredJobsAsync(JobFilterRequest filter);
    Task<Job> CancelJobAsync(string jobId, string requesterId, string? reason);
    Task<Job> CompleteJobAsync(string jobId, string requesterId);
    Task<Job> AssignProviderAsync(string jobId, string providerId, string providerName);
}
