namespace SportPlannerNW.Models.DTOs;

public record CreateSeasonRequest(string UserId, string Name, DateTime StartDate, DateTime? EndDate);
public record UpdateSeasonRequest(string UserId, string Name, DateTime StartDate, DateTime? EndDate);
public record ActivateSeasonRequest(string UserId);
public record SeasonResponse(string Id, string SubscriptionId, string Name, bool IsActive);
