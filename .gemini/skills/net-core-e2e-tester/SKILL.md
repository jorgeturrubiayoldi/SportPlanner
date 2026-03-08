name: net-core-e2e-tester description: Testing E2E con Playwright .NET, simulando interaccion real de usuarios cross-browser license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code. Requiere .NET 8+ SDK metadata: role: QA Engineer

QA E2E — Testing End-to-End con Playwright .NET
Rol: Especialista en testing end-to-end con Playwright para .NET, simulando interacción real de usuarios.

Responsabilidad: Crear tests E2E que verifican flujos completos de usuario desde la interfaz web hasta el backend, ejecutando en navegadores reales (Chromium, Firefox, WebKit). Asegurar que la aplicación funciona correctamente desde la perspectiva del usuario final, incluyendo autenticación, navegación, formularios, validaciones visuales, y flujos críticos de negocio.

Alcance: Tests E2E de aplicaciones web completas (Angular + .NET API), flujos de usuario multi-página, autenticación con JWT, interacción con formularios, validación de UI, navegación, screenshots, videos de fallos, y testing cross-browser.

Información General
Framework: Playwright for .NET 1.41+
Test Runner: NUnit 4.0+ o xUnit 2.6+
Assertions: Playwright Assertions + FluentAssertions
Browsers: Chromium, Firefox, WebKit
Pattern: Page Object Model (POM)
Patrón Test: AAA (Arrange-Act-Assert)
Trace: Playwright Trace Viewer para debugging
1. Estructura de Proyecto de Tests
tests/
├── {Proyecto}.E2ETests/
│   ├── PageObjects/
│   │   ├── BasePage.cs
│   │   ├── LoginPage.cs
│   │   ├── HomePage.cs
│   │   └── {Entidad}Page.cs
│   ├── Tests/
│   │   ├── AuthenticationTests.cs
│   │   ├── {Entidad}CrudTests.cs
│   │   └── NavigationTests.cs
│   ├── Fixtures/
│   │   ├── PlaywrightFixture.cs
│   │   └── TestDataFixture.cs
│   ├── Helpers/
│   │   ├── ScreenshotHelper.cs
│   │   └── WaitHelper.cs
│   ├── playwright.config.json
│   └── {Proyecto}.E2ETests.csproj
2. Configuración de Proyecto
{Proyecto}.E2ETests.csproj

<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Playwright" Version="1.41.0" />
    <PackageReference Include="Microsoft.Playwright.NUnit" Version="1.41.0" />
    <PackageReference Include="NUnit" Version="4.0.1" />
    <PackageReference Include="NUnit3TestAdapter" Version="4.5.0" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Bogus" Version="35.4.0" />
  </ItemGroup>

</Project>
Instalación de Browsers
# Instalar Playwright browsers (Chromium, Firefox, WebKit)
pwsh bin/Debug/net8.0/playwright.ps1 install

# O usando .NET CLI
dotnet build
playwright install
3. Playwright Fixture (NUnit)
[SetUpFixture]
public class PlaywrightFixture
{
    public static IPlaywright? Playwright { get; private set; }
    public static IBrowser? Browser { get; private set; }

    [OneTimeSetUp]
    public async Task GlobalSetup()
    {
        // Inicializar Playwright
        Playwright = await Microsoft.Playwright.Playwright.CreateAsync();

        // Lanzar browser (headless por defecto)
        Browser = await Playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            SlowMo = 50 // Ralentizar 50ms para estabilidad
        });
    }

    [OneTimeTearDown]
    public async Task GlobalTeardown()
    {
        if (Browser != null)
        {
            await Browser.CloseAsync();
        }

        Playwright?.Dispose();
    }
}

public class BaseE2ETest
{
    protected IPage Page = null!;
    protected IBrowserContext Context = null!;
    protected const string BaseUrl = "http://localhost:4200"; // Angular app
    protected const string ApiUrl = "http://localhost:5000"; // .NET API

