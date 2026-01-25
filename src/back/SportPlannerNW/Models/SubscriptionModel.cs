using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("subscriptions")]
public class SubscriptionModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("owner_id")] public string OwnerId { get; set; } = null!;
    [Column("sport_id")] public string SportId { get; set; } = null!;
    [Column("plan_type")] public string PlanType { get; set; } = null!;
    [Column("status")] public string Status { get; set; } = null!;
    [Column("start_date")] public DateTime StartDate { get; set; }
    [Column("end_date")] public DateTime EndDate { get; set; }
    [Column("is_paid")] public bool IsPaid { get; set; }
}
