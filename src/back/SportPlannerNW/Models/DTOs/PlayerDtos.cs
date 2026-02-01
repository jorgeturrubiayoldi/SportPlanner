using SportPlannerNW.Models;

namespace SportPlannerNW.Models.DTOs;

public class CreatePlayerRequest
{
    public string TeamId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Position { get; set; }
    public int? Number { get; set; }
}

public class UpdatePlayerRequest
{
    public string Name { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Position { get; set; }
    public int? Number { get; set; }
}

public class PlayerDto
{
    public string Id { get; set; } = string.Empty;
    public string TeamId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Position { get; set; }
    public int? Number { get; set; }
    public DateTime CreatedAt { get; set; }

    public static PlayerDto FromEntity(Player player)
    {
        return new PlayerDto
        {
            Id = player.Id,
            TeamId = player.TeamId,
            Name = player.Name,
            LastName = player.LastName,
            Email = player.Email,
            Position = player.Position,
            Number = player.Number,
            CreatedAt = player.CreatedAt
        };
    }
}
