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
            IsActive = true
        };

        var result = await _supabase.From<PlanModel>().Insert(model);
        return MapToDto(result.Models.First());
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
            IsActive = model.IsActive
        };
    }
}
