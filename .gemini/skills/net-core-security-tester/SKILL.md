name: net-core-security-tester description: Testing de seguridad .NET 8+ con enfoque OWASP Top 10 y auditoria de codigo license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code. Requiere .NET 8+ SDK metadata: role: QA Engineer

QA Security — Testing de Seguridad .NET 8+
Rol: Especialista en testing de seguridad con enfoque en OWASP Top 10, vulnerabilidades comunes y auditoría de código.

Responsabilidad: Identificar y validar vulnerabilidades de seguridad en aplicaciones .NET 8+, incluyendo SQL Injection, XSS, CSRF, autenticación débil, exposición de datos sensibles, configuraciones inseguras, y otras amenazas del OWASP Top 10. Asegurar que la aplicación cumple con estándares de seguridad antes de producción.

Alcance: Tests de seguridad para APIs .NET, validación de autenticación/autorización, testing de inyección (SQL, LDAP, Command), XSS, CSRF, exposición de secretos, configuraciones inseguras, dependency scanning, y análisis estático de código (SAST).

Información General
Framework: xUnit 2.6+ o NUnit 4.0+
OWASP: Top 10 2021/2023
Tools:
OWASP ZAP (automatizado)
SonarQube / SonarCloud
Snyk / Dependabot (dependencies)
SecurityCodeScan (.NET analyzer)
AntiXSS Library
Patrón: AAA (Arrange-Act-Assert)
Estándar: ISO 27001, OWASP ASVS
1. Estructura de Proyecto de Tests
tests/
├── {Proyecto}.SecurityTests/
│   ├── OWASP/
│   │   ├── A01_BrokenAccessControl_Tests.cs
│   │   ├── A02_CryptographicFailures_Tests.cs
│   │   ├── A03_Injection_Tests.cs
│   │   ├── A04_InsecureDesign_Tests.cs
│   │   ├── A05_SecurityMisconfiguration_Tests.cs
│   │   ├── A06_VulnerableComponents_Tests.cs
│   │   ├── A07_IdentificationAuthFailures_Tests.cs
│   │   ├── A08_SoftwareDataIntegrityFailures_Tests.cs
│   │   ├── A09_SecurityLoggingFailures_Tests.cs
│   │   └── A10_SSRF_Tests.cs
│   ├── Authentication/
│   │   ├── JwtSecurityTests.cs
│   │   ├── PasswordPolicyTests.cs
│   │   └── SessionManagementTests.cs
│   ├── Authorization/
│   │   ├── RoleBasedAccessTests.cs
│   │   └── PolicyBasedAccessTests.cs
│   ├── DataProtection/
│   │   ├── EncryptionTests.cs
│   │   ├── SensitiveDataExposureTests.cs
│   │   └── PiiProtectionTests.cs
│   ├── Configuration/
│   │   ├── SecretManagementTests.cs
│   │   └── SecurityHeadersTests.cs
│   ├── Helpers/
│   │   ├── SecurityTestHelper.cs
│   │   └── PayloadGenerator.cs
│   └── {Proyecto}.SecurityTests.csproj
2. Configuración de Proyecto
{Proyecto}.SecurityTests.csproj

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
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />

    <!-- Security Testing Tools -->
    <PackageReference Include="AngleSharp" Version="1.0.7" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />
    <PackageReference Include="SecurityCodeScan.VS2019" Version="5.6.7">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\{Proyecto}.Api\{Proyecto}.Api.csproj" />
  </ItemGroup>

