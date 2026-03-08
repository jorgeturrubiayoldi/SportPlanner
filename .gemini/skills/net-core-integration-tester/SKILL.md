name: net-core-integration-tester description: Testing de integracion .NET 8+ con WebApplicationFactory, TestContainers y bases de datos reales license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code. Requiere .NET 8+ SDK metadata: role: QA Engineer

QA Integración — Testing de Integración .NET 8+
Rol: Especialista en testing de integración con WebApplicationFactory, TestContainers y bases de datos reales.

Responsabilidad: Crear tests de integración que verifican la interacción entre capas (API → Application → Infrastructure → Database), usando contenedores Docker para dependencias externas (PostgreSQL, SQL Server, Redis, RabbitMQ). Asegurar que el sistema funciona end-to-end desde el controller hasta la base de datos.

Alcance: Tests de integración de API completa (HTTP requests → controllers → servicios → repositorios → DB), validación de migraciones EF Core, testing de autenticación/autorización, caching, transacciones, y servicios externos con containers.

Información General
Framework: xUnit 2.6+
Web Testing: WebApplicationFactory (ASP.NET Core)
Containers: Testcontainers.DotNet 3.7+
Database: Testcontainers.PostgreSql / Testcontainers.MsSql
Cache: Testcontainers.Redis
Assertions: FluentAssertions 6.12+
HTTP: HttpClient con WebApplicationFactory
Patrón: AAA (Arrange-Act-Assert)
1. Estructura de Proyecto de Tests
tests/
├── {Proyecto}.IntegrationTests/
│   ├── Controllers/
│   │   └── {Entidad}ControllerTests.cs
│   ├── Repositories/
│   │   └── {Entidad}RepositorioTests.cs
│   ├── Infrastructure/
│   │   ├── DatabaseFixture.cs
│   │   ├── WebApplicationFactoryFixture.cs
│   │   └── ContainerFixture.cs
│   ├── Helpers/
│   │   ├── HttpClientExtensions.cs
│   │   └── DatabaseSeeder.cs
│   ├── appsettings.IntegrationTests.json
│   └── {Proyecto}.IntegrationTests.csproj
2. Configuración de Proyecto
{Proyecto}.IntegrationTests.csproj

<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
    <PackageReference Include="xunit" Version="2.6.6" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Testcontainers" Version="3.7.0" />
    <PackageReference Include="Testcontainers.PostgreSql" Version="3.7.0" />
    <PackageReference Include="Testcontainers.MsSql" Version="3.7.0" />
    <PackageReference Include="Testcontainers.Redis" Version="3.7.0" />
    <PackageReference Include="Respawn" Version="6.2.0" />
    <PackageReference Include="Bogus" Version="35.4.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\{Proyecto}.Api\{Proyecto}.Api.csproj" />
    <ProjectReference Include="..\..\src\{Proyecto}.Infrastructure\{Proyecto}.Infrastructure.csproj" />
  </ItemGroup>

  <ItemGroup>
    <None Update="appsettings.IntegrationTests.json">
      <CopyToOutputDirectory>Always</CopyToOutputDirectory>
    </None>
  </ItemGroup>

</Project>
3. WebApplicationFactory Personalizada
public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer;
    private readonly RedisContainer _redisContainer;

    public CustomWebApplicationFactory()
    {
        _dbContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("testdb")
            .WithUsername("testuser")
            .WithPassword("testpass")
            .WithPortBinding(5432, true) // Puerto aleatorio
            .Build();

        _redisContainer = new RedisBuilder()
            .WithImage("redis:7-alpine")
            .Build();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddJsonFile("appsettings.IntegrationTests.json");
        });

        builder.ConfigureTestServices(services =>
        {
            // Remover DbContext original
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Agregar DbContext con connection string del container
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(_dbContainer.GetConnectionString());
            });

            // Configurar Redis del container
            var redisDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IConnectionMultiplexer));

            if (redisDescriptor != null)
            {
                services.Remove(redisDescriptor);
            }

            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect(_redisContainer.GetConnectionString()));

            // Aplicar migraciones
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.Migrate();
        });

        builder.UseEnvironment("IntegrationTests");
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        await _redisContainer.StartAsync();
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
        await _redisContainer.DisposeAsync();
        await base.DisposeAsync();
    }
}
4. Collection Fixture para Compartir Factory
[CollectionDefinition("Integration Tests")]
public class IntegrationTestCollection : ICollectionFixture<CustomWebApplicationFactory>
{
}

