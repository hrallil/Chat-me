namespace Home.Chat.Models;

public class Message
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string ConversationId { get; set; }
    public string? Text { get; set; }
    public string? Sender { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}