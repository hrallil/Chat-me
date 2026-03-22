using Home.Chat.Models;

namespace Home.Chat.Services;

public class SqliteService(SQLiteClient.SQLiteClient client)
{
    public async Task InitializeAsync()
    {
        await client.CreateTableAsync("conversations", new Dictionary<string, string>
        {
            ["id"] = "TEXT PRIMARY KEY",
            ["created_at"] = "TEXT NOT NULL",
            ["updated_at"] = "TEXT NOT NULL"
        });

        await client.CreateTableAsync("messages", new Dictionary<string, string>
        {
            ["id"] = "TEXT PRIMARY KEY",
            ["conversation_id"] = "TEXT NOT NULL REFERENCES conversations(id)",
            ["text"] = "TEXT",
            ["sender"] = "TEXT",
            ["created_at"] = "TEXT NOT NULL",
            ["updated_at"] = "TEXT NOT NULL"
        });
    }

    public async Task AddConversationAsync(Conversation conversation)
    {
        await client.InsertAsync("conversations", new Dictionary<string, object?>
        {
            ["id"] = conversation.Id,
            ["created_at"] = conversation.CreatedAt.ToString("o"),
            ["updated_at"] = conversation.UpdatedAt.ToString("o")
        });
    }

    public async Task<List<Models.Conversation>> GetConversationsAsync()
    {
        var rows = await client.SelectAsync("conversations");
        var conversations = rows.Select(MapConversation).ToList();

        foreach (var conversation in conversations)
            conversation.Message = await GetMessagesByConversationIdAsync(conversation.Id);

        return conversations;
    }

    public async Task<Models.Conversation?> GetConversationByIdAsync(string id)
    {
        var rows = await client.SelectAsync("conversations", "id = @id", new Dictionary<string, object?> { ["@id"] = id });
        var conversation = rows.Select(MapConversation).FirstOrDefault();

        if (conversation is null) return null;

        conversation.Message = await GetMessagesByConversationIdAsync(id);
        return conversation;
    }

    public async Task AddMessageAsync(Message message)
    {
        await client.InsertAsync("messages", new Dictionary<string, object?>
        {
            ["id"] = message.Id,
            ["conversation_id"] = message.ConversationId,
            ["text"] = message.Text,
            ["sender"] = message.Sender,
            ["created_at"] = message.CreatedAt.ToString("o"),
            ["updated_at"] = message.UpdatedAt.ToString("o")
        });
    }

    public async Task<List<Message>> GetMessagesByConversationIdAsync(string conversationId)
    {
        var rows = await client.SelectAsync("messages", "conversation_id = @id", new Dictionary<string, object?> { ["@id"] = conversationId });
        return rows.Select(MapMessage).ToList();
    }

    private static Conversation MapConversation(Dictionary<string, object?> row) => new()
    {
        Id = (string)row["id"]!,
        CreatedAt = DateTime.Parse((string)row["created_at"]!),
        UpdatedAt = DateTime.Parse((string)row["updated_at"]!)
    };

    private static Message MapMessage(Dictionary<string, object?> row) => new()
    {
        Id = (string)row["id"]!,
        ConversationId = (string)row["conversation_id"]!,
        Text = row["text"] as string,
        Sender = row["sender"] as string,
        CreatedAt = DateTime.Parse((string)row["created_at"]!),
        UpdatedAt = DateTime.Parse((string)row["updated_at"]!)
    };
}