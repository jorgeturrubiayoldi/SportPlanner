using SportPlannerNW.Models.DTOs;

namespace SportPlannerNW.Services;

public interface IPlanService
{
    Task<List<PlanDto>> GetPlansByTeam(string teamId);
    Task<PlanDto?> GetPlanById(string id);
    Task<PlanDto> CreatePlan(CreatePlanDto dto, string subscriptionId);
    Task AddConceptToPlan(string planId, string conceptId, string? notes = null, DateTime? scheduledDate = null);
    Task RemoveConceptFromPlan(string planId, string conceptId);
    Task<List<PlanConceptDto>> GetPlanConcepts(string planId);
}
