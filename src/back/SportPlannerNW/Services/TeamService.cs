using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface ITeamService
{
    Task<IEnumerable<TeamResponse>> GetTeamsAsync(string subscriptionId);
    Task<IEnumerable<TeamWithSeasonResponse>> GetTeamsBySeasonAsync(string seasonId);
    Task<TeamResponse?> GetTeamByIdAsync(string teamId);
    Task<TeamResponse> CreateTeamAsync(CreateTeamRequest request);
    Task<TeamResponse> UpdateTeamAsync(string teamId, UpdateTeamRequest request);
    Task DeleteTeamAsync(string teamId);
    
    // TeamSeason operations
    Task<TeamSeasonResponse> CreateTeamSeasonAsync(CreateTeamSeasonRequest request);
    Task<TeamSeasonResponse> UpdateTeamSeasonAsync(string teamSeasonId, UpdateTeamSeasonRequest request);
    Task<IEnumerable<TeamSeasonResponse>> GetTeamSeasonsAsync(string teamId);
}

public class TeamService : ITeamService
{
    private readonly Supabase.Client _supabase;

    public TeamService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<IEnumerable<TeamResponse>> GetTeamsAsync(string subscriptionId)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<TeamModel>()
            .Filter("subscription_id", Constants.Operator.Equals, subscriptionId)
            .Filter("is_active", Constants.Operator.Equals, "true")
            .Get();