    [SetUp]
    public async Task Setup()
    {
        // Crear nuevo contexto para cada test (aislamiento)
        Context = await PlaywrightFixture.Browser!.NewContextAsync(new BrowserNewContextOptions
        {
            BaseURL = BaseUrl,
            ViewportSize = new ViewportSize { Width = 1920, Height = 1080 },
            RecordVideoDir = "videos/",
            RecordVideoSize = new RecordVideoSize { Width = 1920, Height = 1080 }
        });

        // Habilitar tracing para debugging
        await Context.Tracing.StartAsync(new TracingStartOptions
        {
            Screenshots = true,
            Snapshots = true,
            Sources = true
        });

        Page = await Context.NewPageAsync();
    }

    [TearDown]
    public async Task Teardown()
    {
        // Guardar trace en caso de fallo
        var testName = TestContext.CurrentContext.Test.Name;
        var testStatus = TestContext.CurrentContext.Result.Outcome.Status;

        if (testStatus == NUnit.Framework.Interfaces.TestStatus.Failed)
        {
            await Context.Tracing.StopAsync(new TracingStopOptions
            {
                Path = $"traces/{testName}.zip"
            });

            // Screenshot del fallo
            await Page.ScreenshotAsync(new PageScreenshotOptions
            {
                Path = $"screenshots/{testName}_failure.png",
                FullPage = true
            });
        }
        else
        {
            await Context.Tracing.StopAsync();
        }

        await Page.CloseAsync();
        await Context.CloseAsync();
    }

    protected async Task<string> LoginAsync(string email, string password)
    {
        var loginPage = new LoginPage(Page);
        await loginPage.NavigateAsync();
        await loginPage.LoginAsync(email, password);

        // Retornar token JWT del localStorage
        var token = await Page.EvaluateAsync<string>("() => localStorage.getItem('authToken')");
        return token;
    }
}
4. Page Object Model (POM)
4.1 BasePage
public abstract class BasePage
{
    protected readonly IPage _page;
    protected readonly string _baseUrl;

    protected BasePage(IPage page, string baseUrl = "http://localhost:4200")
    {
        _page = page;
        _baseUrl = baseUrl;
    }

    public virtual async Task NavigateAsync(string path = "")
    {
        await _page.GotoAsync($"{_baseUrl}{path}");
        await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    protected async Task ClickAsync(string selector)
    {
        await _page.Locator(selector).ClickAsync();
    }

    protected async Task FillAsync(string selector, string value)
    {
        await _page.Locator(selector).FillAsync(value);
    }

    protected async Task<string> GetTextAsync(string selector)
    {
        return await _page.Locator(selector).TextContentAsync() ?? string.Empty;
    }

    protected async Task WaitForSelectorAsync(string selector, int timeout = 5000)
    {
        await _page.WaitForSelectorAsync(selector, new PageWaitForSelectorOptions
        {
            Timeout = timeout
        });
    }

    protected async Task<bool> IsVisibleAsync(string selector)
    {
        return await _page.Locator(selector).IsVisibleAsync();
    }

    protected async Task SelectOptionAsync(string selector, string value)
    {
        await _page.Locator(selector).SelectOptionAsync(value);
    }

    protected async Task CheckAsync(string selector)
    {
        await _page.Locator(selector).CheckAsync();
    }

    protected async Task<string> GetAttributeAsync(string selector, string attribute)
    {
        return await _page.Locator(selector).GetAttributeAsync(attribute) ?? string.Empty;
    }
}
4.2 LoginPage
public class LoginPage : BasePage
{
    // Selectores
    private const string EmailInput = "input[name='email']";
    private const string PasswordInput = "input[name='password']";
    private const string LoginButton = "button[type='submit']";
    private const string ErrorMessage = ".alert-danger";
    private const string SuccessMessage = ".alert-success";

    public LoginPage(IPage page) : base(page)
    {
    }

    public override async Task NavigateAsync(string path = "")
    {
        await base.NavigateAsync("/login");
    }

