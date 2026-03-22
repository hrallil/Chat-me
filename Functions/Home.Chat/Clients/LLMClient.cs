using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace LLMClient;

public class LLMClient(IHttpClientFactory httpClientFactory, IOptions<LLMOptions> options)
{
    private readonly LLMOptions _options = options.Value;

    public async Task<string> ChatAsync(IEnumerable<OllamaMessage> messages)
    {
        var client = httpClientFactory.CreateClient();

        var request = new OllamaChatRequest
        {
            Model = _options.Model,
            Messages = messages.ToList(),
            Stream = false
        };

        var response = await client.PostAsJsonAsync($"{_options.BaseUrl}/api/chat", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<OllamaChatResponse>();
        return result?.Message?.Content ?? string.Empty;
    }
}

public record OllamaMessage(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content
);

file record OllamaChatRequest
{
    [JsonPropertyName("model")]
    public string Model { get; init; } = string.Empty;

    [JsonPropertyName("messages")]
    public List<OllamaMessage> Messages { get; init; } = [];

    [JsonPropertyName("stream")]
    public bool Stream { get; init; }
}

file record OllamaChatResponse
{
    [JsonPropertyName("message")]
    public OllamaMessage? Message { get; init; }
}
