using System.Net;
using Home.Chat.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;

namespace Home.Chat.functions;

public class Conversations(ILogger<Conversations> logger, ConversationService conversationService)
{
    [Function(nameof(Conversations))]
    [OpenApiOperation(operationId: "GetConversations", tags: ["Conversations"], Summary = "List all conversations", Description = "Returns all stored conversations.")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(string[]), Description = "A list of conversations.")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "conversations")] HttpRequest req)
    {
        var conversations = await conversationService.GetConversationsAsync();
        return new OkObjectResult(conversations);
    }

    [Function("ConversationById")]
    [OpenApiOperation(operationId: "GetConversationById", tags: ["Conversations"], Summary = "Get a conversation by ID", Description = "Returns a single conversation by its ID.")]
    [OpenApiParameter(name: "id", In = Microsoft.OpenApi.Models.ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The conversation ID.")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(string), Description = "The conversation.")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Conversation not found.")]
    public async Task<IActionResult> GetById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "conversations/{id}")] HttpRequest req,
        string id)
    { 
        var conversation = await conversationService.GetConversationById(id);
        if (conversation is null) return new NoContentResult();
        return new OkObjectResult(conversation);
    }
}