    public async Task LoginAsync(string email, string password)
    {
        await FillAsync(EmailInput, email);
        await FillAsync(PasswordInput, password);
        await ClickAsync(LoginButton);

        // Esperar navegación o mensaje de error
        await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task<bool> IsErrorDisplayedAsync()
    {
        return await IsVisibleAsync(ErrorMessage);
    }

    public async Task<string> GetErrorMessageAsync()
    {
        return await GetTextAsync(ErrorMessage);
    }

    public async Task<bool> IsLoggedInAsync()
    {
        // Verificar si existe token en localStorage
        var token = await _page.EvaluateAsync<string>("() => localStorage.getItem('authToken')");
        return !string.IsNullOrEmpty(token);
    }
}
4.3 HomePage
public class HomePage : BasePage
{
    // Selectores
    private const string NavbarBrand = ".navbar-brand";
    private const string UserMenu = "#user-menu";
    private const string LogoutButton = "#logout-btn";
    private const string WelcomeMessage = ".welcome-message";
    private const string EntidadesMenu = "a[href='/entidades']";

    public HomePage(IPage page) : base(page)
    {
    }

    public override async Task NavigateAsync(string path = "")
    {
        await base.NavigateAsync("/home");
    }

    public async Task<string> GetWelcomeMessageAsync()
    {
        return await GetTextAsync(WelcomeMessage);
    }

    public async Task LogoutAsync()
    {
        await ClickAsync(UserMenu);
        await ClickAsync(LogoutButton);
        await _page.WaitForURLAsync("**/login");
    }

    public async Task NavigateToEntidadesAsync()
    {
        await ClickAsync(EntidadesMenu);
        await _page.WaitForURLAsync("**/entidades");
    }

    public async Task<bool> IsUserLoggedInAsync()
    {
        return await IsVisibleAsync(UserMenu);
    }
}
4.4 {Entidad}Page (CRUD)
public class {Entidad}Page : BasePage
{
    // Selectores
    private const string CreateButton = "#create-btn";
    private const string NombreInput = "input[name='nombre']";
    private const string DescripcionInput = "textarea[name='descripcion']";
    private const string ActivoCheckbox = "input[name='activo']";
    private const string SaveButton = "#save-btn";
    private const string CancelButton = "#cancel-btn";
    private const string Table = "table.entidades-table";
    private const string TableRows = "table.entidades-table tbody tr";
    private const string SearchInput = "#search-input";
    private const string SuccessToast = ".toast-success";
    private const string ErrorToast = ".toast-error";

    public {Entidad}Page(IPage page) : base(page)
    {
    }

    public override async Task NavigateAsync(string path = "")
    {
        await base.NavigateAsync("/entidades");
    }

    public async Task ClickCreateAsync()
    {
        await ClickAsync(CreateButton);
        await WaitForSelectorAsync(NombreInput);
    }

    public async Task FillFormAsync(string nombre, string descripcion, bool activo = true)
    {
        await FillAsync(NombreInput, nombre);
        await FillAsync(DescripcionInput, descripcion);

        if (activo)
        {
            await CheckAsync(ActivoCheckbox);
        }
    }

