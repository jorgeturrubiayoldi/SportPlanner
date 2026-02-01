using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("players")]
public class Player : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("team_id")]
    public string TeamId { get; set; } = string.Empty;

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("position")]
    public string? Position { get; set; }

    [Column("number")]
    public int? Number { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
