using SportPlannerNW.Models.DTOs;
using Supabase.Gotrue;

namespace SportPlannerNW.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(string email, string password);
    Task<AuthResponse> RegisterAsync(string fullName, string email, string password);
}

public class AuthService : IAuthService
{
    private readonly Supabase.Client _supabase;

    public AuthService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<AuthResponse> LoginAsync(string email, string password)
    {
        var session = await _supabase.Auth.SignIn(email, password);

        if (session?.User == null)
            throw new Exception("Credenciales inválidas");

        return new AuthResponse(
            session.User.Id!,
            session.User.Email!,
            session.User.UserMetadata?["fullName"]?.ToString(),
            session.AccessToken,
            session.RefreshToken
        );
    }

    public async Task<AuthResponse> RegisterAsync(string fullName, string email, string password)
    {
        var options = new SignUpOptions
        {
            Data = new Dictionary<string, object> { { "fullName", fullName } }
        };

        var session = await _supabase.Auth.SignUp(email, password, options);

        if (session?.User == null)
            throw new Exception("No se pudo crear el usuario");

        return new AuthResponse(
            session.User.Id!,
            session.User.Email!,
            fullName,
            session.AccessToken,
            session.RefreshToken
        );
    }
}