[Collection("Integration Tests")]
public class BaseIntegrationTest : IAsyncLifetime
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;
    protected readonly ApplicationDbContext DbContext;
    private Respawner _respawner = null!;

    public BaseIntegrationTest(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();

        var scope = factory.Services.CreateScope();
        DbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }

    public async Task InitializeAsync()
    {
        // Inicializar Respawn para limpiar DB entre tests
        _respawner = await Respawner.CreateAsync(
            DbContext.Database.GetDbConnection(),
            new RespawnerOptions
            {
                DbAdapter = DbAdapter.Postgres,
                SchemasToInclude = new[] { "public" },
                TablesToIgnore = new[] { new Npgsql.NpgsqlCommand("__EFMigrationsHistory") }
            });
    }

    public async Task DisposeAsync()
    {
        // Limpiar base de datos después de cada test
        await _respawner.ResetAsync(DbContext.Database.GetDbConnection());
    }

    protected async Task<T> AgregarEntidadAsync<T>(T entidad) where T : class
    {
        DbContext.Set<T>().Add(entidad);
        await DbContext.SaveChangesAsync();
        return entidad;
    }
}
5. Testing de Controllers (API Integration)
[Collection("Integration Tests")]
public class {Entidad}ControllerTests : BaseIntegrationTest
{
    public {Entidad}ControllerTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task Get_ConEntidadesExistentes_RetornaListaCompleta()
    {
        // Arrange
        var entidades = new List<{Entidad}>
        {
            new {Entidad}("Entidad 1", "Descripción 1"),
            new {Entidad}("Entidad 2", "Descripción 2")
        };

        foreach (var entidad in entidades)
        {
            await AgregarEntidadAsync(entidad);
        }

        // Act
        var response = await Client.GetAsync("/api/v1/{entidad}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<{Entidad}Dto>>>();

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().HaveCount(2);
        apiResponse.Data.First().Nombre.Should().Be("Entidad 1");
    }

    [Fact]
    public async Task GetById_ConIdExistente_RetornaEntidad()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Test", "Descripción"));

        // Act
        var response = await Client.GetAsync($"/api/v1/{entidad}/{entidad.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Id.Should().Be(entidad.Id);
        apiResponse.Data.Nombre.Should().Be("Test");
    }

    [Fact]
    public async Task GetById_ConIdInexistente_Retorna404()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/{entidad}/9999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails!.Status.Should().Be(404);
    }

