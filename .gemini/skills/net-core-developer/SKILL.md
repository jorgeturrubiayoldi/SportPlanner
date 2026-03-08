name: net-core-developer description: Implementacion backend .NET 8+ con Clean Architecture, servicios, repositorios y APIs license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code. Requiere .NET 8+ SDK metadata: role: Backend Developer

Desarrollador Backend — Implementación
Rol: Implementador técnico especializado en .NET 8+ con Clean Architecture.

Responsabilidad: Transformar especificaciones técnicas del Arquitecto Backend en código funcional, siguiendo patrones establecidos, mejores prácticas de .NET 8/9, y asegurando calidad mediante validación, logging, seguridad y performance.

Alcance: Implementación completa de capas Domain, Application, Infrastructure y API, incluyendo entidades, servicios, repositorios, controllers, validadores, mappers, configuración de EF Core, transacciones, caching, CORS, logging estructurado, y documentación.

Patrones de Codigo Obligatorios
ApiResponse (Application - Common/Responses)
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
Entidad (Domain)
public class {NombreEntidad}
{
    public int Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public DateTime FechaCreacion { get; private set; }

    // Campos de auditoría
    public string CreadoPor { get; private set; } = string.Empty;
    public DateTime? FechaModificacion { get; private set; }
    public string? ModificadoPor { get; private set; }

    // Token de concurrencia
    public byte[] RowVersion { get; private set; } = Array.Empty<byte>();

    // Constructor privado para EF Core
    private {NombreEntidad}() { }

    // Constructor público
    public {NombreEntidad}(string nombre, string creadoPor)
    {
        Nombre = nombre;
        CreadoPor = creadoPor;
        FechaCreacion = DateTime.UtcNow;
    }

    // Métodos de dominio
    public void Actualizar{Propiedad}({tipo} {param}, string modificadoPor)
    {
        {Propiedad} = {param};
        FechaModificacion = DateTime.UtcNow;
        ModificadoPor = modificadoPor;
    }

    public void ActualizarNombre(string nombre, string modificadoPor)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

        Nombre = nombre;
        FechaModificacion = DateTime.UtcNow;
        ModificadoPor = modificadoPor;
    }
}
Validador (FluentValidation)
public class Crear{Entidad}Validador : AbstractValidator<Crear{Entidad}Dto>
{
    public Crear{Entidad}Validador()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(200).WithMessage("El nombre no puede exceder 200 caracteres");
    }
}
Mapper (AutoMapper)
public class {Entidad}Profile : Profile
{
    public {Entidad}Profile()
    {
        CreateMap<{Entidad}, {Entidad}Dto>();
        CreateMap<Crear{Entidad}Dto, {Entidad}>();
    }
}
DTOs (Application - DTOs)
// DTO de lectura
public class {Entidad}Dto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
}

// DTO de creación
public class Crear{Entidad}Dto
{
    public string Nombre { get; set; } = string.Empty;
}

// DTO de actualización
public class Actualizar{Entidad}Dto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
}
Servicio (Application - Services)
public interface I{Entidad}Servicio
{
    Task<IEnumerable<{Entidad}Dto>> ObtenerTodosAsync();
    Task<{Entidad}Dto?> ObtenerPorIdAsync(int id);
    Task<{Entidad}Dto> CrearAsync(Crear{Entidad}Dto dto);
    Task<{Entidad}Dto> ActualizarAsync(Actualizar{Entidad}Dto dto);
    Task<bool> EliminarAsync(int id);
    Task<PagedResult<{Entidad}Dto>> ObtenerPaginadoAsync(int pageNumber, int pageSize);
}

public class {Entidad}Servicio : I{Entidad}Servicio
{
    private readonly I{Entidad}Repositorio _repositorio;
    private readonly IMapper _mapper;
    private readonly ILogger<{Entidad}Servicio> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;
    private const string CachePrefijo = "{Entidad}_";
    private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

    public {Entidad}Servicio(
        I{Entidad}Repositorio repositorio,
        IMapper mapper,
        ILogger<{Entidad}Servicio> logger,
        IUnitOfWork unitOfWork,
        IMemoryCache cache)
    {
        _repositorio = repositorio;
        _mapper = mapper;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task<IEnumerable<{Entidad}Dto>> ObtenerTodosAsync()
    {
        _logger.LogInformation("Obteniendo todas las entidades {Entidad}", nameof({Entidad}));
        var entidades = await _repositorio.ObtenerTodosAsync();
        return _mapper.Map<IEnumerable<{Entidad}Dto>>(entidades);
    }

    public async Task<{Entidad}Dto?> ObtenerPorIdAsync(int id)
    {
        var cacheKey = $"{CachePrefijo}{id}";

        // Intentar obtener del cache primero
        if (_cache.TryGetValue(cacheKey, out {Entidad}Dto? cachedDto))
        {
            _logger.LogDebug("{Entidad} con ID {Id} obtenido del cache", nameof({Entidad}), id);
            return cachedDto;
        }

        _logger.LogInformation("Obteniendo {Entidad} con ID: {Id} desde BD", nameof({Entidad}), id);
        var entidad = await _repositorio.ObtenerPorIdAsync(id);

        if (entidad == null)
        {
            _logger.LogWarning("{Entidad} con ID {Id} no encontrado", nameof({Entidad}), id);
            return null;
        }

        var dto = _mapper.Map<{Entidad}Dto>(entidad);

        // Guardar en cache con opciones
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(_cacheExpiration)
            .SetPriority(CacheItemPriority.Normal);

        _cache.Set(cacheKey, dto, cacheOptions);

        return dto;
    }

    public async Task<{Entidad}Dto> CrearAsync(Crear{Entidad}Dto dto)
    {
        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["Operacion"] = "Crear{Entidad}",
            ["Usuario"] = dto.CreadoPor ?? "sistema"
        }))
        {
            _logger.LogInformation("Creando nueva entidad {Entidad} con nombre {Nombre}",
                nameof({Entidad}), dto.Nombre);

            try
            {
                var entidad = _mapper.Map<{Entidad}>(dto);
                await _repositorio.AgregarAsync(entidad);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("{Entidad} creado exitosamente con ID: {EntidadId}",
                    nameof({Entidad}), entidad.Id);

                // Invalidar cache después de crear
                InvalidarCacheLista();

                return _mapper.Map<{Entidad}Dto>(entidad);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear {Entidad}. Datos: {@Dto}",
                    nameof({Entidad}), dto);
                throw;
            }
        }
    }

    public async Task<{Entidad}Dto> ActualizarAsync(Actualizar{Entidad}Dto dto)
    {
        _logger.LogInformation("Actualizando {Entidad} con ID: {Id}", nameof({Entidad}), dto.Id);

        var entidad = await _repositorio.ObtenerPorIdAsync(dto.Id);
        if (entidad == null)
            throw new KeyNotFoundException($"{nameof({Entidad})} con ID {dto.Id} no encontrado");

        _mapper.Map(dto, entidad);
        _repositorio.Actualizar(entidad);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("{Entidad} actualizado exitosamente", nameof({Entidad}));
        return _mapper.Map<{Entidad}Dto>(entidad);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        _logger.LogInformation("Eliminando {Entidad} con ID: {Id}", nameof({Entidad}), id);

        var entidad = await _repositorio.ObtenerPorIdAsync(id);
        if (entidad == null)
            return false;

        _repositorio.Eliminar(entidad);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("{Entidad} eliminado exitosamente", nameof({Entidad}));
        return true;
    }

    public async Task<PagedResult<{Entidad}Dto>> ObtenerPaginadoAsync(int pageNumber, int pageSize)
    {
        _logger.LogInformation("Obteniendo {Entidad} paginado - Página: {PageNumber}, Tamaño: {PageSize}",
            nameof({Entidad}), pageNumber, pageSize);

        var totalCount = await _repositorio.ContarAsync();
        var entidades = await _repositorio.ObtenerPaginadoAsync(pageNumber, pageSize);
        var dtos = _mapper.Map<List<{Entidad}Dto>>(entidades);

        return new PagedResult<{Entidad}Dto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    // Métodos privados para gestión de cache
    private void InvalidarCache(int id)
    {
        var cacheKey = $"{CachePrefijo}{id}";
        _cache.Remove(cacheKey);
        _logger.LogDebug("Cache invalidado para {Entidad} ID: {Id}", nameof({Entidad}), id);
    }

    private void InvalidarCacheLista()
    {
        // Implementar patrón de invalidación de cache de listas
        // Opción 1: Usar tags o keys pattern
        // Opción 2: Expiración automática por tiempo
        _logger.LogDebug("Cache de lista {Entidad} invalidado", nameof({Entidad}));
    }
}
PagedResult (Application - Common)
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
Repositorio (Infrastructure)
public class {Entidad}Repositorio : RepositorioBase<{Entidad}>, I{Entidad}Repositorio
{
    public {Entidad}Repositorio(DbContext contexto) : base(contexto) { }

