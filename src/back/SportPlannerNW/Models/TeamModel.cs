using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("teams")]
public class TeamModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("subscription_id")] public string SubscriptionId { get; set; } = null!;
    [Column("name")] public string Name { get; set; } = null!;
    [Column("description")] public string? Description { get; set; }
    [Column("gender")] public string Gender { get; set; } = null!;
    [Column("is_active")] public bool IsActive { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
