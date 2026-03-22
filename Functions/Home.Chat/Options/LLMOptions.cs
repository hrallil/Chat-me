namespace LLMClient;

public class LLMOptions
{
    public string BaseUrl { get; set; } = "http://ollama:11434";
    public string Model { get; set; } = "llama3.2";
    public string SystemPromptPath { get; set; } = "system-prompt.txt";
}
