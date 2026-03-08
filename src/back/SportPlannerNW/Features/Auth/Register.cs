using MediatR;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Models;
using Supabase.Gotrue;

namespace SportPlannerNW.Features.Auth;

public record RegisterCommand(string FullName, string Email, string Password, string Language) : IRequest<AuthResponse>;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly Supabase.Client _supabase;

    public RegisterHandler(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var options = new SignUpOptions
        {
            Data = new Dictionary<string, object> 
            { 
                { "fullName", request.FullName },
                { "language", request.Language }
            }
        };

        var session = await _supabase.Auth.SignUp(request.Email, request.Password, options);

        if (session?.User == null)
            throw new Exception("No se pudo crear el usuario");

        var profile = new UserProfileModel 
        { 
            Id = session.User.Id!,
            FullName = request.FullName,
            Language = request.Language,
        };
        
        try 
        {
            await _supabase.From<UserProfileModel>().Upsert(profile);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RegisterHandler] Warning: Could not upsert user profile: {ex.Message}");
        }

        return new AuthResponse(
            session.User.Id!,
            session.User.Email!,
            request.FullName,
            request.Language,
            null,
            session.AccessToken,
            session.RefreshToken
        );
    }
}
