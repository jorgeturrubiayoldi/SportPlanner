
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("session_attendance")]
public class SessionAttendanceModel : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = null!;

    [Column("plan_concept_id")]
    public string PlanConceptId { get; set; } = null!;

    [Column("player_id")]
    public string PlayerId { get; set; } = null!;

    [Column("status")]
    public string Status { get; set; } = "present";

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("player_performance_stats")]
public class PlayerPerformanceStatsModel : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = null!;

    [Column("plan_concept_id")]
    public string PlanConceptId { get; set; } = null!;

    [Column("player_id")]
    public string PlayerId { get; set; } = null!;

    [Column("rating")]
    public double Rating { get; set; }

    [Column("physical_load")]
    public int PhysicalLoad { get; set; }

    [Column("technical_score")]
    public int TechnicalScore { get; set; }

    [Column("tactical_score")]
    public int TacticalScore { get; set; }

    [Column("comments")]
    public string? Comments { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
