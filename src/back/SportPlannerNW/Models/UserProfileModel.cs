using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("user_profiles")]
public class UserProfileModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("full_name")] public string? FullName { get; set; }
    [Column("avatar_url")] public string? AvatarUrl { get; set; }
    [Column("language")] public string? Language { get; set; }
}