    public async Task<{Entidad}?> ObtenerPor{Criterio}Async({tipo} {param})
    {
        return await _contexto.Set<{Entidad}>()
            .FirstOrDefaultAsync(x => x.{Criterio} == {param});
    }

    public async Task<IEnumerable<{Entidad}>> ObtenerPaginadoAsync(int pageNumber, int pageSize)
    {
        return await _contexto.Set<{Entidad}>()
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> ContarAsync()
    {
        return await _contexto.Set<{Entidad}>().CountAsync();
    }
}
Configuración EF Core (Infrastructure - Configurations)
public class {Entidad}Configuracion : IEntityTypeConfiguration<{Entidad}>
{
    public void Configure(EntityTypeBuilder<{Entidad}> builder)
    {
        builder.ToTable("{Entidades}");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .UseIdentityColumn();

        builder.Property(e => e.Nombre)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.FechaCreacion)
            .IsRequired();

        // Índices
        builder.HasIndex(e => e.Nombre)
            .HasDatabaseName("IX_{Entidad}_Nombre");

        // Auditoría (si aplica)
        builder.Property(e => e.CreadoPor)
            .HasMaxLength(100);

        builder.Property(e => e.ModificadoPor)
            .HasMaxLength(100);

        // Token de concurrencia
        builder.Property(e => e.RowVersion)
            .IsRowVersion();
    }
}
UnitOfWork (Infrastructure - Persistence)
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly DbContext _contexto;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(DbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _contexto.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _contexto.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        try
        {
            await SaveChangesAsync();
            if (_transaction != null)
                await _transaction.CommitAsync();
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }
}
Controller (Api)
[ApiController]
[Route("api/v1/[controller]")]
public class {Entidad}Controller : ControllerBase
{
    private readonly I{Entidad}Servicio _servicio;
    private readonly ILogger<{Entidad}Controller> _logger;

    public {Entidad}Controller(
        I{Entidad}Servicio servicio,
        ILogger<{Entidad}Controller> logger)
    {
        _servicio = servicio;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las entidades {Entidad}
    /// </summary>
    [HttpGet]
    [Authorize] // Requiere autenticación
    [OutputCache(PolicyName = "ExpiracionRapida")] // .NET 8+ Output Caching
    // [ResponseCache(Duration = 60)] // Alternativa: Response Caching tradicional
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<{Entidad}Dto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IEnumerable<{Entidad}Dto>>>> ObtenerTodos()
    {
        var resultado = await _servicio.ObtenerTodosAsync();
        return Ok(ApiResponse<IEnumerable<{Entidad}Dto>>.Exitoso(resultado));
    }

    /// <summary>
    /// Obtiene una entidad {Entidad} por ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<{Entidad}Dto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<{Entidad}Dto>>> ObtenerPorId(int id)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id);

        if (resultado == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Recurso no encontrado",
                Detail = $"No se encontró {Entidad} con ID {id}"
            });
        }

        return Ok(ApiResponse<{Entidad}Dto>.Exitoso(resultado));
    }

    /// <summary>
    /// Crea una nueva entidad {Entidad}
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrador,Editor")] // Requiere rol específico
    // [Authorize(Policy = "RequierePermisoEscritura")] // Alternativa: política personalizada
    [ProducesResponseType(typeof(ApiResponse<{Entidad}Dto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<{Entidad}Dto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<{Entidad}Dto>>> Crear([FromBody] Crear{Entidad}Dto dto)
    {
        var resultado = await _servicio.CrearAsync(dto);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = resultado.Id },
            ApiResponse<{Entidad}Dto>.Exitoso(resultado, "Entidad creada exitosamente")
        );
    }

    /// <summary>
    /// Actualiza una entidad {Entidad} existente
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<{Entidad}Dto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<{Entidad}Dto>>> Actualizar(
        int id,
        [FromBody] Actualizar{Entidad}Dto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "ID no coincide",
                Detail = "El ID de la ruta no coincide con el ID del cuerpo"
            });
        }

        try
        {
            var resultado = await _servicio.ActualizarAsync(dto);
            return Ok(ApiResponse<{Entidad}Dto>.Exitoso(resultado, "Entidad actualizada exitosamente"));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Recurso no encontrado",
                Detail = $"No se encontró {Entidad} con ID {id}"
            });
        }
    }

    /// <summary>
    /// Elimina una entidad {Entidad}
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador")] // Solo administradores
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> Eliminar(int id)
    {
        var resultado = await _servicio.EliminarAsync(id);

        if (!resultado)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Recurso no encontrado",
                Detail = $"No se encontró {Entidad} con ID {id}"
            });
        }

        return Ok(ApiResponse<bool>.Exitoso(true, "Entidad eliminada exitosamente"));
    }

    /// <summary>
    /// Obtiene entidades {Entidad} paginadas
    /// </summary>
    [HttpGet("paginado")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<{Entidad}Dto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PagedResult<{Entidad}Dto>>>> ObtenerPaginado(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1 || pageSize < 1)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Parámetros inválidos",
                Detail = "pageNumber y pageSize deben ser mayores a 0"
            });
        }

        var resultado = await _servicio.ObtenerPaginadoAsync(pageNumber, pageSize);
        return Ok(ApiResponse<PagedResult<{Entidad}Dto>>.Exitoso(resultado));
    }
}
CorrelationIdMiddleware (Api - Middleware)
// Middleware para rastreo de requests distribuidos
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = GetCorrelationId(context);

        // Agregar a response headers
        context.Response.OnStarting(() =>
        {
            if (!context.Response.Headers.ContainsKey(CorrelationIdHeader))
            {
                context.Response.Headers.Add(CorrelationIdHeader, correlationId);
            }
            return Task.CompletedTask;
        });

        // Agregar al log context
        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }

    private string GetCorrelationId(HttpContext context)
    {
        // Usar el ID del request si existe, o generar uno nuevo
        if (context.Request.Headers.TryGetValue(CorrelationIdHeader, out var correlationId))
        {
            return correlationId.ToString();
        }

        return Guid.NewGuid().ToString();
    }
}

// Registrar en Program.cs
app.UseMiddleware<CorrelationIdMiddleware>(); // Debe ir al inicio del pipeline
GlobalExceptionHandler (Api - Middleware)
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(
            exception,
            "Excepción ocurrió: {Message}",
            exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Error interno del servidor",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1"
        };

        // Manejar excepciones específicas
        switch (exception)
        {
            case ValidationException validationException:
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Errores de validación";
                problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
                problemDetails.Extensions["errors"] = validationException.Errors;
                break;

            case KeyNotFoundException:
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Title = "Recurso no encontrado";
                problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
                break;

            case UnauthorizedAccessException:
                problemDetails.Status = StatusCodes.Status401Unauthorized;
                problemDetails.Title = "No autorizado";
                problemDetails.Type = "https://tools.ietf.org/html/rfc7235#section-3.1";
                break;

            default:
                problemDetails.Detail = "Ocurrió un error inesperado. Por favor, contacte al administrador.";
                break;
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
Logging Configuration (Program.cs)
// Configurar Serilog para logging estructurado (recomendado para .NET 8+)
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.File(
        path: "logs/log-.txt",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Seq("http://localhost:5341") // Opcional: Seq para visualización
);

// Alternativa: Logging nativo de .NET (más simple)
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.AddEventSourceLogger();

// Configurar niveles de log por fuente
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Information);
Authentication & Authorization (Program.cs)
// Configurar autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey no configurado")))
        };

        // Configurar eventos para debugging (desarrollo)
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

