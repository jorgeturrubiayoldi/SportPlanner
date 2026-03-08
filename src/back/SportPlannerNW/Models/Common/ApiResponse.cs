using System.Text.Json.Serialization;

namespace SportPlannerNW.Models.Common;

public class ApiResponse<T>
{
    public bool Success { get; private set; }
    public T? Data { get; private set; }
    public string? Mensaje { get; private set; }
    public List<string> Errores { get; private set; } = new();
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;

    private ApiResponse() { }

    public static ApiResponse<T> Exitoso(T data, string? mensaje = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Mensaje = mensaje ?? "Operación exitosa"
        };
    }

    public static ApiResponse<T> Fallido(string mensaje, List<string>? errores = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Mensaje = mensaje,
            Errores = errores ?? new List<string>()
        };
    }

    public static ApiResponse<T> FallidoValidacion(Dictionary<string, string[]> erroresValidacion)
    {
        var errores = erroresValidacion
            .SelectMany(e => e.Value.Select(v => $"{e.Key}: {v}"))
            .ToList();

        return new ApiResponse<T>
        {
            Success = false,
            Mensaje = "Errores de validación",
            Errores = errores
        };
    }
}
