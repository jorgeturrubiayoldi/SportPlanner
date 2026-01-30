namespace SportPlannerNW.Models.DTOs;

// ============================================
// Team DTOs
// ============================================

public record CreateTeamRequest(
    string SubscriptionId, 
    string Name, 
    string Gender,
    string? Description
);

public record UpdateTeamRequest(
    string Name, 
    string? Description,
    string Gender,
    bool IsActive
);

public record TeamResponse(
    string Id,
    string SubscriptionId,
    string Name,
    string Gender,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// ============================================
// TeamSeason DTOs
// ============================================

public record CreateTeamSeasonRequest(
    string TeamId,
    string SeasonId,
    string Category,
    string? Division
);

public record UpdateTeamSeasonRequest(
    string Category,
    string? Division,
    bool IsActive
);

public record TeamSeasonResponse(
    string Id,
    string TeamId,
    string SeasonId,
    string Category,
    string? Division,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// DTO for team with season info (joined data)
public record TeamWithSeasonResponse(
    string Id,
    string Name,
    string? Description,
    string Gender,
    bool IsActive,
    string Category,
    string? Division,
    string SeasonId,
    string SeasonName
);
