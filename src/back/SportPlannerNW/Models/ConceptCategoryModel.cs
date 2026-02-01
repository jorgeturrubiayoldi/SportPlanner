using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

/// <summary>
/// Modelo para categorías jerárquicas de conceptos de entrenamiento.
/// Soporta anidación infinita mediante autoreferencia (parent_id).
/// Ejemplos: Ataque > Tiro > Pico de pato
/// </summary>
[Table("concept_categories")]
public class ConceptCategoryModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("sport_id")] public string SportId { get; set; } = null!;
    [Column("parent_id")] public string? ParentId { get; set; }
    [Column("name")] public string Name { get; set; } = null!;
    [Column("description")] public string? Description { get; set; }
    [Column("sort_order")] public int SortOrder { get; set; }
    [Column("is_system")] public bool IsSystem { get; set; }
    [Column("active")] public bool Active { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
