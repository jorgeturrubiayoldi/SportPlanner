using MediatR;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Models;
using Supabase.Gotrue;

namespace SportPlannerNW.Features.Auth;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly Supabase.Client _supabase;

    public LoginHandler(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var session = await _supabase.Auth.SignIn(request.Email, request.Password);

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
}
