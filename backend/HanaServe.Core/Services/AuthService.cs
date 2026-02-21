using Google.Apis.Auth;
using HanaServe.Core.DTOs.Auth;
using HanaServe.Core.Models;
using HanaServe.Core.Utils;
using HanaServe.Core.Repositories;
using Microsoft.Extensions.Configuration;

namespace HanaServe.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtHelper _jwtHelper;
    private readonly string? _googleClientId;

    public AuthService(
        IUserRepository userRepository,
        JwtHelper jwtHelper,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _jwtHelper = jwtHelper;
        _googleClientId = configuration["Google:ClientId"];
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists");
        }

        // Create new user
        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            Name = request.Name,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber
        };

        await _userRepository.CreateAsync(user, user.Id);

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant());
        if (user == null)
        {
            throw new InvalidOperationException("Invalid email or password");
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new InvalidOperationException("This account uses Google Sign-In. Please use Google to log in.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password");
        }

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> GoogleAuthAsync(GoogleAuthRequest request)
    {
        GoogleJsonWebSignature.Payload payload;

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _googleClientId }
            };

            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            throw new InvalidOperationException("Invalid Google ID token");
        }

        // Check if user exists by Google ID
        var user = await _userRepository.GetByGoogleIdAsync(payload.Subject);

        if (user == null)
        {
            // Check if user exists by email
            user = await _userRepository.GetByEmailAsync(payload.Email.ToLowerInvariant());

            if (user != null)
            {
                // Link Google account to existing user
                user.GoogleId = payload.Subject;
                user.ProfilePictureUrl ??= payload.Picture;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user, user.Id, user.Id);
            }
            else
            {
                // Create new user
                user = new User
                {
                    Email = payload.Email.ToLowerInvariant(),
                    Name = payload.Name,
                    GoogleId = payload.Subject,
                    ProfilePictureUrl = payload.Picture
                };
                await _userRepository.CreateAsync(user, user.Id);
            }
        }

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);
        if (user == null)
        {
            throw new InvalidOperationException("Invalid or expired refresh token");
        }

        return await GenerateAuthResponse(user);
    }

    public Task<bool> ValidateTokenAsync(string token)
    {
        var principal = _jwtHelper.ValidateToken(token);
        return Task.FromResult(principal != null);
    }

    public string? GetUserIdFromToken(string token)
    {
        return _jwtHelper.GetUserIdFromToken(token);
    }

    private async Task<AuthResponse> GenerateAuthResponse(User user)
    {
        var (accessToken, accessExpiresAt) = _jwtHelper.GenerateAccessToken(user.Id, user.Email, user.Name);
        var (refreshToken, refreshExpiresAt) = _jwtHelper.GenerateRefreshToken();

        // Save refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = refreshExpiresAt;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, user.Id, user.Id);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = accessExpiresAt,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                ProfilePictureUrl = user.ProfilePictureUrl,
                PhoneNumber = user.PhoneNumber,
                IsProvider = user.IsProvider
            }
        };
    }
}