// Configurar autorización con políticas
builder.Services.AddAuthorization(options =>
{
    // Política basada en roles
    options.AddPolicy("RequiereAdmin", policy =>
        policy.RequireRole("Administrador"));

    // Política basada en claims
    options.AddPolicy("RequierePermisoEscritura", policy =>
        policy.RequireClaim("Permiso", "Escritura", "Admin"));

    // Política personalizada
    options.AddPolicy("RequiereEdadMinima", policy =>
        policy.Requirements.Add(new EdadMinimaRequirement(18)));

    // Política combinada
    options.AddPolicy("AdminOGerente", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("Administrador") ||
            context.User.IsInRole("Gerente")));
});

// Registrar handlers personalizados de autorización
builder.Services.AddScoped<IAuthorizationHandler, EdadMinimaHandler>();
Authorization Handler Personalizado
// Requirement
public class EdadMinimaRequirement : IAuthorizationRequirement
{
    public int EdadMinima { get; }

    public EdadMinimaRequirement(int edadMinima)
    {
        EdadMinima = edadMinima;
    }
}

// Handler
public class EdadMinimaHandler : AuthorizationHandler<EdadMinimaRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        EdadMinimaRequirement requirement)
    {
        var edadClaim = context.User.FindFirst(c => c.Type == "Edad");

        if (edadClaim == null)
        {
            return Task.CompletedTask;
        }

        if (int.TryParse(edadClaim.Value, out int edad) && edad >= requirement.EdadMinima)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
JWT Service (Application - Services)
public interface IJwtServicio
{
    string GenerarToken(int userId, string username, IEnumerable<string> roles, Dictionary<string, string>? claims = null);
    ClaimsPrincipal? ValidarToken(string token);
}

public class JwtServicio : IJwtServicio
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtServicio> _logger;

    public JwtServicio(IConfiguration configuration, ILogger<JwtServicio> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerarToken(int userId, string username, IEnumerable<string> roles, Dictionary<string, string>? claims = null)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claimsList = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Agregar roles
        claimsList.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        // Agregar claims personalizados
        if (claims != null)
        {
            claimsList.AddRange(claims.Select(c => new Claim(c.Key, c.Value)));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claimsList,
            expires: DateTime.UtcNow.AddHours(int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24")),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidarToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Token inválido");
            return null;
        }
    }
}
CORS Configuration (Program.cs)
// Configurar CORS - IMPORTANTE para APIs consumidas por frontends
builder.Services.AddCors(options =>
{
    // Política permisiva para desarrollo
    options.AddPolicy("Development", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    // Política restrictiva para producción (RECOMENDADO)
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins(
                "https://miapp.com",
                "https://www.miapp.com",
                "https://admin.miapp.com")
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .WithHeaders("Content-Type", "Authorization")
              .AllowCredentials() // Solo si usas cookies/autenticación
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });

    // Política por defecto (usar según ambiente)
    options.AddDefaultPolicy(policy =>
    {
        var isDevelopment = builder.Environment.IsDevelopment();

        if (isDevelopment)
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});
Registro DI (Program.cs)
// Agregar manejo de excepciones global
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configurar FluentValidation
builder.Services.AddFluentValidationAutoValidation()
                .AddFluentValidationClientsideAdapters();

builder.Services.AddValidatorsFromAssemblyContaining<Crear{Entidad}Validador>();

// Configurar Swagger con documentación mejorada
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "{Proyecto} API",
        Description = "API basada en Clean Architecture con .NET 8+"
    });

    // Incluir comentarios XML
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

// Configurar AutoMapper
builder.Services.AddAutoMapper(typeof({Entidad}Profile));

// Configurar Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Configurar servicios y repositorios
builder.Services.AddScoped<I{Entidad}Repositorio, {Entidad}Repositorio>();
builder.Services.AddScoped<I{Entidad}Servicio, {Entidad}Servicio>();
builder.Services.AddScoped<IJwtServicio, JwtServicio>();

// Configurar Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database");

// Configurar Rate Limiting (opcional - .NET 8+)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.Window = TimeSpan.FromSeconds(10);
        opt.PermitLimit = 100;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 5;
    });
});

// Configurar Caching
builder.Services.AddMemoryCache(); // Cache en memoria

// Distributed Cache (Redis - Producción)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MiApp_";
});

// Output Caching (.NET 8+)
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Cache());
    options.AddPolicy("ExpiracionRapida", builder =>
        builder.Expire(TimeSpan.FromSeconds(30)));
    options.AddPolicy("ExpiracionLenta", builder =>
        builder.Expire(TimeSpan.FromMinutes(10)));
});

// En el pipeline (después de app.Build())

// Logging de requests HTTP (debe ir temprano en el pipeline)
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
        diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
        diagnosticContext.Set("RemoteIP", httpContext.Connection.RemoteIpAddress);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
    };
});

app.UseExceptionHandler(); // Usar el handler global
app.UseHttpsRedirection();

// CORS - DEBE ir antes de UseAuthorization
app.UseCors(); // Usa la política por defecto o especifica: app.UseCors("Production")

// Rate Limiting (si está configurado)
app.UseRateLimiter();

// Autenticación y autorización
app.UseAuthentication(); // Siempre antes de UseAuthorization
app.UseAuthorization();

// Health Checks endpoint
app.MapHealthChecks("/health");
Configuración y Variables de Entorno
Estrategia de Configuración
Principio: CERO secretos hardcodeados. Toda configuración sensible viene de variables de entorno.

Ambiente	Fuente de Secretos	Cómo
Local (dev)	Archivo .env	Docker Compose lee .env con env_file. App lee variables de entorno inyectadas por Docker.
Staging/Producción	EC2/Fargate secrets + env vars	Variables de entorno del task definition (Fargate) o user data (EC2). Secrets en AWS Secrets Manager o Parameter Store.
Archivo .env (local — NUNCA se versiona)
UBICACIÓN: El .env va en la raíz del repositorio, al lado de docker-compose.yml, NO dentro del proyecto API. La app lo carga con DotNetEnv desde Program.cs.
# .env — Raíz del repositorio. NO se sube a Git (está en .gitignore)
ASPNETCORE_ENVIRONMENT=Development

# Base de datos
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=miapp_dev;Username=miapp_user;Password=password_desarrollo_local

# JWT
JWT__SecretKey=ClaveSecretaSuperLargaParaDesarrollo_MinimoDe32Caracteres
JWT__Issuer=https://localhost:5001
JWT__Audience=https://localhost:4200
JWT__ExpirationHours=24

# Servicios externos
Serilog__WriteTo__1__Args__serverUrl=http://localhost:5341
Serilog__WriteTo__1__Args__apiKey=dev-api-key

# CORS
AllowedOrigins=http://localhost:4200,http://localhost:3000

# Postgres (para el contenedor Docker)
POSTGRES_DB=miapp_dev
POSTGRES_USER=miapp_user
POSTGRES_PASSWORD=password_desarrollo_local
Archivo .env.example (se versiona — keys sin valores)
UBICACIÓN: El .env.example va en la raíz del repositorio, al lado de .env y docker-compose.yml.
# .env.example — Raíz del repositorio. Copiar a .env y rellenar valores
ASPNETCORE_ENVIRONMENT=Development

# Base de datos
ConnectionStrings__DefaultConnection=

# JWT
JWT__SecretKey=
JWT__Issuer=
JWT__Audience=
JWT__ExpirationHours=24

# Servicios externos
Serilog__WriteTo__1__Args__serverUrl=
Serilog__WriteTo__1__Args__apiKey=

# CORS (separados por coma)
AllowedOrigins=

