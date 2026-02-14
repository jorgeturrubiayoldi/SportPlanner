using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Models;
using Supabase;

namespace SportPlannerNW.Services;

public interface IPerformanceService
{
    Task TrackAttendanceAsync(string planConceptId, string playerId, string status, string? notes);
    Task UpdateStatsAsync(string planConceptId, string playerId, double rating, int physicalLoad, int technical, int tactical, string? comments);
    Task<List<AttendanceDto>> GetTeamAttendanceAsync(string teamId);
}

public class PerformanceService : IPerformanceService
{
    private readonly Client _supabase;

    public PerformanceService(Client supabase)
    {
        _supabase = supabase;
    }

    public async Task TrackAttendanceAsync(string planConceptId, string playerId, string status, string? notes)
    {
        await _supabase.InitializeAsync();
        var model = new SessionAttendanceModel 
        { 
            PlanConceptId = planConceptId, 
            PlayerId = playerId, 
            Status = status, 
            Notes = notes,
            UpdatedAt = DateTime.UtcNow 
        };
        
        await _supabase.From<SessionAttendanceModel>().Upsert(model);
    }

    public async Task UpdateStatsAsync(string planConceptId, string playerId, double rating, int physicalLoad, int technical, int tactical, string? comments)
    {
        await _supabase.InitializeAsync();
        var model = new PlayerPerformanceStatsModel 
        { 
            PlanConceptId = planConceptId, 
            PlayerId = playerId, 
            Rating = rating,
            PhysicalLoad = physicalLoad,
            TechnicalScore = technical,
            TacticalScore = tactical,
            Comments = comments,
            UpdatedAt = DateTime.UtcNow 
        };
        
        await _supabase.From<PlayerPerformanceStatsModel>().Upsert(model);
    }

    public async Task<List<AttendanceDto>> GetTeamAttendanceAsync(string teamId)
    {
        // Lógica para obtener asistencia agregada del equipo (Próximamente)
        return new List<AttendanceDto>();
    }
}

public record AttendanceDto(string PlayerId, string Status, string? Notes);