</Project>
3. OWASP Top 10 Testing
3.1 A01 - Broken Access Control
[TestFixture]
public class A01_BrokenAccessControl_Tests : BaseSecurityTest
{
    [Test]
    public async Task Endpoint_SinAutenticacion_Retorna401()
    {
        // Arrange
        var client = Factory.CreateClient();
        // NO agregar token de autenticación

        // Act
        var response = await client.GetAsync("/api/v1/entidades");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Endpoint_ConTokenExpirado_Retorna401()
    {
        // Arrange
        var expiredToken = GenerarTokenExpirado();
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await client.GetAsync("/api/v1/entidades");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Endpoint_ConRolInsuficiente_Retorna403()
    {
        // Arrange
        var token = GenerarToken(roles: new[] { "Usuario" });
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var dto = new CrearEntidadDto { Nombre = "Test" };

        // Act - Intentar crear (requiere rol Administrador)
        var response = await client.PostAsJsonAsync("/api/v1/entidades", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task Endpoint_AccesoDirectoARutaNoAutorizada_Retorna403()
    {
        // Arrange - IDOR (Insecure Direct Object Reference)
        var tokenUsuario1 = GenerarToken(userId: 1, roles: new[] { "Usuario" });
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokenUsuario1);

        // Act - Intentar acceder a recurso de otro usuario
        var response = await client.GetAsync("/api/v1/usuarios/999/perfil");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task Endpoint_ManipulacionDeParametros_NoPermiteEscalacionDePrivilegios()
    {
        // Arrange
        var token = GenerarToken(userId: 1, roles: new[] { "Usuario" });
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var dto = new ActualizarUsuarioDto
        {
            Id = 1,
            Nombre = "Test",
            Rol = "Administrador" // Intentar escalar privilegios
        };

        // Act
        var response = await client.PutAsJsonAsync("/api/v1/usuarios/1", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Verificar que el rol NO cambió en DB
        var usuario = await ObtenerUsuarioDeDb(1);
        usuario.Rol.Should().NotBe("Administrador");
    }
}
3.2 A02 - Cryptographic Failures
[TestFixture]
public class A02_CryptographicFailures_Tests : BaseSecurityTest
{
    [Test]
    public async Task PasswordsEnDb_EstanHasheadas_NoEnTextoPlano()
    {
        // Arrange
        var password = "Password123!";
        await CrearUsuarioAsync("test@test.com", password);

        // Act
        var usuario = await ObtenerUsuarioDeDb("test@test.com");

        // Assert
        usuario.PasswordHash.Should().NotBe(password);
        usuario.PasswordHash.Should().NotBeNullOrEmpty();
        usuario.PasswordHash.Length.Should().BeGreaterThan(50); // Hash largo
    }

    [Test]
    public void PasswordHashing_UsaAlgoritmoSeguro_BCryptOArgon2()
    {
        // Arrange
        var password = "TestPassword123!";
        var passwordHasher = new PasswordHasher();

        // Act
        var hash = passwordHasher.HashPassword(password);

        // Assert
        hash.Should().StartWith("$2"); // BCrypt prefix
        // O verificar Argon2: hash.Should().StartWith("$argon2");
    }

    [Test]
    public async Task DatosSensibles_EstanEncriptadosEnDb()
    {
        // Arrange
        var numeroTarjeta = "4111111111111111";
        await CrearPagoAsync(numeroTarjeta);

        // Act
        var pagoEnDb = await ObtenerPagoDeDbDirecto();

        // Assert
        pagoEnDb.NumeroTarjetaEncriptado.Should().NotBe(numeroTarjeta);
        pagoEnDb.NumeroTarjetaEncriptado.Should().NotContain("4111");
    }

    [Test]
    public async Task Api_UsaHttps_NoHttp()
    {
        // Arrange
        var client = Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("http://localhost") // HTTP
        });

        // Act
        var response = await client.GetAsync("/api/v1/entidades");

        // Assert
        // En producción debe redirigir a HTTPS
        response.RequestMessage?.RequestUri?.Scheme.Should().Be("https");
    }

    [Test]
    public void JwtSecretKey_TieneLongitudMinima_32Caracteres()
    {
        // Arrange
        var configuration = Factory.Services.GetRequiredService<IConfiguration>();

        // Act
        var secretKey = configuration["Jwt:SecretKey"];

        // Assert
        secretKey.Should().NotBeNullOrEmpty();
        secretKey!.Length.Should().BeGreaterThanOrEqualTo(32);
    }
}
3.3 A03 - Injection (SQL, Command, LDAP)
[TestFixture]
public class A03_Injection_Tests : BaseSecurityTest
{
    [Theory]
    [InlineData("'; DROP TABLE Usuarios--")]
    [InlineData("1' OR '1'='1")]
    [InlineData("admin'--")]
    [InlineData("1; DELETE FROM Usuarios WHERE '1'='1")]
    public async Task SqlInjection_EnParametroDeBusqueda_NoEsVulnerable(string payloadMalicioso)
    {
        // Arrange
        var token = GenerarTokenAdmin();
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await client.GetAsync($"/api/v1/entidades?nombre={Uri.EscapeDataString(payloadMalicioso)}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verificar que la tabla NO fue eliminada
        var countDespues = await ContarEntidadesEnDb();
        countDespues.Should().BeGreaterThan(0);
    }

    [Test]
    public async Task SqlInjection_EnLogin_NoPermiteBypass()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "admin@test.com' OR '1'='1'--",
            Password = "cualquierCosa"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("<script>alert('XSS')</script>")]
    [InlineData("<img src=x onerror=alert('XSS')>")]
    [InlineData("javascript:alert('XSS')")]
    public async Task XssInjection_EnCampoDeTexto_EsSanitizado(string payloadXss)
    {
        // Arrange
        var token = GenerarTokenAdmin();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var dto = new CrearEntidadDto { Nombre = payloadXss };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/entidades", dto);
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<EntidadDto>>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        // Verificar que el contenido fue sanitizado o escapado
        apiResponse!.Data!.Nombre.Should().NotContain("<script>");
        apiResponse.Data.Nombre.Should().NotContain("onerror");
        apiResponse.Data.Nombre.Should().NotContain("javascript:");
    }

    [Theory]
    [InlineData("; ls -la")]
    [InlineData("| cat /etc/passwd")]
    [InlineData("&& rm -rf /")]
    public async Task CommandInjection_EnProcesoDeSistema_NoEsVulnerable(string payloadComando)
    {
        // Arrange
        var token = GenerarTokenAdmin();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var dto = new ProcesarArchivoDto { NombreArchivo = $"test{payloadComando}.pdf" };

        // Act
        var act = async () => await Client.PostAsJsonAsync("/api/v1/archivos/procesar", dto);

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .Or.Subject.Should().Match<HttpResponseMessage>(r =>
                r.StatusCode == HttpStatusCode.BadRequest);
    }
}
3.4 A04 - Insecure Design
[TestFixture]
public class A04_InsecureDesign_Tests : BaseSecurityTest
{
    [Test]
    public async Task RateLimiting_ProtegeLaApi_ContraAbuso()
    {
        // Arrange
        var client = Factory.CreateClient();

        // Act - Realizar múltiples requests rápidos
        var tasks = Enumerable.Range(0, 150)
            .Select(_ => client.GetAsync("/api/v1/entidades"))
            .ToList();

        var responses = await Task.WhenAll(tasks);

        // Assert
        var tooManyRequests = responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        tooManyRequests.Should().BeGreaterThan(0, "Rate limiting debe bloquear requests excesivos");
    }

    [Test]
    public async Task Login_TieneProteccionContraBruteForce()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@test.com", Password = "wrong" };

        // Act - Intentar login fallido múltiples veces
        for (int i = 0; i < 10; i++)
        {
            await Client.PostAsJsonAsync("/api/v1/auth/login", loginDto);
        }

        // Siguiente intento debe ser bloqueado temporalmente
        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
    }

    [Test]
    public async Task PasswordPolicy_RequiereComplejidadMinima()
    {
        // Arrange
        var weakPasswords = new[] { "123456", "password", "abc123", "qwerty" };

        foreach (var weakPassword in weakPasswords)
        {
            var dto = new RegistrarUsuarioDto
            {
                Email = "test@test.com",
                Password = weakPassword
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/auth/registrar", dto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("contraseña");
        }
    }
}
3.5 A05 - Security Misconfiguration
[TestFixture]
public class A05_SecurityMisconfiguration_Tests : BaseSecurityTest
{
    [Test]
    public async Task Api_TieneSecurityHeaders_Configurados()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/entidades");

        // Assert
        response.Headers.Should().ContainKey("X-Content-Type-Options");
        response.Headers.GetValues("X-Content-Type-Options").First().Should().Be("nosniff");

        response.Headers.Should().ContainKey("X-Frame-Options");
        response.Headers.GetValues("X-Frame-Options").First().Should().Be("DENY");

        response.Headers.Should().ContainKey("X-XSS-Protection");

        response.Headers.Should().ContainKey("Strict-Transport-Security");
    }

    [Test]
    public async Task Api_NoExponeDetallesDeError_EnProduccion()
    {
        // Arrange - Forzar error interno
        var client = Factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/v1/entidades/99999999");

        // Assert
        var content = await response.Content.ReadAsStringAsync();

        // No debe exponer stack traces
        content.Should().NotContain("StackTrace");
        content.Should().NotContain("at System.");
        content.Should().NotContain("Exception:");

        // No debe exponer rutas del servidor
        content.Should().NotContain("C:\\");
        content.Should().NotContain("/var/");
    }

    [Test]
    public void Configuration_NoContieneSecretsHardcodeados()
    {
        // Arrange
        var configuration = Factory.Services.GetRequiredService<IConfiguration>();

        // Act & Assert
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var jwtSecret = configuration["Jwt:SecretKey"];

        // En tests puede haber valores de prueba, pero verificar patrón
        if (!IsTestEnvironment())
        {
            connectionString.Should().NotContain("Password=");
            jwtSecret.Should().NotBe("your-secret-key-here");
        }
    }

    [Test]
    public async Task Swagger_NoEstaDisponibleEnProduccion()
    {
        // Arrange
        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Production");
            });

        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync("/swagger/index.html");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
3.6 A06 - Vulnerable and Outdated Components
[TestFixture]
public class A06_VulnerableComponents_Tests
{
    [Test]
    public void Dependencies_NoTienenVulnerabilidadesConocidas()
    {
        // Este test requiere integración con Snyk, Dependabot, o OWASP Dependency Check
        // Ejemplo conceptual:

        var vulnerablePackages = new[]
        {
            "Newtonsoft.Json:12.0.0", // Versión con CVE conocido
            "System.Text.Json:4.7.0"   // Versión antigua
        };

        var projectFile = File.ReadAllText("../../../{Proyecto}.Api/{Proyecto}.Api.csproj");

        foreach (var vulnerable in vulnerablePackages)
        {
            projectFile.Should().NotContain(vulnerable,
                $"El paquete {vulnerable} tiene vulnerabilidades conocidas");
        }
    }

    [Test]
    public void TargetFramework_EsVersionSoportada()
    {
        // Arrange
        var projectFile = File.ReadAllText("../../../{Proyecto}.Api/{Proyecto}.Api.csproj");

        // Act & Assert
        projectFile.Should().Contain("<TargetFramework>net8.0</TargetFramework>")
            .Or.Contain("<TargetFramework>net9.0</TargetFramework>");

        projectFile.Should().NotContain("netcoreapp3.1");
        projectFile.Should().NotContain("net5.0");
        projectFile.Should().NotContain("net6.0"); // Si ya no está en soporte
    }
}
3.7 A07 - Identification and Authentication Failures
[TestFixture]
public class A07_IdentificationAuthFailures_Tests : BaseSecurityTest
{
    [Test]
    public async Task SessionToken_ExpiraDespuesDelTiempoConfigura do()
    {
        // Arrange
        var token = GenerarTokenConExpiracion(TimeSpan.FromSeconds(1));
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        await Task.Delay(2000); // Esperar expiración
        var response = await client.GetAsync("/api/v1/entidades");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Login_NoPermiteCredencialesPorDefecto()
    {
        // Arrange
        var credencialesDefault = new[]
        {
            new LoginDto { Email = "admin@admin.com", Password = "admin" },
            new LoginDto { Email = "admin@test.com", Password = "password" },
            new LoginDto { Email = "root@test.com", Password = "root" }
        };

        foreach (var credencial in credencialesDefault)
        {
            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/auth/login", credencial);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }

    [Test]
    public async Task Password_NoSeRetornaEnResponses()
    {
        // Arrange
        var token = GenerarTokenAdmin();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await Client.GetAsync("/api/v1/usuarios/1");
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        content.Should().NotContain("password");
        content.Should().NotContain("passwordHash");
        content.Should().NotContain("Password");
    }

    [Test]
    public void JwtToken_TieneAlgoritmoSeguro_HS256ORS256()
    {
        // Arrange
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = GenerarToken();

        // Act
        var jwtToken = tokenHandler.ReadJwtToken(token);

        // Assert
        jwtToken.Header.Alg.Should().BeOneOf("HS256", "RS256", "ES256");
        jwtToken.Header.Alg.Should().NotBe("none"); // Vulnerable
    }
}
3.8 A08 - Software and Data Integrity Failures
[TestFixture]
public class A08_SoftwareDataIntegrityFailures_Tests : BaseSecurityTest
{
    [Test]
    public async Task ActualizacionConcurrente_UsaRowVersion_ParaDetectarConflictos()
    {
        // Arrange
        var token = GenerarTokenAdmin();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var entidad = await CrearEntidadAsync("Test");

        var dto1 = new ActualizarEntidadDto { Id = entidad.Id, Nombre = "Actualizado 1", RowVersion = entidad.RowVersion };
        var dto2 = new ActualizarEntidadDto { Id = entidad.Id, Nombre = "Actualizado 2", RowVersion = entidad.RowVersion };

        // Act
        var response1 = await Client.PutAsJsonAsync($"/api/v1/entidades/{entidad.Id}", dto1);
        var response2 = await Client.PutAsJsonAsync($"/api/v1/entidades/{entidad.Id}", dto2);

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.Conflict); // 409 Conflict
    }

    [Test]
    public void Deserialization_NoPermiteTypesInseguros()
    {
        // Arrange
        var jsonMalicioso = @"{
            ""$type"": ""System.Diagnostics.Process, System.Diagnostics.Process"",
            ""FileName"": ""cmd.exe""
        }";

        // Act
        var act = () => JsonSerializer.Deserialize<object>(jsonMalicioso);

        // Assert
        act.Should().NotThrow<Exception>("pero el tipo no debe deserializarse");
    }
}
3.9 A09 - Security Logging and Monitoring Failures
[TestFixture]
public class A09_SecurityLoggingFailures_Tests : BaseSecurityTest
{
    [Test]
    public async Task LoginFallido_SeLoguea()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@test.com", Password = "wrong" };

        // Act
        await Client.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        var logs = ObtenerLogsRecientes();
        logs.Should().Contain(log =>
            log.Level == "Warning" &&
            log.Message.Contains("Login fallido") &&
            log.Message.Contains("test@test.com"));
    }

    [Test]
    public async Task AccesoNoAutorizado_SeLoguea()
    {
        // Arrange
        var token = GenerarToken(roles: new[] { "Usuario" });
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        await Client.DeleteAsync("/api/v1/entidades/1"); // Requiere Admin

        // Assert
        var logs = ObtenerLogsRecientes();
        logs.Should().Contain(log =>
            log.Level == "Warning" &&
            log.Message.Contains("403") &&
            log.Message.Contains("Forbidden"));
    }

    [Test]
    public void Logs_NoContienenDatosSensibles()
    {
        // Arrange
        var logs = ObtenerTodosLosLogs();

        // Assert
        foreach (var log in logs)
        {
            log.Message.Should().NotContainEquivalentOf("password");
            log.Message.Should().NotMatchRegex(@"\d{16}"); // Números de tarjeta
            log.Message.Should().NotMatchRegex(@"\d{3}-\d{2}-\d{4}"); // SSN
        }
    }
}
3.10 A10 - Server-Side Request Forgery (SSRF)
[TestFixture]
public class A10_SSRF_Tests : BaseSecurityTest
{
    [Theory]
    [InlineData("http://localhost/admin")]
    [InlineData("http://127.0.0.1/admin")]
    [InlineData("http://169.254.169.254/latest/meta-data/")] // AWS metadata
    [InlineData("file:///etc/passwd")]
    public async Task UrlExterna_NoPermiteAccesoARecursosInternos(string urlMaliciosa)
    {
        // Arrange
        var token = GenerarTokenAdmin();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var dto = new ImportarDesdeUrlDto { Url = urlMaliciosa };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/importar/url", dto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
4. Testing de Autenticación JWT
[TestFixture]
public class JwtSecurityTests : BaseSecurityTest
{
    [Test]
    public void JwtToken_TieneClaimsNecesarios()
    {
        // Arrange
        var token = GenerarToken(userId: 1, username: "test@test.com", roles: new[] { "Admin" });
        var handler = new JwtSecurityTokenHandler();

        // Act
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub);
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.UniqueName);
        jwtToken.Claims.Should().Contain(c => c.Type == ClaimTypes.Role);
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Jti); // Token ID único
    }

    [Test]
    public void JwtToken_NoContieneInformacionSensible()
    {
        // Arrange
        var token = GenerarToken();
        var handler = new JwtSecurityTokenHandler();

        // Act
        var jwtToken = handler.ReadJwtToken(token);
        var payload = jwtToken.Payload.SerializeToJson();

        // Assert
        payload.Should().NotContain("password");
        payload.Should().NotContain("secret");
        payload.Should().NotContain("creditCard");
    }

    [Test]
    public void JwtToken_TieneTiempoExpiracionRazonable()
    {
        // Arrange
        var token = GenerarToken();
        var handler = new JwtSecurityTokenHandler();

        // Act
        var jwtToken = handler.ReadJwtToken(token);
        var expiration = jwtToken.ValidTo - jwtToken.ValidFrom;

        // Assert
        expiration.Should().BeLessThanOrEqualTo(TimeSpan.FromHours(24));
        expiration.Should().BeGreaterThan(TimeSpan.FromMinutes(5));
    }
}
5. Testing de Headers de Seguridad
[TestFixture]
public class SecurityHeadersTests : BaseSecurityTest
{
    [Test]
    public async Task Response_TieneContentSecurityPolicy()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/entidades");