    [Fact]
    public async Task Post_ConDtoValido_CreaEntidadYRetorna201()
    {
        // Arrange
        var dto = new Crear{Entidad}Dto
        {
            Nombre = "Nueva Entidad",
            Descripcion = "Nueva descripción"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/{entidad}", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Id.Should().BeGreaterThan(0);
        apiResponse.Data.Nombre.Should().Be("Nueva Entidad");

        // Verificar que se creó en la base de datos
        var entidadDb = await DbContext.{Entidades}.FindAsync(apiResponse.Data.Id);
        entidadDb.Should().NotBeNull();
        entidadDb!.Nombre.Should().Be("Nueva Entidad");
    }

    [Fact]
    public async Task Post_ConDtoInvalido_Retorna400ConErroresValidacion()
    {
        // Arrange
        var dto = new Crear{Entidad}Dto
        {
            Nombre = "", // Inválido
            Descripcion = new string('A', 1000) // Muy largo
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/{entidad}", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
        apiResponse.Errores.Should().NotBeEmpty();
        apiResponse.Errores.Should().Contain(e => e.Contains("Nombre"));
    }

    [Fact]
    public async Task Put_ConDtoValido_ActualizaEntidad()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Original", "Descripción original"));

        var dto = new Actualizar{Entidad}Dto
        {
            Nombre = "Actualizado",
            Descripcion = "Descripción actualizada"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/v1/{entidad}/{entidad.Id}", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data!.Nombre.Should().Be("Actualizado");

        // Verificar en DB
        var entidadDb = await DbContext.{Entidades}.FindAsync(entidad.Id);
        entidadDb!.Nombre.Should().Be("Actualizado");
        entidadDb.FechaModificacion.Should().NotBeNull();
    }

    [Fact]
    public async Task Delete_ConIdExistente_EliminaEntidad()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("A Eliminar", "Descripción"));

        // Act
        var response = await Client.DeleteAsync($"/api/v1/{entidad}/{entidad.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verificar que se eliminó de DB
        var entidadDb = await DbContext.{Entidades}.FindAsync(entidad.Id);
        entidadDb.Should().BeNull();
    }
}
6. Testing de Autenticación JWT
[Collection("Integration Tests")]
public class AutenticacionIntegrationTests : BaseIntegrationTest
{
    public AutenticacionIntegrationTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task Get_SinToken_Retorna401()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/{entidad}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Get_ConTokenValido_Retorna200()
    {
        // Arrange
        var token = await ObtenerTokenAsync("usuario@test.com", "Password123!");

        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await Client.GetAsync("/api/v1/{entidad}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Post_ConRolInsuficiente_Retorna403()
    {
        // Arrange
        var token = await ObtenerTokenAsync("usuario@test.com", "Password123!", roles: new[] { "Usuario" });

        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var dto = new Crear{Entidad}Dto { Nombre = "Test" };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/{entidad}", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Post_ConRolAdministrador_Retorna201()
    {
        // Arrange
        var token = await ObtenerTokenAsync(
            "admin@test.com",
            "Password123!",
            roles: new[] { "Administrador" });

        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var dto = new Crear{Entidad}Dto { Nombre = "Test" };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/{entidad}", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    private async Task<string> ObtenerTokenAsync(
        string email,
        string password,
        string[]? roles = null)
    {
        var loginDto = new LoginDto { Email = email, Password = password };

        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", loginDto);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TokenDto>>();

        return result!.Data!.Token;
    }
}
7. Testing de Repositorios
[Collection("Integration Tests")]
public class {Entidad}RepositorioTests : BaseIntegrationTest
{
    private readonly I{Entidad}Repositorio _repositorio;

    public {Entidad}RepositorioTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
        var scope = factory.Services.CreateScope();
        _repositorio = scope.ServiceProvider.GetRequiredService<I{Entidad}Repositorio>();
    }

    [Fact]
    public async Task AgregarAsync_ConEntidadValida_GuardaEnBaseDeDatos()
    {
        // Arrange
        var entidad = new {Entidad}("Test Repositorio", "Descripción test");

        // Act
        var resultado = await _repositorio.AgregarAsync(entidad);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Id.Should().BeGreaterThan(0);

        var entidadDb = await DbContext.{Entidades}.FindAsync(resultado.Id);
        entidadDb.Should().NotBeNull();
        entidadDb!.Nombre.Should().Be("Test Repositorio");
    }

    [Fact]
    public async Task ObtenerPorIdAsync_ConIdExistente_RetornaEntidad()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Test", "Descripción"));

        // Act
        var resultado = await _repositorio.ObtenerPorIdAsync(entidad.Id);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Id.Should().Be(entidad.Id);
        resultado.Nombre.Should().Be("Test");
    }

    [Fact]
    public async Task ObtenerTodosAsync_ConMultiplesEntidades_RetornaTodasLasEntidades()
    {
        // Arrange
        await AgregarEntidadAsync(new {Entidad}("Entidad 1", "Desc 1"));
        await AgregarEntidadAsync(new {Entidad}("Entidad 2", "Desc 2"));
        await AgregarEntidadAsync(new {Entidad}("Entidad 3", "Desc 3"));

        // Act
        var resultado = await _repositorio.ObtenerTodosAsync();

        // Assert
        resultado.Should().HaveCount(3);
    }

    [Fact]
    public async Task ActualizarAsync_ConCambios_PersisteCambiosEnDB()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Original", "Descripción"));

        // Act
        entidad.Actualizar("Modificado", "Nueva descripción");
        await _repositorio.ActualizarAsync(entidad);

        // Assert
        var entidadDb = await DbContext.{Entidades}
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == entidad.Id);

