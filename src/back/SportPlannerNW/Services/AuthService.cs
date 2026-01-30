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
            profile?.Language,
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

        // Verify if we need to manually insert into user_profiles or if a trigger handles it.
        // Assuming trigger handles it based on auth.users, but we need to ensure 'language' is passed.
        // If the trigger uses raw_user_meta_data, passing it in options.Data should work if the trigger reads it.
        // Failsafe: Upsert to user_profiles to ensure language is set.
        try 
        {
            var profile = new UserProfileModel 
            { 
                Id = session.User.Id!,
                FullName = fullName,
                Language = language,
                // AvatarUrl can be null
            };
            
            await _supabase.From<UserProfileModel>().Upsert(profile);
        }
        catch (Exception ex)
        {
            // Log error but don't fail registration if auth worked, 
            // though keeping profile in sync is important.
            Console.WriteLine($"Error creating profile: {ex.Message}");
        }

        return new AuthResponse(
            session.User.Id!,
            session.User.Email!,
            fullName,
            language,
            session.AccessToken,
            session.RefreshToken
        );
    }
}