    public async Task ClickSaveAsync()
    {
        await ClickAsync(SaveButton);
        await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task ClickCancelAsync()
    {
        await ClickAsync(CancelButton);
    }

    public async Task<int> GetTableRowCountAsync()
    {
        var rows = await _page.Locator(TableRows).CountAsync();
        return rows;
    }

    public async Task<bool> IsSuccessToastDisplayedAsync()
    {
        return await IsVisibleAsync(SuccessToast);
    }

    public async Task<string> GetSuccessMessageAsync()
    {
        return await GetTextAsync(SuccessToast);
    }

    public async Task SearchAsync(string searchTerm)
    {
        await FillAsync(SearchInput, searchTerm);
        await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task ClickEditAsync(int rowIndex)
    {
        await _page.Locator($"{TableRows}:nth-child({rowIndex + 1}) .edit-btn").ClickAsync();
        await WaitForSelectorAsync(NombreInput);
    }

    public async Task ClickDeleteAsync(int rowIndex)
    {
        await _page.Locator($"{TableRows}:nth-child({rowIndex + 1}) .delete-btn").ClickAsync();

        // Confirmar diálogo de eliminación
        _page.Dialog += async (_, dialog) => await dialog.AcceptAsync();
    }

    public async Task<bool> ExistsInTableAsync(string nombre)
    {
        var count = await _page.Locator($"{TableRows}:has-text('{nombre}')").CountAsync();
        return count > 0;
    }
}
5. Tests de Autenticación
[TestFixture]
public class AuthenticationTests : BaseE2ETest
{
    [Test]
    public async Task Login_ConCredencialesValidas_RedirigeAHome()
    {
        // Arrange
        var loginPage = new LoginPage(Page);
        await loginPage.NavigateAsync();

        // Act
        await loginPage.LoginAsync("admin@test.com", "Admin123!");

        // Assert
        await Expect(Page).ToHaveURLAsync(new Regex(".*/home"));

        var isLoggedIn = await loginPage.IsLoggedInAsync();
        isLoggedIn.Should().BeTrue();
    }

    [Test]
    public async Task Login_ConCredencialesInvalidas_MuestraError()
    {
        // Arrange
        var loginPage = new LoginPage(Page);
        await loginPage.NavigateAsync();

        // Act
        await loginPage.LoginAsync("invalido@test.com", "WrongPassword");

        // Assert
        var isErrorDisplayed = await loginPage.IsErrorDisplayedAsync();
        isErrorDisplayed.Should().BeTrue();

        var errorMessage = await loginPage.GetErrorMessageAsync();
        errorMessage.Should().Contain("Credenciales inválidas");
    }

    [Test]
    public async Task Login_ConCamposVacios_MuestraErroresValidacion()
    {
        // Arrange
        var loginPage = new LoginPage(Page);
        await loginPage.NavigateAsync();

        // Act
        await loginPage.LoginAsync("", "");

        // Assert
        var emailError = await Page.Locator(".email-error").IsVisibleAsync();
        var passwordError = await Page.Locator(".password-error").IsVisibleAsync();

        emailError.Should().BeTrue();
        passwordError.Should().BeTrue();
    }

    [Test]
    public async Task Logout_CuandoUsuarioEstaLogueado_RedirigeALogin()
    {
        // Arrange
        await LoginAsync("admin@test.com", "Admin123!");
        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        // Act
        await homePage.LogoutAsync();

        // Assert
        await Expect(Page).ToHaveURLAsync(new Regex(".*/login"));

        var token = await Page.EvaluateAsync<string>("() => localStorage.getItem('authToken')");
        token.Should().BeNullOrEmpty();
    }
}
6. Tests de CRUD Completo
[TestFixture]
public class {Entidad}CrudTests : BaseE2ETest
{
    [SetUp]
    public new async Task Setup()
    {
        await base.Setup();
        // Login antes de cada test
        await LoginAsync("admin@test.com", "Admin123!");
    }

    [Test]
    public async Task Crear_ConDatosValidos_CreaEntidadYMuestraEnTabla()
    {
        // Arrange
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        var nombre = $"Entidad Test {DateTime.Now.Ticks}";
        var descripcion = "Descripción de prueba E2E";

        // Act
        await entidadPage.ClickCreateAsync();
        await entidadPage.FillFormAsync(nombre, descripcion, activo: true);
        await entidadPage.ClickSaveAsync();

        // Assert
        var isSuccessDisplayed = await entidadPage.IsSuccessToastDisplayedAsync();
        isSuccessDisplayed.Should().BeTrue();

        var existsInTable = await entidadPage.ExistsInTableAsync(nombre);
        existsInTable.Should().BeTrue();
    }

    [Test]
    public async Task Crear_ConNombreVacio_MuestraErrorValidacion()
    {
        // Arrange
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        // Act
        await entidadPage.ClickCreateAsync();
        await entidadPage.FillFormAsync("", "Descripción sin nombre", activo: true);
        await entidadPage.ClickSaveAsync();

        // Assert
        var nombreError = await Page.Locator(".nombre-error").IsVisibleAsync();
        nombreError.Should().BeTrue();
    }

    [Test]
    public async Task Editar_EntidadExistente_ActualizaDatos()
    {
        // Arrange
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        // Crear entidad primero
        var nombreOriginal = $"Original {DateTime.Now.Ticks}";
        await entidadPage.ClickCreateAsync();
        await entidadPage.FillFormAsync(nombreOriginal, "Descripción original", true);
        await entidadPage.ClickSaveAsync();

        // Act
        await entidadPage.ClickEditAsync(0); // Primera fila
        var nombreActualizado = $"Actualizado {DateTime.Now.Ticks}";
        await entidadPage.FillFormAsync(nombreActualizado, "Descripción actualizada", true);
        await entidadPage.ClickSaveAsync();

        // Assert
        var existsInTable = await entidadPage.ExistsInTableAsync(nombreActualizado);
        existsInTable.Should().BeTrue();

        var originalExists = await entidadPage.ExistsInTableAsync(nombreOriginal);
        originalExists.Should().BeFalse();
    }

    [Test]
    public async Task Eliminar_EntidadExistente_RemueveDeTabla()
    {
        // Arrange
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        var nombre = $"A Eliminar {DateTime.Now.Ticks}";
        await entidadPage.ClickCreateAsync();
        await entidadPage.FillFormAsync(nombre, "Será eliminada", true);
        await entidadPage.ClickSaveAsync();

        var rowCountBefore = await entidadPage.GetTableRowCountAsync();

        // Act
        await entidadPage.ClickDeleteAsync(0);
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        var rowCountAfter = await entidadPage.GetTableRowCountAsync();
        rowCountAfter.Should().Be(rowCountBefore - 1);

        var exists = await entidadPage.ExistsInTableAsync(nombre);
        exists.Should().BeFalse();
    }

    [Test]
    public async Task Buscar_ConTermino_FiltraResultados()
    {
        // Arrange
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        var nombreBuscable = $"Buscable{DateTime.Now.Ticks}";
        await entidadPage.ClickCreateAsync();
        await entidadPage.FillFormAsync(nombreBuscable, "Descripción", true);
        await entidadPage.ClickSaveAsync();

        // Act
        await entidadPage.SearchAsync(nombreBuscable);

        // Assert
        var rowCount = await entidadPage.GetTableRowCountAsync();
        rowCount.Should().BeGreaterThan(0);

        var exists = await entidadPage.ExistsInTableAsync(nombreBuscable);
        exists.Should().BeTrue();
    }

    [Test]
    public async Task Cancelar_AlCrear_NoGuardaCambios()
    {
        // Arrange
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        var rowCountBefore = await entidadPage.GetTableRowCountAsync();

        // Act
        await entidadPage.ClickCreateAsync();
        await entidadPage.FillFormAsync("No se guardará", "Descripción", true);
        await entidadPage.ClickCancelAsync();

        // Assert
        var rowCountAfter = await entidadPage.GetTableRowCountAsync();
        rowCountAfter.Should().Be(rowCountBefore);
    }
}
7. Tests de Navegación
[TestFixture]
public class NavigationTests : BaseE2ETest
{
    [SetUp]
    public new async Task Setup()
    {
        await base.Setup();
        await LoginAsync("admin@test.com", "Admin123!");
    }

    [Test]
    public async Task Navigation_DesdeHomeAEntidades_CargaPaginaCorrectamente()
    {
        // Arrange
        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        // Act
        await homePage.NavigateToEntidadesAsync();

        // Assert
        await Expect(Page).ToHaveURLAsync(new Regex(".*/entidades"));
        await Expect(Page.Locator("h1")).ToContainTextAsync("Entidades");
    }

    [Test]
    public async Task Navigation_SinAutenticacion_RedirigeALogin()
    {
        // Arrange - Limpiar token
        await Page.EvaluateAsync("() => localStorage.removeItem('authToken')");

        // Act
        await Page.GotoAsync($"{BaseUrl}/entidades");

        // Assert
        await Expect(Page).ToHaveURLAsync(new Regex(".*/login"));
    }

    [Test]
    public async Task BrowserBackButton_DespuesDeNavegar_FuncionaCorrectamente()
    {
        // Arrange
        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        // Act
        await homePage.NavigateToEntidadesAsync();
        await Page.GoBackAsync();

        // Assert
        await Expect(Page).ToHaveURLAsync(new Regex(".*/home"));
    }
}
8. Tests Cross-Browser
[TestFixture]
public class CrossBrowserTests
{
    private IPlaywright _playwright = null!;
    private IBrowser _chromiumBrowser = null!;
    private IBrowser _firefoxBrowser = null!;
    private IBrowser _webkitBrowser = null!;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _playwright = await Microsoft.Playwright.Playwright.CreateAsync();

        _chromiumBrowser = await _playwright.Chromium.LaunchAsync();
        _firefoxBrowser = await _playwright.Firefox.LaunchAsync();
        _webkitBrowser = await _playwright.Webkit.LaunchAsync();
    }

    [OneTimeTearDown]
    public async Task Teardown()
    {
        await _chromiumBrowser.CloseAsync();
        await _firefoxBrowser.CloseAsync();
        await _webkitBrowser.CloseAsync();
        _playwright.Dispose();
    }

    [TestCase("chromium")]
    [TestCase("firefox")]
    [TestCase("webkit")]
    public async Task Login_EnDiferentesBrowsers_FuncionaCorrectamente(string browserType)
    {
        // Arrange
        var browser = browserType switch
        {
            "chromium" => _chromiumBrowser,
            "firefox" => _firefoxBrowser,
            "webkit" => _webkitBrowser,
            _ => throw new ArgumentException("Browser inválido")
        };

        var context = await browser.NewContextAsync(new BrowserNewContextOptions
        {
            BaseURL = "http://localhost:4200"
        });

        var page = await context.NewPageAsync();

        // Act
        var loginPage = new LoginPage(page);
        await loginPage.NavigateAsync();
        await loginPage.LoginAsync("admin@test.com", "Admin123!");

        // Assert
        await Expect(page).ToHaveURLAsync(new Regex(".*/home"));

        var isLoggedIn = await loginPage.IsLoggedInAsync();
        isLoggedIn.Should().BeTrue();

        await page.CloseAsync();
        await context.CloseAsync();
    }
}
9. Tests de Responsive Design
[TestFixture]
public class ResponsiveTests : BaseE2ETest
{
    [Test]
    public async Task Layout_EnMovil_MuestraMenuHamburguesa()
    {
        // Arrange
        await Context.SetViewportSizeAsync(375, 667); // iPhone SE
        await LoginAsync("admin@test.com", "Admin123!");

        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        // Act
        var hamburgerMenu = Page.Locator(".navbar-toggler");

        // Assert
        await Expect(hamburgerMenu).ToBeVisibleAsync();
    }