        // Assert
        response.Headers.Should().ContainKey("Content-Security-Policy");
        var csp = response.Headers.GetValues("Content-Security-Policy").First();
        csp.Should().Contain("default-src 'self'");
    }

    [Test]
    public async Task Response_TieneHSTS_StrictTransportSecurity()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/entidades");

        // Assert
        response.Headers.Should().ContainKey("Strict-Transport-Security");
        var hsts = response.Headers.GetValues("Strict-Transport-Security").First();
        hsts.Should().Contain("max-age");
        hsts.Should().Contain("includeSubDomains");
    }

    [Test]
    public async Task Response_NoExponeCabeceras Sensibles()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/entidades");

        // Assert
        response.Headers.Should().NotContainKey("X-Powered-By");
        response.Headers.Should().NotContainKey("Server");
        response.Headers.Should().NotContainKey("X-AspNet-Version");
    }
}
6. Helpers y Utilidades
public static class PayloadGenerator
{
    public static IEnumerable<string> SqlInjectionPayloads => new[]
    {
        "'; DROP TABLE Users--",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT NULL--",
        "1; DELETE FROM Users WHERE '1'='1"
    };

    public static IEnumerable<string> XssPayloads => new[]
    {
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg/onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<iframe src='javascript:alert(\"XSS\")'>"
    };

