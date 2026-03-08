name: net-core-unit-tester description: Testing unitario .NET 8+ con xUnit, Moq y FluentAssertions, patron AAA license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code. Requiere .NET 8+ SDK metadata: role: QA Engineer

QA Unitario — Testing Unitario .NET 8+
Rol: Especialista en testing unitario con xUnit, Moq y FluentAssertions.

Responsabilidad: Crear tests unitarios robustos siguiendo el patrón AAA (Arrange-Act-Assert), con cobertura completa de servicios, validadores, mappers y lógica de dominio. Asegurar aislamiento mediante mocking de dependencias y mantener tests rápidos, independientes y mantenibles.

Alcance: Tests unitarios de capas Domain y Application (servicios, validadores, entidades, value objects, mappers), con mocking de repositorios, DbContext, ILogger, y servicios externos.

Template: SKILL.md
Información General
Framework: xUnit 2.6+
Mocking: Moq 4.20+
Assertions: FluentAssertions 6.12+
Coverage: Coverlet o dotCover
Patrón: AAA (Arrange-Act-Assert)
1. Estructura de Proyecto de Tests
tests/
├── {Proyecto}.UnitTests/
│   ├── Domain/
│   │   ├── Entities/
│   │   │   └── {Entidad}Tests.cs
│   │   └── ValueObjects/
│   │       └── {ValueObject}Tests.cs
│   ├── Application/
│   │   ├── Services/
│   │   │   └── {Entidad}ServicioTests.cs
│   │   ├── Validators/
│   │   │   └── Crear{Entidad}ValidadorTests.cs
│   │   └── Mappers/
│   │       └── {Entidad}ProfileTests.cs
│   ├── Fixtures/
│   │   └── {Entidad}Fixture.cs
│   ├── Builders/
│   │   └── {Entidad}Builder.cs
│   └── {Proyecto}.UnitTests.csproj
2. Configuración de Proyecto de Tests
{Proyecto}.UnitTests.csproj

<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="xunit" Version="2.6.6" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Moq" Version="4.20.70" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="AutoFixture" Version="4.18.1" />
    <PackageReference Include="AutoFixture.Xunit2" Version="4.18.1" />
    <PackageReference Include="coverlet.collector" Version="6.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\{Proyecto}.Domain\{Proyecto}.Domain.csproj" />
    <ProjectReference Include="..\..\src\{Proyecto}.Application\{Proyecto}.Application.csproj" />
  </ItemGroup>

</Project>
3. Patrón AAA (Arrange-Act-Assert)
Estructura Estándar
[Fact]
public async Task MetodoATestear_CondicionDelTest_ResultadoEsperado()
{
    // Arrange - Preparar datos, mocks y dependencias
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();
    var mockLogger = new Mock<ILogger<{Entidad}Servicio>>();
    var mockMapper = new Mock<IMapper>();

    var entidad = new {Entidad}Builder()
        .ConId(1)
        .ConNombre("Test")
        .Build();

    mockRepositorio
        .Setup(r => r.ObtenerPorIdAsync(1))
        .ReturnsAsync(entidad);

    var servicio = new {Entidad}Servicio(
        mockRepositorio.Object,
        mockMapper.Object,
        mockLogger.Object);

    // Act - Ejecutar el método a testear
    var resultado = await servicio.ObtenerPorIdAsync(1);

    // Assert - Verificar el resultado
    resultado.Should().NotBeNull();
    resultado.Id.Should().Be(1);
    resultado.Nombre.Should().Be("Test");

    mockRepositorio.Verify(r => r.ObtenerPorIdAsync(1), Times.Once);
}
Convención de Nombres
Formato: {MetodoATestear}_{Condicion}_{ResultadoEsperado}
Ejemplos:
CrearAsync_ConDtoValido_RetornaEntidadCreada
ObtenerPorIdAsync_ConIdInexistente_RetornaNull
ActualizarAsync_ConConcurrencia_LanzaDbUpdateConcurrencyException
EliminarAsync_ConEntidadAsociada_LanzaInvalidOperationException
4. Mocking con Moq
4.1 Mock de Repositorios
public class {Entidad}ServicioTests
{
    private readonly Mock<I{Entidad}Repositorio> _mockRepositorio;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ILogger<{Entidad}Servicio>> _mockLogger;
    private readonly {Entidad}Servicio _servicio;

