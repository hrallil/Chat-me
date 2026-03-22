namespace Home.Chat.Models;

public class Conversation
{
    public required string Id { get; set; } = Guid.NewGuid().ToString();
    public List<Message>? Message { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}