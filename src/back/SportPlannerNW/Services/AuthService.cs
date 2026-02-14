using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Models;
using Supabase.Gotrue;

namespace SportPlannerNW.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(string email, string password);
    Task<AuthResponse> RegisterAsync(string fullName, string email, string password, string language);
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

        var profile = await _supabase.From<UserProfileModel>()
            .Where(p => p.Id == session.User.Id)
            .Single();

        return new AuthResponse(
            session.User.Id!,
            session.User.Email!,
            profile?.FullName ?? session.User.UserMetadata?["fullName"]?.ToString(),
            profile?.Language ?? session.User.UserMetadata?["language"]?.ToString(),
            profile?.AvatarUrl,
            session.AccessToken,
            session.RefreshToken
        );
    }

    public async Task<AuthResponse> RegisterAsync(string fullName, string email, string password, string language)
    {
        var options = new SignUpOptions
        {
            Data = new Dictionary<string, object> 
            { 
                { "fullName", fullName },
                { "language", language }
            }
        };

        var session = await _supabase.Auth.SignUp(email, password, options);

        if (session?.User == null)
            throw new Exception("No se pudo crear el usuario");

        // Failsafe: Upsert to user_profiles to ensure language is set.
        var profile = new UserProfileModel 
        { 
            Id = session.User.Id!,
            FullName = fullName,
            Language = language,
        };
        
        try 
        {
            await _supabase.From<UserProfileModel>().Upsert(profile);
        }
        catch (Exception ex)
        {
            // We log but don't fail, as the auth user is already created in Supabase
            Console.WriteLine($"[AuthService] Warning: Could not upsert user profile: {ex.Message}");
        }

        return new AuthResponse(
            session.User.Id!,
            session.User.Email!,
            fullName,
            language,
            null,
            session.AccessToken,
            session.RefreshToken
        );
    }
}