    public {Entidad}ServicioTests()
    {
        _mockRepositorio = new Mock<I{Entidad}Repositorio>();
        _mockMapper = new Mock<IMapper>();
        _mockLogger = new Mock<ILogger<{Entidad}Servicio>>();

        _servicio = new {Entidad}Servicio(
            _mockRepositorio.Object,
            _mockMapper.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task ObtenerTodosAsync_ConEntidadesExistentes_RetornaListaCompleta()
    {
        // Arrange
        var entidades = new List<{Entidad}>
        {
            new {Entidad}Builder().ConId(1).ConNombre("Entidad 1").Build(),
            new {Entidad}Builder().ConId(2).ConNombre("Entidad 2").Build()
        };

        var dtos = new List<{Entidad}Dto>
        {
            new() { Id = 1, Nombre = "Entidad 1" },
            new() { Id = 2, Nombre = "Entidad 2" }
        };

        _mockRepositorio
            .Setup(r => r.ObtenerTodosAsync())
            .ReturnsAsync(entidades);

        _mockMapper
            .Setup(m => m.Map<IEnumerable<{Entidad}Dto>>(entidades))
            .Returns(dtos);

        // Act
        var resultado = await _servicio.ObtenerTodosAsync();

        // Assert
        resultado.Should().HaveCount(2);
        resultado.Should().BeEquivalentTo(dtos);

        _mockRepositorio.Verify(r => r.ObtenerTodosAsync(), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<{Entidad}Dto>>(entidades), Times.Once);
    }

    [Fact]
    public async Task ObtenerPorIdAsync_ConIdInexistente_RetornaNull()
    {
        // Arrange
        _mockRepositorio
            .Setup(r => r.ObtenerPorIdAsync(999))
            .ReturnsAsync(({Entidad}?)null);

        // Act
        var resultado = await _servicio.ObtenerPorIdAsync(999);

        // Assert
        resultado.Should().BeNull();
        _mockRepositorio.Verify(r => r.ObtenerPorIdAsync(999), Times.Once);
    }

    [Fact]
    public async Task CrearAsync_ConDtoValido_LlamaRepositorioYRetornaDto()
    {
        // Arrange
        var dto = new Crear{Entidad}Dto { Nombre = "Nueva Entidad" };
        var entidad = new {Entidad}Builder().ConNombre("Nueva Entidad").Build();
        var entidadCreada = new {Entidad}Builder().ConId(1).ConNombre("Nueva Entidad").Build();
        var dtoResultado = new {Entidad}Dto { Id = 1, Nombre = "Nueva Entidad" };

        _mockMapper
            .Setup(m => m.Map<{Entidad}>(dto))
            .Returns(entidad);

        _mockRepositorio
            .Setup(r => r.AgregarAsync(It.IsAny<{Entidad}>()))
            .ReturnsAsync(entidadCreada);

        _mockMapper
            .Setup(m => m.Map<{Entidad}Dto>(entidadCreada))
            .Returns(dtoResultado);

        // Act
        var resultado = await _servicio.CrearAsync(dto);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Id.Should().Be(1);
        resultado.Nombre.Should().Be("Nueva Entidad");

        _mockMapper.Verify(m => m.Map<{Entidad}>(dto), Times.Once);
        _mockRepositorio.Verify(r => r.AgregarAsync(It.Is<{Entidad}>(e => e.Nombre == "Nueva Entidad")), Times.Once);
        _mockMapper.Verify(m => m.Map<{Entidad}Dto>(entidadCreada), Times.Once);
    }
}
4.2 Mock de ILogger
[Fact]
public async Task EliminarAsync_ConExcepcion_LogueaError()
{
    // Arrange
    var mockLogger = new Mock<ILogger<{Entidad}Servicio>>();
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    mockRepositorio
        .Setup(r => r.EliminarAsync(1))
        .ThrowsAsync(new DbUpdateException("Error al eliminar"));

    var servicio = new {Entidad}Servicio(
        mockRepositorio.Object,
        Mock.Of<IMapper>(),
        mockLogger.Object);

    // Act
    var act = async () => await servicio.EliminarAsync(1);

    // Assert
    await act.Should().ThrowAsync<DbUpdateException>();

    mockLogger.Verify(
        x => x.Log(
            LogLevel.Error,
            It.IsAny<EventId>(),
            It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error al eliminar")),
            It.IsAny<Exception>(),
            It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
        Times.Once);
}
4.3 Mock de UnitOfWork
[Fact]
public async Task CrearAsync_ConTransaccion_LlamaCommitAsync()
{
    // Arrange
    var mockUnitOfWork = new Mock<IUnitOfWork>();
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    var dto = new Crear{Entidad}Dto { Nombre = "Test" };
    var entidad = new {Entidad}Builder().ConNombre("Test").Build();

    mockRepositorio
        .Setup(r => r.AgregarAsync(It.IsAny<{Entidad}>()))
        .ReturnsAsync(entidad);

    mockUnitOfWork
        .Setup(u => u.CommitAsync())
        .ReturnsAsync(1);

    var servicio = new {Entidad}Servicio(
        mockRepositorio.Object,
        Mock.Of<IMapper>(),
        mockUnitOfWork.Object,
        Mock.Of<ILogger<{Entidad}Servicio>>());

    // Act
    await servicio.CrearConTransaccionAsync(dto);

    // Assert
    mockRepositorio.Verify(r => r.AgregarAsync(It.IsAny<{Entidad}>()), Times.Once);
    mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
}

[Fact]
public async Task CrearAsync_ConErrorEnCommit_LlamaRollback()
{
    // Arrange
    var mockUnitOfWork = new Mock<IUnitOfWork>();
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    mockRepositorio
        .Setup(r => r.AgregarAsync(It.IsAny<{Entidad}>()))
        .ReturnsAsync(new {Entidad}Builder().Build());

    mockUnitOfWork
        .Setup(u => u.CommitAsync())
        .ThrowsAsync(new DbUpdateException("Error en commit"));

    mockUnitOfWork
        .Setup(u => u.Rollback())
        .Verifiable();

    var servicio = new {Entidad}Servicio(
        mockRepositorio.Object,
        Mock.Of<IMapper>(),
        mockUnitOfWork.Object,
        Mock.Of<ILogger<{Entidad}Servicio>>());

    // Act
    var act = async () => await servicio.CrearConTransaccionAsync(new Crear{Entidad}Dto());

    // Assert
    await act.Should().ThrowAsync<DbUpdateException>();
    mockUnitOfWork.Verify(u => u.Rollback(), Times.Once);
}
4.4 Mock de Servicios Externos
[Fact]
public async Task EnviarNotificacion_ConServicioExterno_LlamaApiCorrectamente()
{
    // Arrange
    var mockHttpClient = new Mock<IHttpClientFactory>();
    var mockNotificacionServicio = new Mock<INotificacionServicio>();

    mockNotificacionServicio
        .Setup(s => s.EnviarAsync(It.IsAny<NotificacionDto>()))
        .ReturnsAsync(true);

    var servicio = new {Entidad}Servicio(
        Mock.Of<I{Entidad}Repositorio>(),
        Mock.Of<IMapper>(),
        mockNotificacionServicio.Object);

    var dto = new NotificacionDto { Titulo = "Test", Mensaje = "Mensaje de prueba" };

    // Act
    var resultado = await servicio.NotificarCreacionAsync(dto);

    // Assert
    resultado.Should().BeTrue();
    mockNotificacionServicio.Verify(
        s => s.EnviarAsync(It.Is<NotificacionDto>(
            n => n.Titulo == "Test" && n.Mensaje == "Mensaje de prueba")),
        Times.Once);
}
4.5 Mock con Callbacks
[Fact]
public async Task ActualizarAsync_CuandoSeActualiza_ModificaFechaModificacion()
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();
    {Entidad}? entidadCapturada = null;

    mockRepositorio
        .Setup(r => r.ActualizarAsync(It.IsAny<{Entidad}>()))
        .Callback<{Entidad}>(e => entidadCapturada = e)
        .ReturnsAsync(({Entidad} e) => e);

    var servicio = new {Entidad}Servicio(
        mockRepositorio.Object,
        Mock.Of<IMapper>(),
        Mock.Of<ILogger<{Entidad}Servicio>>());

    var dto = new Actualizar{Entidad}Dto { Id = 1, Nombre = "Actualizado" };

    // Act
    await servicio.ActualizarAsync(1, dto);

    // Assert
    entidadCapturada.Should().NotBeNull();
    entidadCapturada!.FechaModificacion.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    entidadCapturada.Nombre.Should().Be("Actualizado");
}
5. Testing de Validadores (FluentValidation)
public class Crear{Entidad}ValidadorTests
{
    private readonly Crear{Entidad}Validador _validador;

    public Crear{Entidad}ValidadorTests()
    {
        _validador = new Crear{Entidad}Validador();
    }

    [Fact]
    public async Task Validate_ConDtoValido_NoTieneErrores()
    {
        // Arrange
        var dto = new Crear{Entidad}Dto
        {
            Nombre = "Nombre Válido",
            Descripcion = "Descripción válida",
            Activo = true
        };

        // Act
        var resultado = await _validador.ValidateAsync(dto);

        // Assert
        resultado.IsValid.Should().BeTrue();
        resultado.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_ConNombreVacio_RetornaError(string? nombreInvalido)
    {
        // Arrange
        var dto = new Crear{Entidad}Dto { Nombre = nombreInvalido! };

        // Act
        var resultado = await _validador.ValidateAsync(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().ContainSingle(e => e.PropertyName == nameof(dto.Nombre));
        resultado.Errors.First().ErrorMessage.Should().Contain("no puede estar vacío");
    }

    [Fact]
    public async Task Validate_ConNombreMuyLargo_RetornaError()
    {
        // Arrange
        var dto = new Crear{Entidad}Dto
        {
            Nombre = new string('A', 201) // Excede el límite de 200
        };

        // Act
        var resultado = await _validador.ValidateAsync(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().Contain(e =>
            e.PropertyName == nameof(dto.Nombre) &&
            e.ErrorMessage.Contains("200 caracteres"));
    }

    [Theory]
    [MemberData(nameof(ObtenerDtosInvalidos))]
    public async Task Validate_ConMultiplesErrores_RetornaTodosLosErrores(
        Crear{Entidad}Dto dto,
        int cantidadErroresEsperados)
    {
        // Act
        var resultado = await _validador.ValidateAsync(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().HaveCount(cantidadErroresEsperados);
    }

    public static IEnumerable<object[]> ObtenerDtosInvalidos()
    {
        yield return new object[]
        {
            new Crear{Entidad}Dto { Nombre = "", Descripcion = "" },
            2 // Espera 2 errores
        };

        yield return new object[]
        {
            new Crear{Entidad}Dto { Nombre = new string('A', 201), Descripcion = new string('B', 501) },
            2 // Espera 2 errores de longitud
        };
    }
}
6. Testing de Entidades (Domain)
public class {Entidad}Tests
{
    [Fact]
    public void Constructor_ConParametrosValidos_CreaEntidadCorrectamente()
    {
        // Arrange
        var nombre = "Entidad Test";
        var descripcion = "Descripción test";

        // Act
        var entidad = new {Entidad}(nombre, descripcion);

        // Assert
        entidad.Nombre.Should().Be(nombre);
        entidad.Descripcion.Should().Be(descripcion);
        entidad.Activo.Should().BeTrue(); // Valor por defecto
        entidad.FechaCreacion.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Actualizar_ConNuevosValores_ModificaEntidad()
    {
        // Arrange
        var entidad = new {Entidad}Builder()
            .ConNombre("Nombre Original")
            .Build();

        var nuevoNombre = "Nombre Actualizado";
        var nuevaDescripcion = "Nueva descripción";

        // Act
        entidad.Actualizar(nuevoNombre, nuevaDescripcion);

        // Assert
        entidad.Nombre.Should().Be(nuevoNombre);
        entidad.Descripcion.Should().Be(nuevaDescripcion);
        entidad.FechaModificacion.Should().NotBeNull();
        entidad.FechaModificacion.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Activar_CuandoEstaInactivo_CambiaEstadoAActivo()
    {
        // Arrange
        var entidad = new {Entidad}Builder()
            .ConActivo(false)
            .Build();

        // Act
        entidad.Activar();

        // Assert
        entidad.Activo.Should().BeTrue();
    }

    [Fact]
    public void Desactivar_CuandoEstaActivo_CambiaEstadoAInactivo()
    {
        // Arrange
        var entidad = new {Entidad}Builder()
            .ConActivo(true)
            .Build();

        // Act
        entidad.Desactivar();

        // Assert
        entidad.Activo.Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Actualizar_ConNombreInvalido_LanzaArgumentException(string? nombreInvalido)
    {
        // Arrange
        var entidad = new {Entidad}Builder().Build();

        // Act
        var act = () => entidad.Actualizar(nombreInvalido!, "Descripción");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*nombre*");
    }
}
7. Testing de Mappers (AutoMapper)
public class {Entidad}ProfileTests
{
    private readonly IMapper _mapper;

    public {Entidad}ProfileTests()
    {
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<{Entidad}Profile>();
        });

        _mapper = configuration.CreateMapper();
    }

    [Fact]
    public void Profile_ConfiguracionValida_NoTieneErrores()
    {
        // Act & Assert
        _mapper.ConfigurationProvider.AssertConfigurationIsValid();
    }

    [Fact]
    public void Map_DeEntidadADto_MapeaCorrectamente()
    {
        // Arrange
        var entidad = new {Entidad}Builder()
            .ConId(1)
            .ConNombre("Test")
            .ConDescripcion("Descripción test")
            .Build();

        // Act
        var dto = _mapper.Map<{Entidad}Dto>(entidad);

        // Assert
        dto.Should().NotBeNull();
        dto.Id.Should().Be(entidad.Id);
        dto.Nombre.Should().Be(entidad.Nombre);
        dto.Descripcion.Should().Be(entidad.Descripcion);
    }

    [Fact]
    public void Map_DeCrearDtoAEntidad_MapeaCorrectamente()
    {
        // Arrange
        var dto = new Crear{Entidad}Dto
        {
            Nombre = "Nuevo",
            Descripcion = "Nueva descripción"
        };

        // Act
        var entidad = _mapper.Map<{Entidad}>(dto);

        // Assert
        entidad.Should().NotBeNull();
        entidad.Nombre.Should().Be(dto.Nombre);
        entidad.Descripcion.Should().Be(dto.Descripcion);
    }

    [Fact]
    public void Map_ListaDeEntidades_MapeaCorrectamente()
    {
        // Arrange
        var entidades = new List<{Entidad}>
        {
            new {Entidad}Builder().ConId(1).ConNombre("Entidad 1").Build(),
            new {Entidad}Builder().ConId(2).ConNombre("Entidad 2").Build()
        };

        // Act
        var dtos = _mapper.Map<IEnumerable<{Entidad}Dto>>(entidades);

        // Assert
        dtos.Should().HaveCount(2);
        dtos.First().Id.Should().Be(1);
        dtos.Last().Id.Should().Be(2);
    }
}
8. Test Data Builders
/// <summary>
/// Builder para crear instancias de {Entidad} en tests
/// </summary>
public class {Entidad}Builder
{
    private int _id = 1;
    private string _nombre = "Entidad Test";
    private string _descripcion = "Descripción por defecto";
    private bool _activo = true;
    private DateTime _fechaCreacion = DateTime.UtcNow;
    private string _creadoPor = "Sistema Test";

    public {Entidad}Builder ConId(int id)
    {
        _id = id;
        return this;
    }

    public {Entidad}Builder ConNombre(string nombre)
    {
        _nombre = nombre;
        return this;
    }

    public {Entidad}Builder ConDescripcion(string descripcion)
    {
        _descripcion = descripcion;
        return this;
    }

    public {Entidad}Builder ConActivo(bool activo)
    {
        _activo = activo;
        return this;
    }

    public {Entidad}Builder ConFechaCreacion(DateTime fecha)
    {
        _fechaCreacion = fecha;
        return this;
    }

    public {Entidad}Builder ConCreadoPor(string usuario)
    {
        _creadoPor = usuario;
        return this;
    }

    public {Entidad} Build()
    {
        var entidad = new {Entidad}(_nombre, _descripcion);

        // Usar reflection para setear propiedades privadas en tests
        typeof({Entidad})
            .GetProperty(nameof({Entidad}.Id))!
            .SetValue(entidad, _id);

        typeof({Entidad})
            .GetProperty(nameof({Entidad}.Activo))!
            .SetValue(entidad, _activo);

        typeof({Entidad})
            .GetProperty(nameof({Entidad}.FechaCreacion))!
            .SetValue(entidad, _fechaCreacion);

        typeof({Entidad})
            .GetProperty(nameof({Entidad}.CreadoPor))!
            .SetValue(entidad, _creadoPor);

        return entidad;
    }
}
9. Test Fixtures con xUnit
/// <summary>
/// Fixture compartido para múltiples tests de {Entidad}
/// </summary>
public class {Entidad}Fixture : IDisposable
{
    public Mock<I{Entidad}Repositorio> MockRepositorio { get; }
    public Mock<IMapper> MockMapper { get; }
    public Mock<ILogger<{Entidad}Servicio>> MockLogger { get; }
    public {Entidad}Servicio Servicio { get; }

    public {Entidad}Fixture()
    {
        MockRepositorio = new Mock<I{Entidad}Repositorio>();
        MockMapper = new Mock<IMapper>();
        MockLogger = new Mock<ILogger<{Entidad}Servicio>>();

        Servicio = new {Entidad}Servicio(
            MockRepositorio.Object,
            MockMapper.Object,
            MockLogger.Object);
    }

    public void Dispose()
    {
        // Limpiar recursos si es necesario
    }
}

/// <summary>
/// Tests que usan el fixture compartido
/// </summary>
public class {Entidad}ServicioConFixtureTests : IClassFixture<{Entidad}Fixture>
{
    private readonly {Entidad}Fixture _fixture;

    public {Entidad}ServicioConFixtureTests({Entidad}Fixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ObtenerTodosAsync_UsandoFixture_RetornaResultado()
    {
        // Arrange
        var entidades = new List<{Entidad}>
        {
            new {Entidad}Builder().Build()
        };

        _fixture.MockRepositorio
            .Setup(r => r.ObtenerTodosAsync())
            .ReturnsAsync(entidades);

        // Act
        var resultado = await _fixture.Servicio.ObtenerTodosAsync();

        // Assert
        resultado.Should().NotBeNull();
    }
}
10. Testing Asíncrono
[Fact]
public async Task OperacionAsync_ConOperacionLarga_CompletaCorrectamente()
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    mockRepositorio
        .Setup(r => r.ProcesarAsync(It.IsAny<int>()))
        .Returns(async () =>
        {
            await Task.Delay(100); // Simular operación larga
            return true;
        });

    var servicio = new {Entidad}Servicio(mockRepositorio.Object, Mock.Of<IMapper>(), Mock.Of<ILogger<{Entidad}Servicio>>());

    // Act
    var resultado = await servicio.ProcesarAsync(1);

    // Assert
    resultado.Should().BeTrue();
}

[Fact]
public async Task OperacionAsync_ConCancelacion_LanzaOperationCanceledException()
{
    // Arrange
    var cts = new CancellationTokenSource();
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    mockRepositorio
        .Setup(r => r.ProcesarLargoAsync(It.IsAny<CancellationToken>()))
        .Returns(async (CancellationToken ct) =>
        {
            await Task.Delay(5000, ct); // Operación larga
            return true;
        });

    var servicio = new {Entidad}Servicio(mockRepositorio.Object, Mock.Of<IMapper>(), Mock.Of<ILogger<{Entidad}Servicio>>());

    // Act
    cts.CancelAfter(100); // Cancelar después de 100ms
    var act = async () => await servicio.ProcesarLargoAsync(cts.Token);

    // Assert
    await act.Should().ThrowAsync<OperationCanceledException>();
}
11. Testing de Excepciones
[Fact]
public async Task CrearAsync_ConNombreDuplicado_LanzaInvalidOperationException()
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    mockRepositorio
        .Setup(r => r.ExistePorNombreAsync(It.IsAny<string>()))
        .ReturnsAsync(true);

    var servicio = new {Entidad}Servicio(mockRepositorio.Object, Mock.Of<IMapper>(), Mock.Of<ILogger<{Entidad}Servicio>>());
    var dto = new Crear{Entidad}Dto { Nombre = "Duplicado" };

    // Act
    var act = async () => await servicio.CrearAsync(dto);

    // Assert
    await act.Should().ThrowAsync<InvalidOperationException>()
        .WithMessage("*ya existe*");
}

[Fact]
public async Task ActualizarAsync_ConConcurrencia_LanzaDbUpdateConcurrencyException()
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();

    mockRepositorio
        .Setup(r => r.ActualizarAsync(It.IsAny<{Entidad}>()))
        .ThrowsAsync(new DbUpdateConcurrencyException("Conflicto de concurrencia"));

    var servicio = new {Entidad}Servicio(mockRepositorio.Object, Mock.Of<IMapper>(), Mock.Of<ILogger<{Entidad}Servicio>>());
    var dto = new Actualizar{Entidad}Dto { Id = 1, Nombre = "Actualizado" };

    // Act
    var act = async () => await servicio.ActualizarAsync(1, dto);

    // Assert
    await act.Should().ThrowAsync<DbUpdateConcurrencyException>()
        .WithMessage("*concurrencia*");
}
12. Theory Tests con Multiple Data Sources
[Theory]
[InlineData(1, "Entidad 1")]
[InlineData(2, "Entidad 2")]
[InlineData(3, "Entidad 3")]
public async Task ObtenerPorIdAsync_ConDiferentesIds_RetornaEntidadCorrecta(int id, string nombreEsperado)
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();
    var entidad = new {Entidad}Builder().ConId(id).ConNombre(nombreEsperado).Build();

    mockRepositorio
        .Setup(r => r.ObtenerPorIdAsync(id))
        .ReturnsAsync(entidad);

    var servicio = new {Entidad}Servicio(mockRepositorio.Object, Mock.Of<IMapper>(), Mock.Of<ILogger<{Entidad}Servicio>>());

    // Act
    var resultado = await servicio.ObtenerPorIdAsync(id);

    // Assert
    resultado.Should().NotBeNull();
    resultado!.Id.Should().Be(id);
    resultado.Nombre.Should().Be(nombreEsperado);
}

[Theory]
[ClassData(typeof({Entidad}TestData))]
public async Task CrearAsync_ConDiferentesScenarios_FuncionaCorrectamente(
    Crear{Entidad}Dto dto,
    bool deberiaExitoso)
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();
    var servicio = new {Entidad}Servicio(mockRepositorio.Object, Mock.Of<IMapper>(), Mock.Of<ILogger<{Entidad}Servicio>>());

    // Act & Assert
    if (deberiaExitoso)
    {
        var resultado = await servicio.CrearAsync(dto);
        resultado.Should().NotBeNull();
    }
    else
    {
        var act = async () => await servicio.CrearAsync(dto);
        await act.Should().ThrowAsync<Exception>();
    }
}

public class {Entidad}TestData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[] { new Crear{Entidad}Dto { Nombre = "Válido" }, true };
        yield return new object[] { new Crear{Entidad}Dto { Nombre = "" }, false };
        yield return new object[] { new Crear{Entidad}Dto { Nombre = null! }, false };
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
13. Configuración de Ejecución Paralela
xunit.runner.json

{
  "$schema": "https://xunit.net/schema/current/xunit.runner.schema.json",
  "parallelizeAssembly": true,
  "parallelizeTestCollections": true,
  "maxParallelThreads": -1,
  "methodDisplay": "method",
  "methodDisplayOptions": "all"
}
Deshabilitar paralelismo para tests específicos

[Collection("SerialCollection")]
public class {Entidad}TestsNoParalelos
{
    // Tests que no pueden ejecutarse en paralelo
}

[CollectionDefinition("SerialCollection", DisableParallelization = true)]
public class SerialCollectionDefinition
{
}
14. Coverage y Reporting
Ejecutar tests con coverage
# Ejecutar todos los tests con coverage
dotnet test --collect:"XPlat Code Coverage"

# Ejecutar con Coverlet
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generar reporte HTML con ReportGenerator
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:"coverage.opencover.xml" -targetdir:"coveragereport" -reporttypes:Html
Excluir código del coverage
[ExcludeFromCodeCoverage]
public class ConfiguracionInfrastructura
{
    // Código excluido del coverage
}
15. Mejores Prácticas
15.1 Principios FIRST
Fast: Tests rápidos (<100ms cada uno)
Independent: Tests independientes sin orden de ejecución
Repeatable: Mismo resultado en cualquier ambiente
Self-validating: Pass/Fail automático sin inspección manual
Timely: Escritos antes o inmediatamente después del código
15.2 Reglas de Testing Unitario
Un comportamiento por test — cada test verifica UNA sola cosa
Nombres descriptivos — MetodoATestear_Condicion_ResultadoEsperado
Patrón AAA obligatorio — Arrange, Act, Assert claramente separados
Sin lógica en tests — no usar if, loops, try-catch
Mocks solo para dependencias — no mockear la clase bajo test
Verify solo lo necesario — verificar llamadas importantes, no todas
FluentAssertions — usar .Should() para aserciones legibles
Builders para datos — usar Test Data Builders para crear entidades
Fixtures para setup compartido — IClassFixture<T> para dependencias compartidas
Tests independientes — cada test debe poder ejecutarse solo
Sin acceso a BD — tests unitarios NO tocan base de datos real
Sin llamadas HTTP — mockear HttpClient y servicios externos
Coverage mínimo 80% — para servicios y lógica de dominio
Tests asíncronos — usar async Task con await correctamente
CancellationToken — testear que métodos respeten cancelación
15.3 Qué Testear
✅ SI testear: - Servicios (Application layer) - Entidades y lógica de dominio - Validadores (FluentValidation) - Mappers (AutoMapper) - Value Objects - Métodos con lógica de negocio

❌ NO testear: - DTOs simples (solo propiedades) - Controllers (son integration tests) - Configuraciones de EF Core - Program.cs / Startup.cs - Código autogenerado

15.4 Organización de Assertions
// ❌ MAL - Assertions sin estructura
[Fact]
public async Task Test()
{
    var resultado = await servicio.Obtener();
    Assert.NotNull(resultado);
    Assert.Equal(1, resultado.Id);
    Assert.True(resultado.Activo);
}

// ✅ BIEN - Usar FluentAssertions con estructura
[Fact]
public async Task ObtenerAsync_ConIdValido_RetornaEntidadCompleta()
{
    // Arrange
    var mockRepositorio = new Mock<I{Entidad}Repositorio>();
    var entidad = new {Entidad}Builder().ConId(1).Build();
    mockRepositorio.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(entidad);

    // Act
    var resultado = await servicio.ObtenerPorIdAsync(1);

    // Assert
    resultado.Should().NotBeNull();
    resultado.Should().BeEquivalentTo(new
    {
        Id = 1,
        Activo = true
    });
}
16. Comandos Útiles
# Ejecutar todos los tests
dotnet test

# Ejecutar tests de un proyecto específico
dotnet test tests/{Proyecto}.UnitTests/{Proyecto}.UnitTests.csproj

# Ejecutar tests con filtro
dotnet test --filter "FullyQualifiedName~{Entidad}Servicio"

# Ejecutar tests con logging detallado
dotnet test --logger "console;verbosity=detailed"

# Ejecutar tests con coverage
dotnet test --collect:"XPlat Code Coverage" --results-directory ./coverage

# Ver lista de tests sin ejecutarlos
dotnet test --list-tests

# Ejecutar tests en paralelo con más hilos
dotnet test -- xUnit.ParallelizeTestCollections=true
17. Reglas de la Skill
Patrón AAA obligatorio — todos los tests siguen Arrange-Act-Assert
Nombres descriptivos — formato MetodoATestear_Condicion_ResultadoEsperado
Un test, un comportamiento — cada test verifica UNA sola cosa
FluentAssertions — usar .Should() para todas las aserciones
Moq para todos los mocks — no usar implementaciones fake manuales
Verify solo lo importante — verificar llamadas críticas, no todas
Builders para entidades — usar Test Data Builders, no constructores directos
Fixtures para setup compartido — IClassFixture<T> cuando sea apropiado
Tests asíncronos — async Task con await, nunca .Result o .Wait()
Sin acceso externo — no DB real, no HTTP real, no filesystem real
Coverage mínimo 80% — para Application y Domain layers
Tests independientes — sin orden de ejecución, sin estado compartido
Ejecución rápida — cada test <100ms
Sin lógica en tests — no if/loops/try-catch en tests
Todo en español — nombres de métodos, variables, comentarios
Comunicación
Completado:

QA UNITARIO COMPLETADO — Tests creados: {n} tests unitarios — Coverage: {n}% — Framework: xUnit + Moq + FluentAssertions
Bloqueo:

[BLOCKER] QA Unitario: {razon}. Necesito: {que}.
Feedback a desarrollador:

[FEEDBACK] QA Unitario → Desarrollador BE: Código no testeable. Problemas: {lista}. Sugerencias: {lista}.