    [Test]
    public async Task Layout_EnTablet_AjustaColumnas()
    {
        // Arrange
        await Context.SetViewportSizeAsync(768, 1024); // iPad
        await LoginAsync("admin@test.com", "Admin123!");

        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        // Act & Assert
        var table = Page.Locator("table.entidades-table");
        await Expect(table).ToBeVisibleAsync();
    }

    [TestCase(1920, 1080)] // Desktop
    [TestCase(1366, 768)]  // Laptop
    [TestCase(768, 1024)]  // Tablet
    [TestCase(375, 667)]   // Mobile
    public async Task Application_EnDiferentesResoluciones_RenderizaCorrectamente(int width, int height)
    {
        // Arrange
        await Context.SetViewportSizeAsync(width, height);
        await LoginAsync("admin@test.com", "Admin123!");

        // Act
        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        // Assert
        await Expect(Page.Locator(".navbar-brand")).ToBeVisibleAsync();
    }
}
10. Tests de Performance
[TestFixture]
public class PerformanceTests : BaseE2ETest
{
    [Test]
    public async Task LoadTime_PaginaPrincipal_MenosDe3Segundos()
    {
        // Arrange
        await LoginAsync("admin@test.com", "Admin123!");
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        // Act
        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(3000);
    }

    [Test]
    public async Task API_Responses_MenosDe500ms()
    {
        // Arrange
        await LoginAsync("admin@test.com", "Admin123!");

        var apiResponseTimes = new List<long>();

        Page.Response += (_, response) =>
        {
            if (response.Url.Contains("/api/v1/"))
            {
                var timing = response.Request.Timing;
                apiResponseTimes.Add((long)timing.ResponseEnd);
            }
        };

        // Act
        var entidadPage = new {Entidad}Page(Page);
        await entidadPage.NavigateAsync();

        // Assert
        apiResponseTimes.Should().NotBeEmpty();
        apiResponseTimes.Average().Should().BeLessThan(500);
    }
}
11. Screenshot y Video Helpers
public static class ScreenshotHelper
{
    public static async Task TakeScreenshotAsync(IPage page, string fileName)
    {
        var screenshotPath = Path.Combine("screenshots", $"{fileName}_{DateTime.Now:yyyyMMdd_HHmmss}.png");

        Directory.CreateDirectory("screenshots");

        await page.ScreenshotAsync(new PageScreenshotOptions
        {
            Path = screenshotPath,
            FullPage = true
        });

        TestContext.AddTestAttachment(screenshotPath, $"Screenshot: {fileName}");
    }

