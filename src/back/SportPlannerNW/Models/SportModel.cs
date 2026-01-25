using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("sports")]
public class SportModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("name")] public string Name { get; set; } = null!;
    [Column("icon")] public string? Icon { get; set; }
    [Column("color")] public string? Color { get; set; }
    [Column("active")] public bool Active { get; set; }
}
