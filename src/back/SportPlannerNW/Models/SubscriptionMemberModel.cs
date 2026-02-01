using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("subscription_members")]
public class SubscriptionMemberModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    
    [Column("subscription_id")] public string SubscriptionId { get; set; } = null!;
    
    [Column("user_id")] public string UserId { get; set; } = null!;
    
    [Column("role")] public string Role { get; set; } = "member";
    
    [Column("joined_at")] public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
