using System.Net;
using System.Text.Json;

namespace SportPlannerNW.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Unhandled exception occurred.");

        var code = HttpStatusCode.InternalServerError; // 500 if unexpected
        var result = string.Empty;

        // Custom error mapping
        switch (exception)
        {
            case KeyNotFoundException e:
                code = HttpStatusCode.NotFound;
                result = JsonSerializer.Serialize(new { error = e.Message });
                break;
            case UnauthorizedAccessException e:
                code = HttpStatusCode.Unauthorized;
                result = JsonSerializer.Serialize(new { error = e.Message });
                break;
            case ArgumentException e:
                code = HttpStatusCode.BadRequest;
                result = JsonSerializer.Serialize(new { error = e.Message });
                break;
            default:
                // Don't expose stack trace in production unless specifically requested or safe
                var errorMessage = _env.IsDevelopment() ? $"{exception.Message} {exception.StackTrace}" : "An unexpected error occurred.";
                result = JsonSerializer.Serialize(new { error = errorMessage });
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        return context.Response.WriteAsync(result);
    }
}
