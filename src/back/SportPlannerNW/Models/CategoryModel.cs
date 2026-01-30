using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("categories")]
public class CategoryModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("sport_id")] public string SportId { get; set; } = null!;
    [Column("name")] public string Name { get; set; } = null!;
    [Column("min_birth_year")] public int? MinBirthYear { get; set; }
    [Column("max_birth_year")] public int? MaxBirthYear { get; set; }
    [Column("sort_order")] public int SortOrder { get; set; }
    [Column("is_system")] public bool IsSystem { get; set; }
    [Column("active")] public bool Active { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
