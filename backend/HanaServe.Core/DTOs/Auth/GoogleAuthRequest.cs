using System.Text.Json.Serialization;

namespace HanaServe.Core.DTOs.Auth;

public class GoogleAuthRequest
{
    [JsonPropertyName("idToken")]
    public string IdToken { get; set; } = string.Empty;
}
