using System.Net;
using System.Text.Json;
using SportPlannerNW.Models.Common;

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
        string mensaje;
        List<string>? detalles = null;

        // Custom error mapping
        switch (exception)
        {
            case KeyNotFoundException e:
                code = HttpStatusCode.NotFound;
                mensaje = e.Message;
                break;
            case UnauthorizedAccessException e:
                code = HttpStatusCode.Unauthorized;
                mensaje = e.Message;
                break;
            case ArgumentException e:
                code = HttpStatusCode.BadRequest;
                mensaje = e.Message;
                break;
            default:
                mensaje = _env.IsDevelopment() ? exception.Message : "An unexpected error occurred.";
                if (_env.IsDevelopment())
                {
                    detalles = new List<string> { exception.StackTrace ?? string.Empty };
                }
                break;
        }

        var response = ApiResponse<object>.Fallido(mensaje, detalles);
        var result = JsonSerializer.Serialize(response, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        return context.Response.WriteAsync(result);
    }
}
