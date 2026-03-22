using Home.Chat.Models;

namespace Home.Chat.Services;

public class ConversationService(SqliteService sqliteService)
{
    public async Task<List<Conversation>> GetConversationsAsync()
    {
        return await sqliteService.GetConversationsAsync();
    }

    public async Task<Conversation?> GetConversationById(string id)
    {
        return await sqliteService.GetConversationByIdAsync(id);
    }

    public async Task AddConversationAsync(Conversation conversation)
    {
        await sqliteService.AddConversationAsync(conversation);
    }
}