        entidadDb.Should().NotBeNull();
        entidadDb!.Nombre.Should().Be("Modificado");
        entidadDb.Descripcion.Should().Be("Nueva descripción");
    }

    [Fact]
    public async Task EliminarAsync_ConEntidadExistente_EliminaDeBaseDeDatos()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("A eliminar", "Desc"));

        // Act
        await _repositorio.EliminarAsync(entidad.Id);

        // Assert
        var entidadDb = await DbContext.{Entidades}.FindAsync(entidad.Id);
        entidadDb.Should().BeNull();
    }

    [Fact]
    public async Task ObtenerPaginadoAsync_ConPaginacion_RetornaPaginaCorrecta()
    {
        // Arrange
        for (int i = 1; i <= 25; i++)
        {
            await AgregarEntidadAsync(new {Entidad}($"Entidad {i}", $"Desc {i}"));
        }

        // Act
        var resultado = await _repositorio.ObtenerPaginadoAsync(pageNumber: 2, pageSize: 10);

        // Assert
        resultado.Items.Should().HaveCount(10);
        resultado.TotalCount.Should().Be(25);
        resultado.PageNumber.Should().Be(2);
        resultado.TotalPages.Should().Be(3);
        resultado.HasPreviousPage.Should().BeTrue();
        resultado.HasNextPage.Should().BeTrue();
    }

    [Fact]
    public async Task BuscarAsync_ConFiltro_RetornaSoloCoincidencias()
    {
        // Arrange
        await AgregarEntidadAsync(new {Entidad}("Producto A", "Descripción A"));
        await AgregarEntidadAsync(new {Entidad}("Producto B", "Descripción B"));
        await AgregarEntidadAsync(new {Entidad}("Servicio C", "Descripción C"));

        // Act
        var resultado = await _repositorio.BuscarAsync(e => e.Nombre.Contains("Producto"));

        // Assert
        resultado.Should().HaveCount(2);
        resultado.Should().OnlyContain(e => e.Nombre.StartsWith("Producto"));
    }
}
8. Testing de Transacciones
[Collection("Integration Tests")]
public class TransaccionesIntegrationTests : BaseIntegrationTest
{
    public TransaccionesIntegrationTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task CrearMultiplesEntidades_ConTransaccion_TodasSonCreadasONinguna()
    {
        // Arrange
        var dto1 = new Crear{Entidad}Dto { Nombre = "Entidad 1" };
        var dto2 = new Crear{Entidad}Dto { Nombre = "Entidad 2" };

        var batch = new { Entidades = new[] { dto1, dto2 } };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/{entidad}/batch", batch);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var count = await DbContext.{Entidades}.CountAsync();
        count.Should().Be(2);
    }

    [Fact]
    public async Task CrearMultiplesEntidades_ConErrorEnSegunda_NingunaEsCreada()
    {
        // Arrange
        var dto1 = new Crear{Entidad}Dto { Nombre = "Válido" };
        var dto2 = new Crear{Entidad}Dto { Nombre = "" }; // Inválido

        var batch = new { Entidades = new[] { dto1, dto2 } };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/{entidad}/batch", batch);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var count = await DbContext.{Entidades}.CountAsync();
        count.Should().Be(0); // Rollback - ninguna creada
    }
}
9. Testing de Caching con Redis
[Collection("Integration Tests")]
public class CachingIntegrationTests : BaseIntegrationTest
{
    public CachingIntegrationTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task Get_PrimeraLlamada_AccedeABaseDeDatos()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Test Cache", "Descripción"));

        // Act - Primera llamada
        var response1 = await Client.GetAsync($"/api/v1/{entidad}/{entidad.Id}");
        var apiResponse1 = await response1.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();

        // Act - Segunda llamada (desde caché)
        var response2 = await Client.GetAsync($"/api/v1/{entidad}/{entidad.Id}");
        var apiResponse2 = await response2.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        apiResponse1!.Data.Should().BeEquivalentTo(apiResponse2!.Data);

