namespace SportPlannerNW.Models.DTOs;

public record CreateSeasonRequest(string UserId, string Name, DateTime StartDate, DateTime? EndDate);
public record SeasonResponse(string Id, string Name, bool IsActive);