# Postgres (para el contenedor Docker)
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
.gitignore (obligatorio)
# Variables de entorno — NUNCA versionar
.env
.env.local
.env.*.local

# Sí versionar el ejemplo
!.env.example
Docker Compose — Lee de .env
IMPORTANTE: Docker Compose NO mapea variables individuales. Solo pasa el .env completo. La app usa ConfigurationExtensions para mapear las variables a IConfiguration.
# docker-compose.yml — en la raíz del repositorio, al lado de .env
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    env_file:
      - .env    # Pasa TODAS las variables. La app las mapea con ConfigurationExtensions
    ports:
      - "5001:8080"
    depends_on:
      - db

  db:
    image: postgres:16
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
Dockerfile — Sin variables hardcodeadas
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/MiApp.Api/MiApp.Api.csproj", "MiApp.Api/"]
COPY ["src/MiApp.Application/MiApp.Application.csproj", "MiApp.Application/"]
COPY ["src/MiApp.Domain/MiApp.Domain.csproj", "MiApp.Domain/"]
COPY ["src/MiApp.Infrastructure/MiApp.Infrastructure.csproj", "MiApp.Infrastructure/"]
RUN dotnet restore "MiApp.Api/MiApp.Api.csproj"
COPY src/ .
RUN dotnet publish "MiApp.Api/MiApp.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
# NO usar ENV para secretos — vienen del docker-compose o del orchestrator
ENTRYPOINT ["dotnet", "MiApp.Api.dll"]
appsettings.json (base — valores vacíos para sensibles)
REGLA: Las claves sensibles DEBEN existir en appsettings.json con valores vacíos ("", 0, false). Esto permite que IOptions<T> haga binding correcto de la estructura. ConfigurationExtensions sobreescribe estos valores con las variables de entorno reales al arranque.
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Jwt": {
    "SecretKey": "",
    "Issuer": "",
    "Audience": "",
    "ExpirationHours": 0
  },
  "AllowedOrigins": "",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  },
  "RateLimiting": {
    "PermitLimit": 100,
    "Window": 60,
    "QueueLimit": 5
  }
}
IMPORTANTE: Los valores vacíos ("", 0) son intencionales. ConfigurationExtensions los sobreescribe con variables de entorno. Si una variable requerida no existe, la app falla al arrancar (fail-fast). NUNCA pongas secretos reales en appsettings.json.
appsettings.Development.json (override de logging — sin secretos)
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.EntityFrameworkCore.Database.Command": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "theme": "Serilog.Sinks.SystemConsole.Themes.AnsiConsoleTheme::Code, Serilog.Sinks.Console",
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-development-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7
        }
      }
    ]
  }
}
appsettings.Production.json (override de logging — sin secretos)
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Error",
      "Microsoft.EntityFrameworkCore": "Error"
    }
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Warning",
      "Override": {
        "Microsoft": "Error",
        "System": "Error"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "/var/log/miapp/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "fileSizeLimitBytes": 10485760,
          "rollOnFileSizeLimit": true
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithEnvironmentName", "WithThreadId"]
  }
}
Dependencia: DotNetEnv
# Instalar en el proyecto API
dotnet add src/MiApp.Api/MiApp.Api.csproj package DotNetEnv
Carga de .env en Program.cs
IMPORTANTE: La carga de .env va al INICIO de Program.cs, ANTES de WebApplication.CreateBuilder(). Esto asegura que las variables de entorno están disponibles para todo el pipeline de configuración.
using DotNetEnv;

// 1. Cargar variables de entorno desde .env (raíz del repositorio)
var projectRoot = Directory.GetCurrentDirectory();
var envFiles = new[]
{
    Path.Combine(projectRoot, ".env"),
    Path.Combine(projectRoot, ".env.local")  // Override local (opcional, gitignored)
};

foreach (var envFile in envFiles)
{
    if (File.Exists(envFile))
    {
        Env.Load(envFile);
        Console.WriteLine($"✓ Variables de entorno cargadas desde: {envFile}");
    }
}

// 2. Crear builder
var builder = WebApplication.CreateBuilder(args);

// 3. Mapear variables de entorno a IConfiguration con validación
builder.Configuration.ConfigureEnvironmentVariables();

// 4. Validar que TODAS las variables requeridas existen (fail-fast)
var errores = ConfigurationExtensions.ValidateRequiredEnvironmentVariables();
if (errores.Count > 0)
{
    foreach (var error in errores)
    {
        Console.Error.WriteLine($"✗ {error}");
    }
    throw new InvalidOperationException(
        $"Faltan {errores.Count} variables de entorno requeridas. La app no puede arrancar.");
}

// 5. Configuración tipada con IOptions<T>
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<RateLimitingOptions>(builder.Configuration.GetSection("RateLimiting"));

// ... resto de Program.cs
ConfigurationExtensions — Mapeo explícito de env vars a IConfiguration
PATRÓN OBLIGATORIO: Toda variable de entorno sensible se mapea explícitamente a IConfiguration a través de esta clase. Esto garantiza: (1) validación al arranque, (2) un solo punto de verdad para el mapeo, (3) fail-fast si falta una variable.
namespace MiApp.Api.Extensions;

/// <summary>
/// Mapea variables de entorno a IConfiguration.
/// Los valores en appsettings.json son vacíos ("", 0) — esta clase los sobreescribe
/// con los valores reales de las variables de entorno.
/// </summary>
public static class ConfigurationExtensions
{
    /// <summary>
    /// Punto de entrada: mapea TODAS las variables de entorno a IConfiguration.
    /// Llamar desde Program.cs después de crear el builder.
    /// </summary>
    public static void ConfigureEnvironmentVariables(this IConfiguration configuration)
    {
        ConfigureDatabaseSettings(configuration);
        ConfigureJwtSettings(configuration);
        ConfigureCorsSettings(configuration);
        ConfigureExternalServices(configuration);
    }

    // ─── Database ────────────────────────────────────────────────────────

    public static void ConfigureDatabaseSettings(this IConfiguration configuration)
    {
        var connectionString = GetRequiredEnvironmentVariable("ConnectionStrings__DefaultConnection");
        configuration["ConnectionStrings:DefaultConnection"] = connectionString;
    }

    // ─── JWT ─────────────────────────────────────────────────────────────

    public static void ConfigureJwtSettings(this IConfiguration configuration)
    {
        configuration["Jwt:SecretKey"] = GetRequiredEnvironmentVariable("JWT__SecretKey");
        configuration["Jwt:Issuer"] = GetRequiredEnvironmentVariable("JWT__Issuer");
        configuration["Jwt:Audience"] = GetRequiredEnvironmentVariable("JWT__Audience");
        configuration["Jwt:ExpirationHours"] = GetRequiredEnvironmentVariable("JWT__ExpirationHours");
    }

    // ─── CORS ────────────────────────────────────────────────────────────

    public static void ConfigureCorsSettings(this IConfiguration configuration)
    {
        configuration["AllowedOrigins"] = GetRequiredEnvironmentVariable("AllowedOrigins");
    }

    // ─── Servicios externos ──────────────────────────────────────────────

    public static void ConfigureExternalServices(this IConfiguration configuration)
    {
        // Seq (logging) — opcional, no usa GetRequired
        var seqUrl = Environment.GetEnvironmentVariable("Serilog__WriteTo__1__Args__serverUrl");
        if (!string.IsNullOrWhiteSpace(seqUrl))
        {
            configuration["Serilog:WriteTo:1:Args:serverUrl"] = seqUrl;
            configuration["Serilog:WriteTo:1:Args:apiKey"] =
                Environment.GetEnvironmentVariable("Serilog__WriteTo__1__Args__apiKey") ?? "";
        }
    }

    // ─── Validación ──────────────────────────────────────────────────────

