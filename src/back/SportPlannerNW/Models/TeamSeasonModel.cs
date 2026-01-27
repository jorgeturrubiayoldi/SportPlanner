using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("team_seasons")]
public class TeamSeasonModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("team_id")] public string TeamId { get; set; } = null!;
    [Column("season_id")] public string SeasonId { get; set; } = null!;
    [Column("category")] public string Category { get; set; } = null!;
    [Column("division")] public string? Division { get; set; }
    [Column("is_active")] public bool IsActive { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