        // Verificar headers de cache
        response2.Headers.Should().ContainKey("X-Cache");
        response2.Headers.GetValues("X-Cache").First().Should().Be("HIT");
    }

    [Fact]
    public async Task Put_AlActualizar_InvalidaCache()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Original", "Descripción"));

        // Cachear
        await Client.GetAsync($"/api/v1/{entidad}/{entidad.Id}");

        var dto = new Actualizar{Entidad}Dto { Nombre = "Actualizado" };

        // Act
        await Client.PutAsJsonAsync($"/api/v1/{entidad}/{entidad.Id}", dto);

        // Verificar que el caché fue invalidado
        var response = await Client.GetAsync($"/api/v1/{entidad}/{entidad.Id}");
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();

        // Assert
        apiResponse!.Data!.Nombre.Should().Be("Actualizado");
        response.Headers.GetValues("X-Cache").First().Should().Be("MISS");
    }
}
10. Testing de Migraciones EF Core
[Collection("Integration Tests")]
public class MigracionesTests : BaseIntegrationTest
{
    public MigracionesTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task Database_ConMigraciones_TieneTablasEsperadas()
    {
        // Act
        var tablas = await DbContext.Database
            .SqlQuery<string>($"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            .ToListAsync();

        // Assert
        tablas.Should().Contain("{Entidades}");
        tablas.Should().Contain("__EFMigrationsHistory");
    }

    [Fact]
    public async Task Database_ConMigraciones_TieneIndicesEsperados()
    {
        // Act
        var indices = await DbContext.Database
            .SqlQuery<string>($"SELECT indexname FROM pg_indexes WHERE tablename = '{Entidades}'")
            .ToListAsync();

        // Assert
        indices.Should().Contain("IX_{Entidad}_Nombre");
    }

    [Fact]
    public async Task Database_ConMigraciones_TieneConstraintsEsperados()
    {
        // Arrange & Act
        var entidad = new {Entidad}(null!, "Descripción"); // Nombre null

        DbContext.{Entidades}.Add(entidad);

        // Assert
        var act = async () => await DbContext.SaveChangesAsync();
        await act.Should().ThrowAsync<DbUpdateException>();
    }
}
11. Testing de Concurrencia
[Collection("Integration Tests")]
public class ConcurrenciaTests : BaseIntegrationTest
{
    public ConcurrenciaTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task Actualizar_ConConflictoDeConcurrencia_Retorna409()
    {
        // Arrange
        var entidad = await AgregarEntidadAsync(new {Entidad}("Original", "Descripción"));

        // Simular dos actualizaciones concurrentes
        var dto1 = new Actualizar{Entidad}Dto { Nombre = "Actualización 1", RowVersion = entidad.RowVersion };
        var dto2 = new Actualizar{Entidad}Dto { Nombre = "Actualización 2", RowVersion = entidad.RowVersion };

        // Act
        var response1 = await Client.PutAsJsonAsync($"/api/v1/{entidad}/{entidad.Id}", dto1);
        var response2 = await Client.PutAsJsonAsync($"/api/v1/{entidad}/{entidad.Id}", dto2);

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.Conflict); // 409 Conflict
    }
}
12. Database Seeder para Tests
public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!await context.{Entidades}.AnyAsync())
        {
            var faker = new Bogus.Faker<{Entidad}>()
                .CustomInstantiator(f => new {Entidad}(
                    f.Commerce.ProductName(),
                    f.Lorem.Sentence()))
                .RuleFor(e => e.Activo, f => f.Random.Bool());

            var entidades = faker.Generate(50);

            context.{Entidades}.AddRange(entidades);
            await context.SaveChangesAsync();
        }
    }
}
13. HTTP Client Extensions
public static class HttpClientExtensions
{
    public static async Task<T?> GetFromJsonAsync<T>(
        this HttpClient client,
        string requestUri)
    {
        var response = await client.GetAsync(requestUri);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<T>();
    }

    public static async Task<HttpResponseMessage> PostAsJsonAsync<T>(
        this HttpClient client,
        string requestUri,
        T value)
    {
        return await client.PostAsync(
            requestUri,
            JsonContent.Create(value));
    }