    /// <summary>
    /// Obtiene una variable de entorno obligatoria. Lanza excepción si no existe o está vacía.
    /// </summary>
    public static string GetRequiredEnvironmentVariable(string variableName)
    {
        var value = Environment.GetEnvironmentVariable(variableName);
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"Variable de entorno requerida '{variableName}' no está configurada o está vacía. " +
                $"Verificar archivo .env o variables de entorno del sistema.");
        }
        return value;
    }

    /// <summary>
    /// Valida que TODAS las variables requeridas existen ANTES de arrancar.
    /// Devuelve lista de errores. Si está vacía, todo OK.
    /// Llamar desde Program.cs para fail-fast.
    /// </summary>
    public static List<string> ValidateRequiredEnvironmentVariables()
    {
        var requiredVars = new[]
        {
            "ConnectionStrings__DefaultConnection",
            "JWT__SecretKey",
            "JWT__Issuer",
            "JWT__Audience",
            "JWT__ExpirationHours",
            "AllowedOrigins"
        };

        var errors = new List<string>();
        foreach (var varName in requiredVars)
        {
            var value = Environment.GetEnvironmentVariable(varName);
            if (string.IsNullOrWhiteSpace(value))
            {
                errors.Add($"Variable requerida '{varName}' no encontrada o vacía.");
            }
        }

        return errors;
    }
}
Ejemplo: Uso de IOptions<T> en servicios
// Options class — refleja la estructura de appsettings.json
public class JwtOptions
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationHours { get; set; }
}

// Servicio que consume la configuración tipada
public class TokenService
{
    private readonly JwtOptions _jwtOptions;

    public TokenService(IOptions<JwtOptions> jwtOptions)
    {
        _jwtOptions = jwtOptions.Value;
    }

    public string GenerarToken(Usuario usuario)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
        // ... lógica de generación de token
    }
}
Flujo completo de configuración
┌─────────────────────────────────────────────────────────────────┐
│  .env (raíz del repo)                                           │
│  ConnectionStrings__DefaultConnection=Host=localhost;Port=...   │
│  JWT__SecretKey=ClaveSecreta...                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ DotNetEnv.Load()
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Environment.GetEnvironmentVariable()                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ ConfigurationExtensions
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  IConfiguration                                                 │
│  configuration["ConnectionStrings:DefaultConnection"] = valor   │
│  configuration["Jwt:SecretKey"] = valor                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ IOptions<T> binding
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Services (via DI)                                              │
│  IOptions<JwtOptions> → _jwtOptions.SecretKey                  │
└─────────────────────────────────────────────────────────────────┘
Variables de entorno en despliegue (EC2 / Fargate)
# AWS Fargate — Task Definition > Container > Environment Variables
# Secretos desde AWS Secrets Manager o Parameter Store:
#   ConnectionStrings__DefaultConnection → arn:aws:secretsmanager:...
#   JWT__SecretKey → arn:aws:ssm:...:parameter/miapp/jwt-secret

# AWS EC2 — Variables de entorno en systemd service o user data
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=rds-endpoint;Port=5432;Database=miapp;Username=app_user;Password=***
JWT__SecretKey=***
JWT__Issuer=https://api.miapp.com
JWT__Audience=https://miapp.com
JWT__ExpirationHours=8
AllowedOrigins=https://miapp.com,https://www.miapp.com
Serilog__WriteTo__1__Args__serverUrl=https://seq.miapp.com
Serilog__WriteTo__1__Args__apiKey=***
Añadir nuevas variables de entorno (checklist)
Cuando necesites añadir una nueva variable de entorno al proyecto:

.env.example — Añadir la clave (sin valor) para documentar
.env — Añadir con valor de desarrollo local
appsettings.json — Añadir la clave con valor vacío ("", 0, false)
ConfigurationExtensions — Añadir mapeo en el método correspondiente (o crear uno nuevo)
ValidateRequiredEnvironmentVariables() — Añadir al array requiredVars si es obligatoria
Options class — Añadir propiedad si se usa con IOptions<T>
AWS Task Definition / Parameter Store — Añadir en staging/producción
Patrones Avanzados (Opcional)
CQRS con MediatR
Cuándo usar: Proyectos complejos con lógica de negocio pesada, separación estricta lectura/escritura.

Command (Escritura)
public record Crear{Entidad}Command(string Nombre, string CreadoPor) : IRequest<{Entidad}Dto>;

public class Crear{Entidad}CommandHandler : IRequestHandler<Crear{Entidad}Command, {Entidad}Dto>
{
    private readonly I{Entidad}Repositorio _repositorio;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;

    public Crear{Entidad}CommandHandler(
        I{Entidad}Repositorio repositorio,
        IMapper mapper,
        IUnitOfWork unitOfWork)
    {
        _repositorio = repositorio;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
    }

    public async Task<{Entidad}Dto> Handle(Crear{Entidad}Command request, CancellationToken cancellationToken)
    {
        var entidad = new {Entidad}(request.Nombre, request.CreadoPor);
        await _repositorio.AgregarAsync(entidad);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<{Entidad}Dto>(entidad);
    }
}
Query (Lectura)
public record Obtener{Entidad}PorIdQuery(int Id) : IRequest<{Entidad}Dto?>;

public class Obtener{Entidad}PorIdQueryHandler : IRequestHandler<Obtener{Entidad}PorIdQuery, {Entidad}Dto?>
{
    private readonly I{Entidad}Repositorio _repositorio;
    private readonly IMapper _mapper;

    public Obtener{Entidad}PorIdQueryHandler(I{Entidad}Repositorio repositorio, IMapper mapper)
    {
        _repositorio = repositorio;
        _mapper = mapper;
    }

    public async Task<{Entidad}Dto?> Handle(Obtener{Entidad}PorIdQuery request, CancellationToken cancellationToken)
    {
        var entidad = await _repositorio.ObtenerPorIdAsync(request.Id);
        return entidad == null ? null : _mapper.Map<{Entidad}Dto>(entidad);
    }
}
Controller con MediatR
[ApiController]
[Route("api/v1/[controller]")]
public class {Entidad}Controller : ControllerBase
{
    private readonly IMediator _mediator;

    public {Entidad}Controller(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<{Entidad}Dto>>> ObtenerPorId(int id)
    {
        var query = new Obtener{Entidad}PorIdQuery(id);
        var resultado = await _mediator.Send(query);

        if (resultado == null)
            return NotFound();

        return Ok(ApiResponse<{Entidad}Dto>.Exitoso(resultado));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<{Entidad}Dto>>> Crear([FromBody] Crear{Entidad}Dto dto)
    {
        var command = new Crear{Entidad}Command(dto.Nombre, User.Identity?.Name ?? "sistema");
        var resultado = await _mediator.Send(command);

        return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id },
            ApiResponse<{Entidad}Dto>.Exitoso(resultado, "Entidad creada exitosamente"));
    }
}
Pipeline Behavior (Validación)
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(context, cancellationToken)));
        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}
Registro MediatR en DI
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});
Specification Pattern (DDD)
Cuándo usar: Queries complejas reutilizables, reglas de negocio en el dominio.

Specification Base
public abstract class Specification<T>
{
    public abstract Expression<Func<T, bool>> ToExpression();

    public bool IsSatisfiedBy(T entity)
    {
        Func<T, bool> predicate = ToExpression().Compile();
        return predicate(entity);
    }
}
Specification Concreta
public class {Entidad}ActivoSpecification : Specification<{Entidad}>
{
    public override Expression<Func<{Entidad}, bool>> ToExpression()
    {
        return entidad => entidad.Activo && !entidad.Eliminado;
    }
}

public class {Entidad}PorNombreSpecification : Specification<{Entidad}>
{
    private readonly string _nombre;

    public {Entidad}PorNombreSpecification(string nombre)
    {
        _nombre = nombre;
    }

    public override Expression<Func<{Entidad}, bool>> ToExpression()
    {
        return entidad => entidad.Nombre.Contains(_nombre);
    }
}
Uso en Repositorio
public interface IRepositorioBase<T> where T : class
{
    Task<IEnumerable<T>> ObtenerPorSpecificationAsync(Specification<T> specification);
}

public class RepositorioBase<T> : IRepositorioBase<T> where T : class
{
    protected readonly DbContext _contexto;

