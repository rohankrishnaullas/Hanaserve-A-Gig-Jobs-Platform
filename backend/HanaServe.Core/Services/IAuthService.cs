using HanaServe.Core.DTOs.Auth;

namespace HanaServe.Core.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> GoogleAuthAsync(GoogleAuthRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task<bool> ValidateTokenAsync(string token);
    string? GetUserIdFromToken(string token);
}
