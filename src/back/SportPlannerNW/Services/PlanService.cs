using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase;

namespace SportPlannerNW.Services;

public class PlanService : IPlanService
{
    private readonly Client _supabase;

    public PlanService(Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<List<PlanDto>> GetPlansByTeam(string teamId)
    {
        await _supabase.InitializeAsync();
        var result = await _supabase.From<PlanModel>()
            .Where(x => x.TeamId == teamId)
            .Order(x => x.StartDate, Supabase.Postgrest.Constants.Ordering.Ascending)
            .Get();

        return result.Models.Select(MapToDto).ToList();
    }

    public async Task<PlanDto?> GetPlanById(string id)
    {
        await _supabase.InitializeAsync();
        var result = await _supabase.From<PlanModel>()
            .Where(x => x.Id == id)
            .Single();

        return result != null ? MapToDto(result) : null;
    }

    public async Task<PlanDto> CreatePlan(CreatePlanDto dto, string subscriptionId)
    {
        await _supabase.InitializeAsync();
        var model = new PlanModel
        {
            SubscriptionId = subscriptionId,
            TeamId = dto.TeamId,
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TrainingDays = dto.TrainingDays,
            Duration = dto.Duration,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _supabase.From<PlanModel>().Insert(model);
        var createdPlan = result.Models.First();

        // Create plan concepts relations
        if (dto.ConceptIds != null && dto.ConceptIds.Any())
        {
            var planConcepts = dto.ConceptIds.Select((conceptId, index) => new PlanConceptModel
            {
                PlanId = createdPlan.Id,
                ConceptId = conceptId,
                SortOrder = index,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _supabase.From<PlanConceptModel>().Insert(planConcepts);
        }

        return MapToDto(createdPlan);
    }

    private static PlanDto MapToDto(PlanModel model)
    {
        return new PlanDto
        {
            Id = model.Id,
            TeamId = model.TeamId,
            Name = model.Name,
            Description = model.Description,
            StartDate = model.StartDate,
            EndDate = model.EndDate,
            TrainingDays = model.TrainingDays,
            Duration = model.Duration,
            IsActive = model.IsActive
        };
    }
    public async Task AddConceptToPlan(string planId, string conceptId, string? notes = null, DateTime? scheduledDate = null)
    {
        await _supabase.InitializeAsync();
        var model = new PlanConceptModel
        {
            PlanId = planId,
            ConceptId = conceptId,
            Notes = notes,
            ScheduledDate = scheduledDate,
            CreatedAt = DateTime.UtcNow
        };
        await _supabase.From<PlanConceptModel>().Insert(model);
    }

    public async Task RemoveConceptFromPlan(string planId, string conceptId)
    {
        await _supabase.InitializeAsync();
        await _supabase.From<PlanConceptModel>()
            .Where(x => x.PlanId == planId && x.ConceptId == conceptId)
            .Delete();
    }

    public async Task<List<PlanConceptDto>> GetPlanConcepts(string planId)
    {
        await _supabase.InitializeAsync();
        var result = await _supabase.From<PlanConceptModel>()
            .Where(x => x.PlanId == planId)
            .Order(x => x.SortOrder, Supabase.Postgrest.Constants.Ordering.Ascending)
            .Get();

        return result.Models.Select(x => new PlanConceptDto
        {
            Id = x.Id,
            PlanId = x.PlanId,
            ConceptId = x.ConceptId,
            Notes = x.Notes,
            ScheduledDate = x.ScheduledDate,
            SortOrder = x.SortOrder
        }).ToList();
    }
}