    public async Task<IEnumerable<T>> ObtenerPorSpecificationAsync(Specification<T> specification)
    {
        return await _contexto.Set<T>()
            .Where(specification.ToExpression())
            .AsNoTracking()
            .ToListAsync();
    }
}
Uso en Servicio
public async Task<IEnumerable<{Entidad}Dto>> ObtenerActivosAsync()
{
    var specification = new {Entidad}ActivoSpecification();
    var entidades = await _repositorio.ObtenerPorSpecificationAsync(specification);
    return _mapper.Map<IEnumerable<{Entidad}Dto>>(entidades);
}
Combinación de Specifications
public class AndSpecification<T> : Specification<T>
{
    private readonly Specification<T> _left;
    private readonly Specification<T> _right;

    public AndSpecification(Specification<T> left, Specification<T> right)
    {
        _left = left;
        _right = right;
    }

    public override Expression<Func<T, bool>> ToExpression()
    {
        var leftExpression = _left.ToExpression();
        var rightExpression = _right.ToExpression();

        var parameter = Expression.Parameter(typeof(T));
        var combined = Expression.AndAlso(
            Expression.Invoke(leftExpression, parameter),
            Expression.Invoke(rightExpression, parameter)
        );

        return Expression.Lambda<Func<T, bool>>(combined, parameter);
    }
}

// Uso
var activosYConNombre = new AndSpecification<{Entidad}>(
    new {Entidad}ActivoSpecification(),
    new {Entidad}PorNombreSpecification("ejemplo")
);
Resiliencia HTTP con Polly (.NET 8+)
Cuándo usar: Siempre que la aplicación llame a APIs externas o microservicios. Nunca hacer new HttpClient() directamente.

Paquete: Microsoft.Extensions.Http.Resilience (basado en Polly v8, integrado con IHttpClientFactory).

dotnet add package Microsoft.Extensions.Http.Resilience
Interfaz del cliente HTTP (Application)
// Application/Interfaces/IServicioExternoCliente.cs
public interface IServicioExternoCliente
{
    Task<ResultadoExternoDto?> ObtenerDatosAsync(string identificador, CancellationToken cancellationToken = default);
    Task<bool> EnviarNotificacionAsync(NotificacionDto notificacion, CancellationToken cancellationToken = default);
}
Implementación del cliente HTTP (Infrastructure)
// Infrastructure/HttpClients/ServicioExternoCliente.cs
public class ServicioExternoCliente : IServicioExternoCliente
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ServicioExternoCliente> _logger;

    public ServicioExternoCliente(HttpClient httpClient, ILogger<ServicioExternoCliente> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<ResultadoExternoDto?> ObtenerDatosAsync(string identificador, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Consultando servicio externo para {Identificador}", identificador);

        var response = await _httpClient.GetAsync($"/api/datos/{identificador}", cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Servicio externo respondió {StatusCode} para {Identificador}",
                response.StatusCode, identificador);
            return null;
        }

        return await response.Content.ReadFromJsonAsync<ResultadoExternoDto>(cancellationToken: cancellationToken);
    }

    public async Task<bool> EnviarNotificacionAsync(NotificacionDto notificacion, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.PostAsJsonAsync("/api/notificaciones", notificacion, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}
Registro con resiliencia (Program.cs)
// Opción 1: Resiliencia estándar (recomendado — cubre la mayoría de casos)
builder.Services.AddHttpClient<IServicioExternoCliente, ServicioExternoCliente>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["ServiciosExternos:ServicioExterno:BaseUrl"]
            ?? throw new InvalidOperationException("ServiciosExternos:ServicioExterno:BaseUrl no configurada"));
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler();
// Incluye automáticamente: retry (3 intentos con backoff exponencial),
// circuit breaker, timeout por intento (10s), timeout total (30s)

// Opción 2: Resiliencia personalizada
builder.Services.AddHttpClient<IServicioExternoCliente, ServicioExternoCliente>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["ServiciosExternos:ServicioExterno:BaseUrl"]
            ?? throw new InvalidOperationException("ServiciosExternos:ServicioExterno:BaseUrl no configurada"));
})
.AddResilienceHandler("servicio-externo", builder =>
{
    // Retry con backoff exponencial
    builder.AddRetry(new HttpRetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        Delay = TimeSpan.FromMilliseconds(500),
        BackoffType = DelayBackoffType.Exponential,
        UseJitter = true, // Evita thundering herd
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .HandleResult(r => r.StatusCode == System.Net.HttpStatusCode.TooManyRequests
                            || r.StatusCode >= System.Net.HttpStatusCode.InternalServerError)
    });

    // Circuit Breaker — corta si el servicio está caído
    builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
    {
        SamplingDuration = TimeSpan.FromSeconds(30),
        FailureRatio = 0.5,       // 50% de fallos
        MinimumThroughput = 10,    // Mínimo 10 requests antes de evaluar
        BreakDuration = TimeSpan.FromSeconds(15)
    });

    // Timeout por intento individual
    builder.AddTimeout(TimeSpan.FromSeconds(10));
});
Configuración de URLs externas (variables de entorno)
# .env
SERVICIOS_EXTERNOS_SERVICIO_EXTERNO_BASE_URL=http://localhost:3001
SERVICIOS_EXTERNOS_OTRO_SERVICIO_BASE_URL=http://localhost:3002
# docker-compose.yml (sección environment del servicio api)
- ServiciosExternos__ServicioExterno__BaseUrl=${SERVICIOS_EXTERNOS_SERVICIO_EXTERNO_BASE_URL}
- ServiciosExternos__OtroServicio__BaseUrl=${SERVICIOS_EXTERNOS_OTRO_SERVICIO_BASE_URL}
Múltiples clientes HTTP
// Registrar cada servicio externo como un HttpClient tipado con su propia resiliencia
builder.Services.AddHttpClient<IServicioPagosCliente, ServicioPagosCliente>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiciosExternos:Pagos:BaseUrl"]!);
})
.AddStandardResilienceHandler();

