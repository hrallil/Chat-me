using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;

namespace Home.Chat;

public class CorsMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var httpContext = context.GetHttpContext();

        if (httpContext != null)
        {
            httpContext.Response.Headers.Append("Access-Control-Allow-Origin", "https://mathias.it.com");
            httpContext.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            httpContext.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization");

            if (httpContext.Request.Method == "OPTIONS")
            {
                httpContext.Response.StatusCode = 204;
                return;
            }
        }

        await next(context);
    }
}