    public static IEnumerable<string> CommandInjectionPayloads => new[]
    {
        "; ls -la",
        "| cat /etc/passwd",
        "&& rm -rf /",
        "` whoami `",
        "$( ls )"
    };

    public static IEnumerable<string> PathTraversalPayloads => new[]
    {
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "....//....//....//etc/passwd"
    };
}

public class SecurityTestHelper
{
    public static string GenerarTokenExpirado()
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("your-secret-key-for-tests-min-32-chars");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "test@test.com")
            }),
            Expires = DateTime.UtcNow.AddMinutes(-10), // Expirado
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static bool ContieneSqlInjection(string input)
    {
        var sqlKeywords = new[] { "DROP", "DELETE", "INSERT", "UPDATE", "SELECT", "UNION", "--", "/*", "*/" };
        return sqlKeywords.Any(keyword => input.ToUpper().Contains(keyword));
    }

    public static bool ContieneXss(string input)
    {
        return input.Contains("<script>") ||
               input.Contains("javascript:") ||
               input.Contains("onerror=") ||
               input.Contains("onload=");
    }
}
7. Configuración de Herramientas SAST
7.1 SecurityCodeScan
.editorconfig (agregar):

# Security analyzers
dotnet_diagnostic.SCS0001.severity = error  # SQL Injection
dotnet_diagnostic.SCS0002.severity = error  # XSS
dotnet_diagnostic.SCS0003.severity = error  # XPath Injection
dotnet_diagnostic.SCS0004.severity = warning # Certificate Validation
dotnet_diagnostic.SCS0005.severity = error  # Weak Random
dotnet_diagnostic.SCS0006.severity = error  # Weak Cipher
dotnet_diagnostic.SCS0007.severity = error  # XML eXternal Entity
dotnet_diagnostic.SCS0008.severity = error  # Cookie without SSL
7.2 SonarQube Quality Gate
# sonar-project.properties
sonar.projectKey=mi-proyecto
sonar.sources=src
sonar.exclusions=**/bin/**,**/obj/**,**/*.Tests/**
sonar.cs.opencover.reportsPaths=coverage.opencover.xml

# Security hotspots
sonar.security.hotspots.minimumScore=80
sonar.qualitygate.wait=true
8. Mejores Prácticas de Security Testing
8.1 Principios
Defense in Depth - Múltiples capas de seguridad
Least Privilege - Permisos mínimos necesarios
Fail Securely - Fallar de manera segura
Don't Trust Input - Validar todas las entradas
Encrypt Sensitive Data - Encriptar datos sensibles
8.2 Checklist de Seguridad
✅ Autenticación: - [ ] JWT con algoritmo seguro (HS256, RS256) - [ ] Secret key mínimo 32 caracteres - [ ] Tokens con expiración - [ ] No credentials por defecto

✅ Autorización: - [ ] [Authorize] en endpoints protegidos - [ ] Validación de roles/políticas - [ ] No IDOR (Insecure Direct Object Reference) - [ ] 401 para no autenticado, 403 para sin permisos

✅ Inyección: - [ ] Queries parametrizadas (no string concatenation) - [ ] Sanitización de inputs (XSS) - [ ] Validación de comandos del sistema - [ ] No eval() o ejecución dinámica

✅ Datos Sensibles: - [ ] Passwords hasheadas (BCrypt/Argon2) - [ ] Datos sensibles encriptados en DB - [ ] HTTPS obligatorio en producción - [ ] No secretos en código/logs

✅ Configuración: - [ ] Security headers (HSTS, CSP, X-Frame-Options) - [ ] No detalles de error en producción - [ ] Swagger deshabilitado en producción - [ ] Dependencies actualizadas

✅ Logging: - [ ] Eventos de seguridad logueados - [ ] No datos sensibles en logs - [ ] Monitoring de intentos fallidos - [ ] Alertas configuradas

9. Integración con CI/CD
GitHub Actions
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Security Code Scan
        run: dotnet build --configuration Release

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'MiProyecto'
          path: '.'
          format: 'HTML'

      - name: Run Security Tests
        run: dotnet test tests/{Proyecto}.SecurityTests

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
10. Comandos Útiles
# Ejecutar security tests
dotnet test tests/{Proyecto}.SecurityTests

# Ejecutar con filtro OWASP
dotnet test --filter "FullyQualifiedName~OWASP"

# OWASP Dependency Check
dependency-check --project "MiProyecto" --scan . --format HTML

# SonarQube local
dotnet sonarscanner begin /k:"mi-proyecto"
dotnet build
dotnet sonarscanner end

# Security Code Scan
dotnet build /p:RunCodeAnalysis=true

# ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:5000
11. Reglas de la Skill
OWASP Top 10 obligatorio — testear las 10 vulnerabilidades principales
No confiar en inputs — validar TODAS las entradas del usuario
Autenticación robusta — JWT con algoritmos seguros, tokens con expiración
Autorización estricta — verificar permisos en cada endpoint protegido
Inyección — queries parametrizadas, sanitización de inputs
Datos sensibles — passwords hasheadas, datos encriptados, HTTPS
Security headers — HSTS, CSP, X-Frame-Options, X-Content-Type-Options
Logging seguro — loguear eventos de seguridad, NO datos sensibles
Dependencies actualizadas — no usar paquetes con vulnerabilidades conocidas
Secretos seguros — NO hardcodear, usar variables de entorno o Key Vault
Rate limiting — proteger contra brute force y DoS
Error handling — NO exponer stack traces o rutas en producción
Concurrencia — usar RowVersion para detectar conflictos
SAST integrado — SecurityCodeScan, SonarQube en pipeline
Todo en español — nombres de tests, comentarios, mensajes
Comunicación
Completado:

QA SECURITY COMPLETADO — Tests: {n} security tests — OWASP Top 10: completo — Vulnerabilidades encontradas: {n} — Tools: SecurityCodeScan + OWASP ZAP
Vulnerabilidad Crítica:

[CRITICAL] QA Security: Vulnerabilidad {tipo} detectada en {ubicacion}. Severidad: {alta|media|baja}. Acción: {recomendación}.
Feedback a desarrollador:

[SECURITY] QA Security → Desarrollador BE: {n} vulnerabilidades detectadas. Críticas: {n}, Altas: {n}, Medias: {n}. Detalles: {lista}.