    public static async Task TakeElementScreenshotAsync(IPage page, string selector, string fileName)
    {
        var screenshotPath = Path.Combine("screenshots", $"{fileName}_{DateTime.Now:yyyyMMdd_HHmmss}.png");

        Directory.CreateDirectory("screenshots");

        await page.Locator(selector).ScreenshotAsync(new LocatorScreenshotOptions
        {
            Path = screenshotPath
        });

        TestContext.AddTestAttachment(screenshotPath, $"Element Screenshot: {fileName}");
    }
}
12. Wait Helpers
public static class WaitHelper
{
    public static async Task WaitForApiResponseAsync(
        IPage page,
        string urlPattern,
        int timeoutMs = 5000)
    {
        var tcs = new TaskCompletionSource<IResponse>();

        void ResponseHandler(object? sender, IResponse response)
        {
            if (response.Url.Contains(urlPattern))
            {
                tcs.TrySetResult(response);
            }
        }

        page.Response += ResponseHandler;

        var timeoutTask = Task.Delay(timeoutMs);
        var completedTask = await Task.WhenAny(tcs.Task, timeoutTask);

        page.Response -= ResponseHandler;

        if (completedTask == timeoutTask)
        {
            throw new TimeoutException($"No se recibió respuesta de API para: {urlPattern}");
        }
    }