builder.Services.AddHttpClient<IServicioNotificacionesCliente, ServicioNotificacionesCliente>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiciosExternos:Notificaciones:BaseUrl"]!);
})
.AddStandardResilienceHandler();
Reglas de resiliencia HTTP
Regla	Detalle
NUNCA new HttpClient()	Siempre IHttpClientFactory via DI (typed client)
Siempre resiliencia	Mínimo .AddStandardResilienceHandler() en todo cliente HTTP
BaseUrl desde env vars	URLs de servicios externos en variables de entorno, no en appsettings.json
Timeout explícito	Siempre configurar timeout. Sin timeout = request colgado indefinidamente
CancellationToken	Propagar en toda la cadena async hasta el HttpClient
No reintentar POSTs	Retry por defecto solo en GET/HEAD. POST/PUT no son idempotentes — configurar solo si el endpoint externo es idempotente
Logging en fallos	Loguear con Warning cuando un request falla pero se reintenta, Error cuando el circuit breaker se abre
Health Check de dependencias	Agregar health check para cada servicio externo crítico
Tabla de Nomenclatura
Elemento	Convencion	Idioma	Ejemplo
Clases	PascalCase	Espanol	OrdenCompra
Interfaces	IPascalCase	Espanol	IOrdenCompraRepositorio
Metodos	PascalCase	Espanol	ObtenerPorIdAsync
Propiedades	PascalCase	Espanol	FechaCreacion
Variables locales	camelCase	Espanol	ordenActual
Parametros	camelCase	Espanol	idOrden
DTOs	PascalCase+Dto	Espanol	OrdenCompraDto
Validadores	PascalCase+Validador	Espanol	CrearOrdenCompraValidador
Archivos	PascalCase	Espanol	OrdenCompra.cs
Carpetas	PascalCase	Ingles	Entities/, Services/
Mejores Practicas .NET 8+
1. ApiResponse Estandarizado
TODAS las respuestas de controllers deben usar ApiResponse<T>
Respuestas exitosas: ApiResponse<T>.Exitoso(data, mensaje?)
Respuestas fallidas: ApiResponse<T>.Fallido(mensaje, errores?)
Errores de validación: ApiResponse<T>.FallidoValidacion(erroresDict)
2. ProblemDetails para Errores HTTP
Usar ProblemDetails para errores 4xx y 5xx
Incluir Status, Title, Detail, Type (RFC 7807)
El GlobalExceptionHandler convierte excepciones a ProblemDetails automáticamente
3. Validación con FluentValidation
Validadores se ejecutan automáticamente en pipeline
No validar manualmente en controllers
Excepciones ValidationException → 400 Bad Request con ProblemDetails
4. Documentación XML
Agregar <summary> a todos los endpoints
Habilitar generación de XML en .csproj: <GenerateDocumentationFile>true</GenerateDocumentationFile>
Swagger consume automáticamente los comentarios
5. ProducesResponseType
Declarar todos los códigos de estado posibles con [ProducesResponseType]
Incluir tipo de respuesta para cada código
Mejora documentación Swagger y claridad de API
6. Async/Await Obligatorio
Todos los métodos de acceso a datos deben ser async
Usar sufijo Async en nombres de métodos
Nunca usar .Result o .Wait() - riesgo de deadlock
7. Logging Estructurado
Inyectar ILogger<T> en todos los servicios y controllers
Usar log levels apropiados: LogInformation, LogWarning, LogError
Incluir contexto en logs: IDs, operaciones, parámetros
8. Dependency Injection
Usar scopes correctos:
AddScoped: Servicios, Repositorios (una instancia por request)
AddSingleton: Configuraciones, caches (una instancia global)
AddTransient: Validadores (nueva instancia cada vez)
9. Entity Framework Core 8
Usar expresiones LINQ en lugar de SQL raw
Aplicar AsNoTracking() en queries de solo lectura
Configurar índices en {Entidad}Configuracion.cs
Usar migrations para cambios de schema
10. Seguridad
NUNCA exponer entidades de dominio directamente en API
Siempre mapear Entidad ↔ DTO
Validar TODAS las entradas del usuario
Usar [Authorize] para endpoints protegidos
Sanitizar mensajes de error (no exponer detalles internos)
11. Paginación
Usar PagedResult<T> para listas grandes
Parámetros: pageNumber (mínimo 1), pageSize (máximo recomendado: 100)
Incluir metadatos: TotalCount, TotalPages, HasNextPage, HasPreviousPage
Aplicar AsNoTracking() en queries de solo lectura
12. Transacciones
Usar IUnitOfWork para coordinar múltiples operaciones
BeginTransactionAsync() → operaciones → CommitTransactionAsync()
Siempre hacer RollbackTransactionAsync() en catch
Unit of Work automáticamente usa transacciones para SaveChangesAsync()
13. Auditoría
Campos obligatorios: CreadoPor, FechaCreacion
Campos opcionales: ModificadoPor, FechaModificacion
Capturar usuario desde HttpContext.User.Identity.Name
Registrar todas las operaciones de escritura en logs
14. Concurrencia Optimista
Usar [Timestamp] o RowVersion en entidades
EF Core detecta automáticamente conflictos
Capturar DbUpdateConcurrencyException y retornar 409 Conflict
Mensaje: "El registro fue modificado por otro usuario"
15. Health Checks
Endpoint: /health (público, sin autenticación)
Verificar: base de datos, servicios externos, memoria
Respuesta: Healthy, Degraded, Unhealthy
Usado por orquestadores (Kubernetes, Docker Swarm)
16. Rate Limiting (.NET 8+)
Proteger endpoints contra abuso
Estrategias: Fixed Window, Sliding Window, Token Bucket
Configurar límites por endpoint o globalmente
Retornar 429 Too Many Requests cuando se excede
17. CORS (Cross-Origin Resource Sharing)
Obligatorio si la API es consumida por frontends en otros dominios
Desarrollo: AllowAnyOrigin() (solo para desarrollo local)
Producción: NUNCA usar AllowAnyOrigin(), especificar orígenes exactos
Con credenciales: NO se puede combinar AllowAnyOrigin() + AllowCredentials()
Orden en pipeline: CORS debe ir antes de UseAuthorization()
Configurar en appsettings.json: lista de orígenes permitidos
Pre-flight requests: navegador envía OPTIONS antes de request real
18. Logging Estructurado
Serilog recomendado para .NET 8+ (mejor que logging nativo)
Formato JSON para queries y análisis (Seq, ELK, Datadog)
Enrichers: FromLogContext, MachineName, EnvironmentName, ThreadId
Sinks: Console (desarrollo), File (siempre), Seq/ELK (producción)
Niveles: Verbose, Debug, Information, Warning, Error, Fatal
Logs estructurados: _logger.LogInformation("Usuario {UserId} creó orden {OrderId}", userId, orderId)
NO concatenar strings: ❌ $"Usuario {userId}" ✅ usar parámetros
Filtrar logs de EF Core y AspNetCore para reducir ruido
Request logging: usar UseSerilogRequestLogging() con enrichers personalizados
Correlation IDs: implementar middleware para rastreo distribuido
19. Autenticación y Autorización
JWT (JSON Web Token): estándar para autenticación stateless
Configuración: Issuer, Audience, SecretKey (mínimo 32 caracteres), ExpirationHours
Claims: Sub (userId), UniqueName, Role, claims personalizados
Validación: ValidateIssuer, ValidateAudience, ValidateLifetime, ValidateIssuerSigningKey
[Authorize]: a nivel de controller o action
[Authorize(Roles = "Admin")]: autorización basada en roles
[Authorize(Policy = "NombrePolicy")]: autorización basada en políticas
Políticas personalizadas: IAuthorizationRequirement + AuthorizationHandler
Claims: información adicional en el token (permisos, departamento, etc.)
Refresh Tokens: implementar para renovar tokens expirados sin re-login
401 Unauthorized: no autenticado (sin token o token inválido)
403 Forbidden: autenticado pero sin permisos suficientes
20. Performance y Caching
Response Caching: [ResponseCache] para endpoints GET idempotentes
Output Caching (.NET 8+): más potente que Response Caching
Memory Cache: datos volátiles en memoria (IMemoryCache)
Distributed Cache: Redis para aplicaciones escalables (IDistributedCache)
AsNoTracking(): SIEMPRE en queries de solo lectura (mejora 30-40%)
Compiled Queries: para queries repetitivas de alto rendimiento
Select específico: evitar Select *, proyectar solo campos necesarios
Batch operations: agrupar múltiples inserts/updates
Connection pooling: configurar min/max connections en connection string
DTOs ligeros: no incluir relaciones innecesarias en responses
Template: implementacion-be.md
# Implementacion Backend: {Titulo de la Tarea}

## Informacion General
- **Task ID:** {task_id}
- **Stack:** backend
- **Fecha:** {YYYY-MM-DD}
- **Desarrollador:** {team-name} — Desarrollador Backend
- **Inputs:** plan-tecnico-be.md, requisitos-be.md

## Archivos Creados
| # | Archivo | Capa | Descripcion |
|---|---------|------|-------------|
| 1 | {ruta/completa} | Domain | {Descripcion} |

## Archivos Modificados
| # | Archivo | Cambio Realizado |
|---|---------|-----------------|
| 1 | Program.cs | Agregado registro DI para {entidad} |

## Migracion EF Core
- Nombre: {nombre_migracion}
- Comando: `dotnet ef migrations add {nombre}`
- Tablas afectadas: {lista}

## Patrones Aplicados

### ApiResponse
- [ ] Todos los endpoints retornan `ApiResponse<T>`
- [ ] Códigos HTTP apropiados (200, 201, 400, 404, 500)
- [ ] Mensajes descriptivos en español

### Validación
- [ ] FluentValidation configurado para todos los DTOs de entrada
- [ ] Validadores registrados en DI
- [ ] Errores de validación retornan 400 con ProblemDetails

### Manejo de Excepciones
- [ ] GlobalExceptionHandler registrado
- [ ] ProblemDetails configurado
- [ ] Excepciones específicas mapeadas correctamente