        return response.Models.Select(t => new TeamResponse(
            t.Id,
            t.SubscriptionId,
            t.Name,
            t.Gender,
            t.Description,
            t.IsActive,
            t.CreatedAt,
            t.UpdatedAt
        ));
    }

    public async Task<IEnumerable<TeamWithSeasonResponse>> GetTeamsBySeasonAsync(string seasonId)
    {
        await _supabase.InitializeAsync();

        // Query para obtener teams con su configuración de temporada
        var teamSeasons = await _supabase.From<TeamSeasonModel>()
            .Filter("season_id", Constants.Operator.Equals, seasonId)
            .Filter("is_active", Constants.Operator.Equals, "true")
            .Get();

        var results = new List<TeamWithSeasonResponse>();

        foreach (var ts in teamSeasons.Models)
        {
            var team = await _supabase.From<TeamModel>()
                .Filter("id", Constants.Operator.Equals, ts.TeamId)
                .Single();

            var season = await _supabase.From<SeasonModel>()
                .Filter("id", Constants.Operator.Equals, ts.SeasonId)
                .Single();

            if (team != null && season != null)
            {
                results.Add(new TeamWithSeasonResponse(
                    team.Id,
                    team.Name,
                    team.Description,
                    team.Gender,
                    team.IsActive,
                    ts.Category,
                    ts.Division,
                    season.Id,
                    season.Name
                ));
            }
        }

        return results;
    }

    public async Task<TeamResponse?> GetTeamByIdAsync(string teamId)
    {
        await _supabase.InitializeAsync();

        var team = await _supabase.From<TeamModel>()
            .Filter("id", Constants.Operator.Equals, teamId)
            .Single();

        if (team == null) return null;

        return new TeamResponse(
            team.Id,
            team.SubscriptionId,
            team.Name,
            team.Gender,
            team.Description,
            team.IsActive,
            team.CreatedAt,
            team.UpdatedAt
        );
    }

    public async Task<TeamResponse> CreateTeamAsync(CreateTeamRequest request)
    {
        await _supabase.InitializeAsync();

        var newTeam = new TeamModel
        {
            SubscriptionId = request.SubscriptionId,
            Name = request.Name,
            Gender = request.Gender,
            Description = request.Description,
            IsActive = true
        };

        var response = await _supabase.From<TeamModel>().Insert(newTeam);

        if (response.Model == null)
            throw new Exception("Error al crear el equipo.");

        return new TeamResponse(
            response.Model.Id,
            response.Model.SubscriptionId,
            response.Model.Name,
            response.Model.Gender,
            response.Model.Description,
            response.Model.IsActive,
            response.Model.CreatedAt,
            response.Model.UpdatedAt
        );
    }

    public async Task<TeamResponse> UpdateTeamAsync(string teamId, UpdateTeamRequest request)
    {
        await _supabase.InitializeAsync();

        var team = await _supabase.From<TeamModel>()
            .Filter("id", Constants.Operator.Equals, teamId)
            .Single();

        if (team == null)
            throw new Exception("Equipo no encontrado.");

        team.Name = request.Name;
        team.Description = request.Description;
        team.Gender = request.Gender;
        team.IsActive = request.IsActive;

        var response = await _supabase.From<TeamModel>().Update(team);

        if (response.Model == null)
            throw new Exception("Error al actualizar el equipo.");

        return new TeamResponse(
            response.Model.Id,
            response.Model.SubscriptionId,
            response.Model.Name,
            response.Model.Gender,
            response.Model.Description,
            response.Model.IsActive,
            response.Model.CreatedAt,
            response.Model.UpdatedAt
        );
    }

    public async Task DeleteTeamAsync(string teamId)
    {
        await _supabase.InitializeAsync();

        // Soft delete: marcar como inactivo
        var team = await _supabase.From<TeamModel>()
            .Filter("id", Constants.Operator.Equals, teamId)
            .Single();

        if (team == null)
            throw new Exception("Equipo no encontrado.");

        team.IsActive = false;
        await _supabase.From<TeamModel>().Update(team);
    }

    // ============================================
    // TeamSeason operations
    // ============================================

    public async Task<TeamSeasonResponse> CreateTeamSeasonAsync(CreateTeamSeasonRequest request)
    {
        await _supabase.InitializeAsync();

        var newTeamSeason = new TeamSeasonModel
        {
            TeamId = request.TeamId,
            SeasonId = request.SeasonId,
            Category = request.Category,
            Division = request.Division,
            IsActive = true
        };

        var response = await _supabase.From<TeamSeasonModel>().Insert(newTeamSeason);

        if (response.Model == null)
            throw new Exception("Error al crear la configuración del equipo para la temporada.");

        return new TeamSeasonResponse(
            response.Model.Id,
            response.Model.TeamId,
            response.Model.SeasonId,
            response.Model.Category,
            response.Model.Division,
            response.Model.IsActive,
            response.Model.CreatedAt,
            response.Model.UpdatedAt
        );
    }

    public async Task<TeamSeasonResponse> UpdateTeamSeasonAsync(string teamSeasonId, UpdateTeamSeasonRequest request)
    {
        await _supabase.InitializeAsync();

        var teamSeason = await _supabase.From<TeamSeasonModel>()
            .Filter("id", Constants.Operator.Equals, teamSeasonId)
            .Single();

        if (teamSeason == null)
            throw new Exception("Configuración de temporada no encontrada.");

        teamSeason.Category = request.Category;
        teamSeason.Division = request.Division;
        teamSeason.IsActive = request.IsActive;

        var response = await _supabase.From<TeamSeasonModel>().Update(teamSeason);

        if (response.Model == null)
            throw new Exception("Error al actualizar la configuración de temporada.");

        return new TeamSeasonResponse(
            response.Model.Id,
            response.Model.TeamId,
            response.Model.SeasonId,
            response.Model.Category,
            response.Model.Division,
            response.Model.IsActive,
            response.Model.CreatedAt,
            response.Model.UpdatedAt
        );
    }

    public async Task<IEnumerable<TeamSeasonResponse>> GetTeamSeasonsAsync(string teamId)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<TeamSeasonModel>()
            .Filter("team_id", Constants.Operator.Equals, teamId)
            .Get();

        return response.Models.Select(ts => new TeamSeasonResponse(
            ts.Id,
            ts.TeamId,
            ts.SeasonId,
            ts.Category,
            ts.Division,
            ts.IsActive,
            ts.CreatedAt,
            ts.UpdatedAt
        ));
    }
}