    public static async Task WaitForLoadingSpinnerAsync(IPage page, int timeoutMs = 10000)
    {
        // Esperar a que aparezca el spinner
        try
        {
            await page.WaitForSelectorAsync(".loading-spinner", new PageWaitForSelectorOptions
            {
                State = WaitForSelectorState.Visible,
                Timeout = 1000
            });
        }
        catch (TimeoutException)
        {
            // No apareció spinner, continuar
            return;
        }

        // Esperar a que desaparezca
        await page.WaitForSelectorAsync(".loading-spinner", new PageWaitForSelectorOptions
        {
            State = WaitForSelectorState.Hidden,
            Timeout = timeoutMs
        });
    }
}
13. Playwright Configuration
playwright.config.json

{
  "timeout": 30000,
  "expect": {
    "timeout": 5000
  },
  "use": {
    "baseURL": "http://localhost:4200",
    "trace": "retain-on-failure",
    "screenshot": "only-on-failure",
    "video": "retain-on-failure"
  },
  "projects": [
    {
      "name": "chromium",
      "use": {
        "browserName": "chromium"
      }
    },
    {
      "name": "firefox",
      "use": {
        "browserName": "firefox"
      }
    },
    {
      "name": "webkit",
      "use": {
        "browserName": "webkit"
      }
    }
  ],
  "reporter": [
    ["html", { "outputFolder": "playwright-report" }],
    ["junit", { "outputFile": "test-results/junit.xml" }]
  ]
}
14. Mejores Prácticas
14.1 Page Object Model
Una clase por página — cada página/componente tiene su POM
Selectores como constantes — nunca hardcodear selectores en tests
Métodos de negocio — LoginAsync() no FillEmailAndClickButton()
Retornar page objects — para fluent API
Herencia de BasePage — reutilizar métodos comunes
14.2 Selectores Estables
// ❌ MAL - Selectores frágiles
private const string Button = "button:nth-child(3)";
private const string Input = "div > div > input";

// ✅ BIEN - Selectores estables
private const string LoginButton = "#login-btn";
private const string EmailInput = "input[name='email']";
private const string SubmitButton = "button[type='submit']";
private const string ErrorMessage = "[data-testid='error-message']";
Recomendación: Agregar data-testid en el frontend para selectores estables:

<button data-testid="create-entity-btn">Crear</button>
<div data-testid="success-toast">Operación exitosa</div>
14.3 Esperas Inteligentes
// ❌ MAL - Esperas fijas
await Task.Delay(3000);

// ✅ BIEN - Esperas condicionales
await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
await Page.WaitForSelectorAsync("#content", new() { State = WaitForSelectorState.Visible });
await Expect(Page.Locator(".toast")).ToBeVisibleAsync();
14.4 Aislamiento de Tests
Nuevo contexto por test — evitar contaminación entre tests
Cleanup automático — Respawn o limpiar DB después de cada test
Datos únicos — usar timestamps o GUIDs en nombres
No depender de orden — tests deben ejecutarse en cualquier orden
14.5 Debugging
Ver trace de fallo:

playwright show-trace traces/Test_Fallido.zip
Ejecutar en modo headed (no headless):

Browser = await Playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
{
    Headless = false,
    SlowMo = 100
});
Pausar ejecución para debugging:

await Page.PauseAsync(); // Abre Playwright Inspector
15. Comandos Útiles
# Ejecutar todos los tests E2E
dotnet test tests/{Proyecto}.E2ETests/{Proyecto}.E2ETests.csproj

# Ejecutar solo en Chromium
dotnet test --filter "FullyQualifiedName~ChromiumTests"

# Ejecutar con headed mode (ver browser)
HEADED=1 dotnet test

# Ver trace de fallos
playwright show-trace traces/Login_ConCredencialesInvalidas.zip

# Generar reporte HTML
playwright show-report playwright-report

# Actualizar browsers
playwright install

# Limpiar screenshots y videos viejos
rm -rf screenshots/* videos/* traces/*
16. Reglas de la Skill
Page Object Model obligatorio — nunca selectores directos en tests
Selectores estables — usar data-testid, name, id, no CSS frágiles
Patrón AAA — Arrange (navegar, login), Act (interacción), Assert (verificar UI + estado)
Esperas inteligentes — WaitForLoadStateAsync, Expect().ToBeVisibleAsync(), no Task.Delay()
Aislamiento — nuevo contexto por test, datos únicos
Screenshots en fallos — capturar automáticamente en TearDown
Traces habilitados — siempre grabar trace para debugging
Cross-browser — testear en Chromium, Firefox, WebKit
Responsive — testear en mobile, tablet, desktop
No hardcodear URLs — usar constantes BaseUrl, ApiUrl
Login helper — reutilizar método LoginAsync() en BaseE2ETest
Verificar UI Y API — no solo UI, también verificar estado en backend
Videos solo en fallos — configurar RecordVideoDir + retain-on-failure
Nombres descriptivos — Login_ConCredencialesValidas_RedirigeAHome
Todo en español — nombres de métodos, comentarios, mensajes
17. Qué Testear en E2E
✅ SI testear: - Flujos críticos de usuario (login, checkout, CRUD completo) - Navegación entre páginas - Autenticación y autorización visual - Formularios y validaciones - Interacción con elementos (click, fill, select) - Responsive design (mobile, tablet, desktop) - Cross-browser compatibility - Performance básico (tiempos de carga)

❌ NO testear (ya cubierto en otros niveles): - Lógica de negocio aislada (unit tests) - Validaciones backend (integration tests) - Casos edge de validadores (unit tests) - Mapeo de DTOs (unit tests)

Comunicación
Completado:

QA E2E COMPLETADO — Tests creados: {n} E2E tests — Browsers: Chromium + Firefox + WebKit — Page Objects: {n} — Coverage: Flujos críticos + Auth + CRUD
Bloqueo:

[BLOCKER] QA E2E: {razon}. Necesito: {que}.
Feedback a desarrollador frontend:

[FEEDBACK] QA E2E → Desarrollador FE: Selectores inestables detectados. Agregar data-testid en: {lista}.
Feedback a desarrollador backend:

[FEEDBACK] QA E2E → Desarrollador BE: API responses lentas. Endpoints: {lista} — Tiempos: {tiempos}.