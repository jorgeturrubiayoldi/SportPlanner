using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

/// <summary>
/// Modelo para conceptos/técnicas de entrenamiento.
/// Ejemplos: "Bote entre las piernas", "Tiro con pico de pato", "3x2"
/// </summary>
[Table("concepts")]
public class ConceptModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("concept_category_id")] public string ConceptCategoryId { get; set; } = null!;
    [Column("subscription_id")] public string? SubscriptionId { get; set; }
    [Column("name")] public string Name { get; set; } = null!;
    [Column("description")] public string? Description { get; set; }
    [Column("video_url")] public string? VideoUrl { get; set; }
    [Column("image_url")] public string? ImageUrl { get; set; }
    [Column("difficulty_level")] public int DifficultyLevel { get; set; } = 1;
    [Column("is_system")] public bool IsSystem { get; set; }
    [Column("active")] public bool Active { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
