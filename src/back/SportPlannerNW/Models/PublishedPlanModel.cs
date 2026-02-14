
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("published_plans")]
public class PublishedPlanModel : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = null!;

    [Column("original_plan_id")]
    public string? OriginalPlanId { get; set; }

    [Column("author_id")]
    public string? AuthorId { get; set; }

    [Column("title")]
    public string Title { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("price")]
    public decimal Price { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("is_published")]
    public bool IsPublished { get; set; }
}
