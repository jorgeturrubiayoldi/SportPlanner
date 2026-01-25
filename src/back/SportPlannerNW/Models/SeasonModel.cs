using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("seasons")]
public class SeasonModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("subscription_id")] public string SubscriptionId { get; set; } = null!;
    [Column("name")] public string Name { get; set; } = null!;
    [Column("start_date")] public DateTime StartDate { get; set; }
    [Column("end_date")] public DateTime? EndDate { get; set; }
    [Column("is_active")] public bool IsActive { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
}
