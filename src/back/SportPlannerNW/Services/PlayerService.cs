using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface IPlayerService
{
    Task<PlayerDto> CreatePlayerAsync(CreatePlayerRequest request);
    Task<List<PlayerDto>> GetPlayersByTeamAsync(string teamId);
    Task<PlayerDto?> GetPlayerByIdAsync(string id);
    Task<PlayerDto> UpdatePlayerAsync(string id, UpdatePlayerRequest request);
    Task DeletePlayerAsync(string id);
}

public class PlayerService : IPlayerService
{
    private readonly Supabase.Client _supabase;

    public PlayerService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<PlayerDto> CreatePlayerAsync(CreatePlayerRequest request)
    {
        await _supabase.InitializeAsync();

        var player = new Player
        {
            TeamId = request.TeamId,
            Name = request.Name,
            LastName = request.LastName,
            Email = request.Email,
            Position = request.Position,
            Number = request.Number
        };

        var response = await _supabase.From<Player>().Insert(player);

        if (response.Model == null)
            throw new Exception("Error creating player in Supabase.");

        return PlayerDto.FromEntity(response.Model);
    }

    public async Task<List<PlayerDto>> GetPlayersByTeamAsync(string teamId)
    {
        await _supabase.InitializeAsync();
        
        // Debug logging
        Console.WriteLine($"[PlayerService] Session is null: {_supabase.Auth.CurrentSession == null}");
        Console.WriteLine($"[PlayerService] Client Options Key (Prefix): {_supabase.Options.Headers["apikey"].Substring(0, 10)}...");

        var response = await _supabase.From<Player>()
            .Filter("team_id", Constants.Operator.Equals, teamId)
            .Order("name", Constants.Ordering.Ascending)
            .Get();

        return response.Models.Select(PlayerDto.FromEntity).ToList();
    }

    public async Task<PlayerDto?> GetPlayerByIdAsync(string id)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<Player>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        return response == null ? null : PlayerDto.FromEntity(response);
    }

    public async Task<PlayerDto> UpdatePlayerAsync(string id, UpdatePlayerRequest request)
    {
        await _supabase.InitializeAsync();

        var existingResponse = await _supabase.From<Player>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existingResponse == null)
            throw new Exception("Player not found.");

        var player = existingResponse;
        player.Name = request.Name;
        player.LastName = request.LastName;
        player.Email = request.Email;
        player.Position = request.Position;
        player.Number = request.Number;
        player.UpdatedAt = DateTime.UtcNow;

        var updateResponse = await _supabase.From<Player>().Update(player);

        if (updateResponse.Model == null)
            throw new Exception("Error updating player.");

        return PlayerDto.FromEntity(updateResponse.Model);
    }

    public async Task DeletePlayerAsync(string id)
    {
        await _supabase.InitializeAsync();

        await _supabase.From<Player>()
            .Filter("id", Constants.Operator.Equals, id)
            .Delete();
    }
}
