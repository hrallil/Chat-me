using System.Net;
using System.Text.Json;
using Home.Chat.Models;
using Home.Chat.Services;
using LLMClient;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Home.Chat.functions;

public class Chat(
    ILogger<Chat> logger,
    ConversationService conversationService,
    SqliteService sqliteService,
    JsonSerializerOptions jsonSerializerOptions,
    LLMClient.LLMClient llmClient,
    IOptions<LLMOptions> llmOptions)
{
    [Function(nameof(Chat))]
    [OpenApiOperation(operationId: "SendMessage", tags: ["Chat"], Summary = "Send a message", Description = "Adds a message to a conversation and returns the updated conversation.")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ChatRequest), Required = true, Description = "The message payload.")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Conversation), Description = "The updated conversation.")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "chat")] HttpRequest req)
    {
        var body = await JsonSerializer.DeserializeAsync<ChatRequest>(req.Body, jsonSerializerOptions);

        if (body is null || string.IsNullOrWhiteSpace(body.Message))
            return new BadRequestObjectResult("ConversationId and Message are required.");
        if (string.IsNullOrWhiteSpace(body.ConversationId)) body.ConversationId = Guid.NewGuid().ToString();

        var conversation = await conversationService.GetConversationById(body.ConversationId);
        var now = DateTime.UtcNow;

        if (conversation is null)
        {
            conversation = new Conversation
            {
                Id = body.ConversationId,
                CreatedAt = now,
                UpdatedAt = now
            };
            await conversationService.AddConversationAsync(conversation);
        }

        await sqliteService.AddMessageAsync(new Message
        {
            ConversationId = body.ConversationId,
            Text = body.Message,
            Sender = "user",
            CreatedAt = now,
            UpdatedAt = now
        });

        var updated = await conversationService.GetConversationById(body.ConversationId);

        var systemPromptPath = llmOptions.Value.SystemPromptPath;
        var systemPrompt = File.Exists(systemPromptPath)
            ? await File.ReadAllTextAsync(systemPromptPath)
            : string.Empty;

        var history = (updated?.Message ?? [])
            .Select(m => new OllamaMessage(m.Sender == "user" ? "user" : "assistant", m.Text ?? string.Empty));

        var messages = string.IsNullOrWhiteSpace(systemPrompt)
            ? history
            : new[] { new OllamaMessage("system", systemPrompt) }.Concat(history);

        string assistantReply;
        try
        {
            assistantReply = await llmClient.ChatAsync(messages);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get response from LLM");
            return new StatusCodeResult(502);
        }

        var replyNow = DateTime.UtcNow;
        await sqliteService.AddMessageAsync(new Message
        {
            ConversationId = body.ConversationId,
            Text = assistantReply,
            Sender = "assistant",
            CreatedAt = replyNow,
            UpdatedAt = replyNow
        });

        var final = await conversationService.GetConversationById(body.ConversationId);
        return new OkObjectResult(final);
    }
}

public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
}