    public static async Task<HttpResponseMessage> PutAsJsonAsync<T>(
        this HttpClient client,
        string requestUri,
        T value)
    {
        return await client.PutAsync(
            requestUri,
            JsonContent.Create(value));
    }
}
14. appsettings.IntegrationTests.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "Jwt": {
    "SecretKey": "test-secret-key-for-integration-tests-must-be-at-least-32-characters",
    "Issuer": "TestIssuer",
    "Audience": "TestAudience",
    "ExpirationMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Will be overridden by TestContainers"
  }
}
15. Mejores Prácticas
15.1 TestContainers
Usar imágenes Alpine — más ligeras y rápidas (postgres:16-alpine, redis:7-alpine)
Puertos aleatorios — WithPortBinding(5432, true) evita conflictos
IAsyncLifetime — iniciar containers en InitializeAsync(), no en constructor
Compartir containers — usar IClassFixture para reutilizar entre tests de la misma clase
Cleanup automático — containers se eliminan automáticamente al finalizar tests
15.2 WebApplicationFactory
ConfigureTestServices — reemplazar dependencias reales con mocks/containers
Respawn para limpieza — resetear DB entre tests sin recrear schema
appsettings.IntegrationTests.json — configuración específica para tests
Migraciones automáticas — aplicar db.Database.Migrate() en setup
15.3 Patrón AAA en Integration Tests
[Fact]
public async Task Endpoint_ConCondicion_ComportamientoEsperado()
{
    // Arrange - Preparar DB, seedear datos, configurar headers
    var entidad = await AgregarEntidadAsync(new {Entidad}("Test", "Desc"));
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    // Act - Hacer HTTP request
    var response = await Client.GetAsync($"/api/v1/entidades/{entidad.Id}");

    // Assert - Verificar response Y estado de DB
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var data = await response.Content.ReadFromJsonAsync<ApiResponse<{Entidad}Dto>>();
    data!.Success.Should().BeTrue();

    // Verificar en DB también
    var dbEntity = await DbContext.{Entidades}.FindAsync(entidad.Id);
    dbEntity.Should().NotBeNull();
}
15.4 Qué Testear en Integration Tests
✅ SI testear: - Controllers completos (HTTP → DB) - Autenticación y autorización - Validación de requests - Migraciones y schema de DB - Transacciones y rollback - Caching (Redis) - Paginación y búsqueda - Relaciones entre entidades - Concurrencia y RowVersion

❌ NO testear (ya cubierto por unit tests): - Lógica de negocio aislada - Validadores de FluentValidation - Mappers de AutoMapper - Métodos privados

16. Comandos Útiles
# Ejecutar solo integration tests
dotnet test tests/{Proyecto}.IntegrationTests/{Proyecto}.IntegrationTests.csproj

# Ejecutar con logs detallados
dotnet test --logger "console;verbosity=detailed"

# Ejecutar test específico
dotnet test --filter "FullyQualifiedName~{Entidad}ControllerTests.Get_ConIdExistente"

# Ejecutar tests en paralelo (más rápido con containers)
dotnet test --parallel

# Ver logs de TestContainers
TESTCONTAINERS_RYUK_DISABLED=true dotnet test
17. Reglas de la Skill
TestContainers obligatorio — no usar in-memory DB, usar containers reales
WebApplicationFactory — todos los tests de API usan factory personalizada
IAsyncLifetime — iniciar containers correctamente
Respawn para limpieza — resetear DB entre tests sin recrear schema
Verificar response Y DB — asegurar que cambios se persisten
appsettings.IntegrationTests.json — configuración separada
Bogus para seed — datos de prueba realistas
HTTP status codes — verificar códigos correctos (200, 201, 400, 401, 403, 404, 409, 500)
Patrón AAA — Arrange (seed DB), Act (HTTP request), Assert (response + DB)
Collection Fixture — compartir factory entre tests de la misma collection
Testing de auth — verificar JWT, roles, claims
Testing de caché — verificar HIT/MISS headers
Testing de concurrencia — verificar RowVersion y conflictos
Testing de transacciones — verificar rollback en errores
Todo en español — nombres, comentarios, mensajes
Comunicación
Completado:

QA INTEGRACIÓN COMPLETADO — Tests creados: {n} integration tests — Containers: PostgreSQL + Redis — Coverage: Controllers + Repositorios + Auth
Bloqueo:

[BLOCKER] QA Integración: {razon}. Necesito: {que}.
Feedback a desarrollador:

[FEEDBACK] QA Integración → Desarrollador BE: Endpoints fallan en tests de integración. Problemas: {lista}.