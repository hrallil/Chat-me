using System.Text.Json;
using Home.Chat.Services;
using LLMClient;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Azure.Functions.Worker.Extensions.OpenApi.Extensions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Abstractions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Configurations;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Serilog;
using SQLiteClient;

var seqUrl = Environment.GetEnvironmentVariable("SEQ_SERVER_URL") ?? "http://localhost:5341";

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.Seq(seqUrl)
    .CreateLogger();

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://mathias.it.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddSerilog();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights()
    .AddLogging();

builder.Services.AddSingleton<IOpenApiConfigurationOptions>(_ => new OpenApiConfigurationOptions
{
    Info = new OpenApiInfo
    {
        Title = "Chat Me API",
        Version = "1.0.0",
        Description = "API for the Chat Me application."
    },
    OpenApiVersion = OpenApiVersionType.V3,
    IncludeRequestingHostName = true,
    ForceHttps = false,
    ForceHttp = false,
});

builder.Services.AddHttpClient();
builder.Services.AddOptions<SQLiteOptions>().BindConfiguration("SQLite");
builder.Services.AddOptions<LLMOptions>().BindConfiguration("LLM");
builder.Services
    .AddSingleton<LLMClient.LLMClient>()
    .AddSingleton<SQLiteClient.SQLiteClient>()
    .AddSingleton<SqliteService>()
    .AddSingleton<ConversationService>()
    .AddSingleton<JsonSerializerOptions>(_ => new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

var app = builder.Build();

app.UseCors();

await app.Services.GetRequiredService<SqliteService>().InitializeAsync();

app.Run();