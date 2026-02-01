using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

/// <summary>
/// Modelo para la relación entre planificaciones y conceptos.
/// Permite ordenar conceptos dentro de un plan y asignar fechas específicas.
/// </summary>
[Table("plan_concepts")]
public class PlanConceptModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("plan_id")] public string PlanId { get; set; } = null!;
    [Column("concept_id")] public string ConceptId { get; set; } = null!;
    [Column("sort_order")] public int SortOrder { get; set; }
    [Column("scheduled_date")] public DateTime? ScheduledDate { get; set; }
    [Column("notes")] public string? Notes { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
}
