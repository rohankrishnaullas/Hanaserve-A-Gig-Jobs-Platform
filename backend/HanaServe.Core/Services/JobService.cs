using HanaServe.Core.DTOs;
using HanaServe.Core.DTOs.Job;
using HanaServe.Core.Models;
using HanaServe.Core.Utils;
using HanaServe.Core.Repositories;

namespace HanaServe.Core.Services;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepository;
    private readonly IUserRepository _userRepository;

    public JobService(
        IJobRepository jobRepository,
        IUserRepository userRepository)
    {
        _jobRepository = jobRepository;
        _userRepository = userRepository;
    }

    public async Task<Job> CreateJobAsync(string requesterId, CreateJobRequest request)
    {
        var user = await _userRepository.GetByIdAsync(requesterId, requesterId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Extract skill categories from title and description
        var textToAnalyze = $"{request.Title} {request.Description}";
        var skillCategories = SkillCategories.ExtractCategories(textToAnalyze);

        // Also add any explicit skills
        if (request.Skills?.Any() == true)
        {
            var additionalCategories = SkillCategories.MapSkillsToCategories(request.Skills);
            skillCategories = skillCategories.Union(additionalCategories).ToList();
        }

        var job = new Job
        {
            RequesterId = requesterId,
            RequesterName = user.Name,
            Title = request.Title,
            Description = request.Description,
            Skills = request.Skills ?? new List<string>(),
            SkillCategories = skillCategories,
            Location = new GeoPoint(request.Longitude, request.Latitude),
            Address = request.Address,
            City = request.City,
            ScheduledDate = request.ScheduledDate,
            ScheduledTime = request.ScheduledTime,
            EstimatedDuration = request.EstimatedDuration ?? 60,
            Budget = request.Budget,
            Status = JobStatus.Open
        };

        return await _jobRepository.CreateAsync(job);
    }

    public async Task<Job?> GetJobByIdAsync(string id)
    {
        return await _jobRepository.GetByIdAsync(id);
    }

    public async Task<List<Job>> GetJobsByRequesterIdAsync(string requesterId)
    {
        return await _jobRepository.GetByRequesterIdAsync(requesterId);
    }

    public async Task<PaginatedResponse<JobResponse>> GetFilteredJobsAsync(JobFilterRequest filter)
    {
        var (items, total) = await _jobRepository.GetFilteredJobsAsync(filter);

        return new PaginatedResponse<JobResponse>
        {
            Items = items.Select(JobResponse.FromJob).ToList(),
            Total = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<Job> CancelJobAsync(string jobId, string requesterId, string? reason)
    {
        var job = await _jobRepository.GetByIdAsync(jobId);
        if (job == null)
        {
            throw new InvalidOperationException("Job not found");
        }

        if (job.RequesterId != requesterId)
        {
            throw new UnauthorizedAccessException("You can only cancel your own jobs");
        }

        if (job.Status == JobStatus.Completed || job.Status == JobStatus.Cancelled)
        {
            throw new InvalidOperationException($"Cannot cancel a job that is {job.Status}");
        }

        job.Status = JobStatus.Cancelled;
        job.CancelledAt = DateTime.UtcNow;
        job.CancellationReason = reason;
        job.UpdatedAt = DateTime.UtcNow;

        return await _jobRepository.UpdateAsync(job);
    }

    public async Task<Job> CompleteJobAsync(string jobId, string requesterId)
    {
        var job = await _jobRepository.GetByIdAsync(jobId);
        if (job == null)
        {
            throw new InvalidOperationException("Job not found");
        }

        if (job.RequesterId != requesterId)
        {
            throw new UnauthorizedAccessException("You can only complete your own jobs");
        }

        if (job.Status != JobStatus.InProgress && job.Status != JobStatus.Matched)
        {
            throw new InvalidOperationException($"Cannot complete a job that is {job.Status}");
        }

        job.Status = JobStatus.Completed;
        job.CompletedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;

        return await _jobRepository.UpdateAsync(job);
    }

    public async Task<Job> AssignProviderAsync(string jobId, string providerId, string providerName)
    {
        var job = await _jobRepository.GetByIdAsync(jobId);
        if (job == null)
        {
            throw new InvalidOperationException("Job not found");
        }

        if (job.Status != JobStatus.Open && job.Status != JobStatus.Matched)
        {
            throw new InvalidOperationException($"Cannot assign provider to a job that is {job.Status}");
        }

        job.AssignedProviderId = providerId;
        job.AssignedProviderName = providerName;
        job.Status = JobStatus.InProgress;
        job.UpdatedAt = DateTime.UtcNow;

        return await _jobRepository.UpdateAsync(job);
    }
}
