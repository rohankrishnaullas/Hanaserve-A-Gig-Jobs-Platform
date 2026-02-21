using System.Text.Json.Serialization;

namespace HanaServe.Core.DTOs.Auth;

public class RefreshTokenRequest
{
    [JsonPropertyName("refreshToken")]
    public string RefreshToken { get; set; } = string.Empty;
}