### Documentación
- [ ] Comentarios XML en todos los endpoints
- [ ] ProducesResponseType para todos los códigos de estado
- [ ] Swagger genera documentación completa

### CRUD Completo
- [ ] GET (listar todos)
- [ ] GET por ID
- [ ] POST (crear)
- [ ] PUT (actualizar)
- [ ] DELETE (eliminar)
- [ ] GET paginado

### Autenticación y Autorización
- [ ] JWT configurado (SecretKey, Issuer, Audience, Expiration)
- [ ] AddAuthentication y AddJwtBearer registrados
- [ ] Servicio IJwtServicio implementado
- [ ] [Authorize] aplicado en endpoints protegidos
- [ ] Roles o políticas configuradas según requisitos
- [ ] 401/403 en ProducesResponseType de endpoints protegidos
- [ ] UseAuthentication antes de UseAuthorization en pipeline

### CORS y Seguridad
- [ ] CORS configurado según ambiente
- [ ] Políticas restrictivas en producción
- [ ] Orígenes permitidos en appsettings.json
- [ ] CORS en pipeline antes de UseAuthorization

### Logging
- [ ] Serilog configurado (o logging nativo)
- [ ] Logs estructurados con parámetros (no concatenación)
- [ ] Request logging configurado
- [ ] Scopes en operaciones críticas
- [ ] Filtros para reducir ruido (EF Core, AspNetCore)
- [ ] Sinks configurados: Console, File, Seq (producción)

### Patrones Avanzados
- [ ] Unit of Work implementado y registrado en DI
- [ ] Configuración EF Core para cada entidad
- [ ] Health Checks configurado
- [ ] Rate Limiting configurado (opcional)

### Auditoría y Seguridad
- [ ] Campos de auditoría en entidades
- [ ] Token de concurrencia (RowVersion)
- [ ] Logging en todas las operaciones de servicio
- [ ] Validación de permisos en endpoints sensibles

### Performance y Caching
- [ ] Output Caching o Response Caching en endpoints GET
- [ ] Memory Cache implementado en servicios
- [ ] AsNoTracking() en queries de solo lectura
- [ ] Cache invalidation al modificar datos
- [ ] Distributed Cache (Redis) configurado si es necesario

### Resiliencia HTTP (si aplica)
- [ ] `IHttpClientFactory` para todo cliente HTTP (nunca `new HttpClient()`)
- [ ] `.AddStandardResilienceHandler()` o resiliencia personalizada en cada cliente
- [ ] BaseUrl de servicios externos desde variables de entorno
- [ ] Timeout explícito configurado
- [ ] `CancellationToken` propagado en llamadas HTTP
- [ ] Health Check para servicios externos críticos

### Configuración y Variables de Entorno
- [ ] `.env` existe con todas las variables necesarias
- [ ] `.env.example` versionado con keys sin valores
- [ ] `.env` en `.gitignore`
- [ ] `appsettings*.json` sin secretos hardcodeados (connection strings, API keys, JWT secrets)
- [ ] `appsettings.json` solo contiene config no sensible (log levels, rate limiting)
- [ ] `docker-compose.yml` usa `env_file: - .env` y `${VAR}` para variables
- [ ] `Dockerfile` sin `ENV` con valores secretos
- [ ] Serilog configurado con sinks apropiados
- [ ] Connection string viene de variable de entorno
- [ ] JWT SecretKey viene de variable de entorno
- [ ] CORS origins desde variable de entorno
- [ ] `IOptions<T>` para toda config tipada
- [ ] Validación al arranque si falta variable crítica (`?? throw new InvalidOperationException`)

## Notas de Implementacion
- {Decision tecnica y justificacion}
- {Desviacion del plan tecnico y razon (si aplica)}

## Verificacion
- [ ] Codigo compila sin errores
- [ ] Sigue plan tecnico del Arquitecto
- [ ] Sigue patrones existentes del proyecto
- [ ] Nomenclatura en espanol
- [ ] DI registrado correctamente
- [ ] Migracion generada (si aplica)
Reglas
El codigo DEBE compilar
Seguir el plan tecnico — implementar lo especificado, no inventar
Seguir patrones existentes del proyecto
Todo en espanol — clases, metodos, propiedades, mensajes error
Entidades con private set — sin setters publicos
FluentValidation para toda validacion — no validar en controllers
AutoMapper para todo mapeo — sin mapeo manual entidad↔DTO
Controllers delgados — solo llaman servicio
RepositorioBase<T> — heredar del base, no crear desde cero
Registrar DI — todo componente nuevo en contenedor
Orden: Domain → Application → Infrastructure → Api
ApiResponse obligatorio — todos los endpoints retornan ApiResponse<T>
ProblemDetails para errores — 4xx y 5xx usan formato RFC 7807
Comentarios XML — todos los endpoints documentados con <summary>
ProducesResponseType — declarar todos los códigos de estado posibles
Async/Await — sin .Result o .Wait(), solo await
Logging en servicios — operaciones críticas deben loguearse
No exponer entidades — siempre usar DTOs en API
CRUD completo — implementar GET, POST, PUT, DELETE + paginado
Unit of Work — usar para transacciones y coordinación de repositorios
Auditoría obligatoria — campos CreadoPor, FechaCreacion, ModificadoPor, FechaModificacion
Concurrencia optimista — usar RowVersion en entidades para detectar conflictos
Health Checks — endpoint /health para monitoreo
Configuración EF Core — usar IEntityTypeConfiguration<T> para cada entidad
CORS obligatorio — configurar políticas según ambiente (restrictivo en producción)
Logging estructurado — usar Serilog con parámetros, scopes y enrichers
UseAuthentication — siempre antes de UseAuthorization() en pipeline
CORS en pipeline — debe ir antes de UseAuthorization() y después de UseHttpsRedirection()
Correlation IDs — implementar middleware para rastreo distribuido de requests
Caching inteligente — Output Caching para endpoints GET, Memory Cache en servicios
AsNoTracking — OBLIGATORIO en queries de solo lectura (mejora 30-40% performance)
Invalidar cache — al crear/actualizar/eliminar, remover entradas de cache relacionadas
appsettings por ambiente — Development, Staging, Production con configs específicas
Secrets seguros — NUNCA hardcodear en appsettings*.json ni en código. Toda config sensible via variables de entorno (local: .env, desplegado: EC2/Fargate secrets)
JWT obligatorio — configurar autenticación con SecretKey seguro (min 32 chars), key desde variable de entorno
.env en .gitignore — SIEMPRE. Crear .env.example con keys sin valores para documentar
Docker Compose lee de .env — usar env_file: - .env y ${VAR} interpolación. NUNCA hardcodear valores en docker-compose.yml
Dockerfile limpio — sin ENV con valores secretos. Variables inyectadas en runtime por Docker Compose o orchestrator
appsettings.json sin secretos — solo config no sensible (log levels, rate limiting). Connection strings, API keys, JWT secrets vienen de variables de entorno
Validar config al arranque — si falta variable de entorno crítica, throw InvalidOperationException con mensaje claro
[Authorize] — aplicar en endpoints que requieren autenticación
Roles y políticas — usar [Authorize(Roles)] o [Authorize(Policy)] según necesidad
Claims en token — incluir UserId, Username, Roles y claims personalizados
401 vs 403 — retornar 401 si no autenticado, 403 si sin permisos
Resiliencia HTTP obligatoria — toda llamada a API externa via IHttpClientFactory con .AddStandardResilienceHandler() mínimo. NUNCA new HttpClient()
URLs externas desde env vars — BaseUrl de servicios externos en variables de entorno, no hardcodeadas en appsettings.json
Comunicacion
Completado:

DESARROLLADOR BACKEND COMPLETADO — Outputs: implementacion-be.md + codigo — Resumen: {n} creados, {n} modificados, migracion: Si/No, compila: Si/No
Bloqueo: [BLOCKER] Desarrollador BE: {razon}. Necesito: {que}. Problema en plan: [FEEDBACK] Desarrollador BE → Arquitecto BE: Problema en {seccion}. Detalle: {desc}. Propuesta: {alternativa}.