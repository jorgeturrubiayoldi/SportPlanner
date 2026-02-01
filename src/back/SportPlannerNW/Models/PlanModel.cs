using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

/// <summary>
/// Modelo para planificaciones de entrenamiento.
/// Una planificación agrupa conceptos a trabajar en un período de tiempo.
/// </summary>
[Table("plans")]
public class PlanModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("subscription_id")] public string SubscriptionId { get; set; } = null!;
    [Column("team_id")] public string? TeamId { get; set; }
    [Column("name")] public string Name { get; set; } = null!;
    [Column("description")] public string? Description { get; set; }
    [Column("start_date")] public DateTime StartDate { get; set; }
    [Column("end_date")] public DateTime EndDate { get; set; }
    [Column("training_days")] public List<string> TrainingDays { get; set; } = new();
    [Column("duration")] public int? Duration { get; set; }
    [Column("is_active")] public bool IsActive { get; set; } = true;
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
