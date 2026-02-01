using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface ISeasonService
{
    Task<SeasonResponse?> GetActiveSeasonAsync(string userId);
    Task<IEnumerable<SeasonResponse>> GetSeasonsAsync(string userId);
    Task<SeasonResponse> CreateSeasonAsync(CreateSeasonRequest request);
    Task<SeasonResponse> UpdateSeasonAsync(string userId, string seasonId, UpdateSeasonRequest request);
    Task<SeasonResponse> SetActiveSeasonAsync(string userId, string seasonId);
}

public class SeasonService : ISeasonService
{
    private readonly Supabase.Client _supabase;

    public SeasonService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<SeasonResponse?> GetActiveSeasonAsync(string userId)
    {
        await _supabase.InitializeAsync();

        // 1. Buscar la suscripción activa del usuario
        var subResponse = await _supabase.From<SubscriptionModel>()
            .Filter("owner_id", Constants.Operator.Equals, userId)
            .Filter("status", Constants.Operator.Equals, "active")
            .Single();

        if (subResponse == null) return null;

        // 2. Buscar la temporada activa de esa suscripción
        var seasonResponse = await _supabase.From<SeasonModel>()
            .Filter("subscription_id", Constants.Operator.Equals, subResponse.Id)
            .Filter("is_active", Constants.Operator.Equals, "true")
            .Single();

        if (seasonResponse == null) return null;

        return new SeasonResponse(seasonResponse.Id, seasonResponse.SubscriptionId, seasonResponse.Name, seasonResponse.IsActive);
    }

    public async Task<IEnumerable<SeasonResponse>> GetSeasonsAsync(string userId)
    {
        await _supabase.InitializeAsync();

        // 1. Buscar la suscripción activa del usuario
        var subResponse = await _supabase.From<SubscriptionModel>()
            .Filter("owner_id", Constants.Operator.Equals, userId)
            .Filter("status", Constants.Operator.Equals, "active")
            .Single();

        if (subResponse == null) return Enumerable.Empty<SeasonResponse>();

        // 2. Buscar todas las temporadas de esa suscripción
        var seasonsResponse = await _supabase.From<SeasonModel>()
            .Filter("subscription_id", Constants.Operator.Equals, subResponse.Id)
            .Get();

        return seasonsResponse.Models.Select(s => new SeasonResponse(s.Id, s.SubscriptionId, s.Name, s.IsActive));
    }

    public async Task<SeasonResponse> CreateSeasonAsync(CreateSeasonRequest request)
    {
        await _supabase.InitializeAsync();

        // 1. Obtener la suscripción del usuario (necesitamos el ID)
        var subResponse = await _supabase.From<SubscriptionModel>()
            .Filter("owner_id", Constants.Operator.Equals, request.UserId)
            .Filter("status", Constants.Operator.Equals, "active")
            .Single();

        if (subResponse == null)
            throw new Exception("El usuario no tiene una suscripción activa para crear temporadas.");

        // 2. Crear la temporada
        var newSeason = new SeasonModel
        {
            SubscriptionId = subResponse.Id,
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = true
        };

        var response = await _supabase.From<SeasonModel>().Insert(newSeason);

        if (response.Model == null)
            throw new Exception("Error al guardar la temporada.");

        return new SeasonResponse(response.Model.Id, response.Model.SubscriptionId, response.Model.Name, response.Model.IsActive);
    }

    public async Task<SeasonResponse> UpdateSeasonAsync(string userId, string seasonId, UpdateSeasonRequest request)
    {
        await _supabase.InitializeAsync();

        // 1. Verificar propiedad a través de la suscripción
        var subResponse = await _supabase.From<SubscriptionModel>()
            .Filter("owner_id", Constants.Operator.Equals, userId)
            .Single();

        if (subResponse == null)
            throw new Exception("Suscripción no encontrada.");

        // 2. Obtener la temporada
        var seasonResponse = await _supabase.From<SeasonModel>()
            .Filter("id", Constants.Operator.Equals, seasonId)
            .Filter("subscription_id", Constants.Operator.Equals, subResponse.Id)
            .Single();

        if (seasonResponse == null)
            throw new Exception("Temporada no encontrada o no tienes permisos.");

        // 3. Actualizar
        seasonResponse.Name = request.Name;
        seasonResponse.StartDate = request.StartDate;
        seasonResponse.EndDate = request.EndDate;

        var updateResponse = await _supabase.From<SeasonModel>().Update(seasonResponse);

        if (updateResponse.Model == null)
            throw new Exception("Error al actualizar la temporada.");

        return new SeasonResponse(updateResponse.Model.Id, updateResponse.Model.SubscriptionId, updateResponse.Model.Name, updateResponse.Model.IsActive);
    }
    public async Task<SeasonResponse> SetActiveSeasonAsync(string userId, string seasonId)
    {
        await _supabase.InitializeAsync();

        // 1. Obtener la suscripción
        var subResponse = await _supabase.From<SubscriptionModel>()
            .Filter("owner_id", Constants.Operator.Equals, userId)
            .Filter("status", Constants.Operator.Equals, "active")
            .Single();

        if (subResponse == null)
            throw new Exception("Suscripción no encontrada.");

        // 2. Obtener todas las temporadas de la suscripción
        var seasonsResponse = await _supabase.From<SeasonModel>()
            .Filter("subscription_id", Constants.Operator.Equals, subResponse.Id)
            .Get();

        var seasons = seasonsResponse.Models;
        var targetSeason = seasons.FirstOrDefault(s => s.Id == seasonId);

        if (targetSeason == null)
            throw new Exception("Temporada no encontrada.");

        // 3. Desactivar todas las temporadas excepto la objetivo
        foreach (var season in seasons)
        {
            if (season.Id == seasonId)
            {
                season.IsActive = true;
                await _supabase.From<SeasonModel>().Update(season);
            }
            else if (season.IsActive)
            {
                season.IsActive = false;
                await _supabase.From<SeasonModel>().Update(season);
            }
        }

        return new SeasonResponse(targetSeason.Id, targetSeason.SubscriptionId, targetSeason.Name, true);
    }
}
