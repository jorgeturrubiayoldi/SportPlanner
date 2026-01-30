namespace SportPlannerNW.Models.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password, string FullName, string Language);

public record AuthResponse(string Id, string Email, string? FullName, string? Language, string? Token, string? RefreshToken);
