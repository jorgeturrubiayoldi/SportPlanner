using SportPlannerNW.Models.DTOs;

namespace SportPlannerNW.Services;

public interface IPlanService
{
    Task<List<PlanDto>> GetPlansByTeam(string teamId);
    Task<PlanDto?> GetPlanById(string id);
    Task<PlanDto> CreatePlan(CreatePlanDto dto, string subscriptionId);
}
