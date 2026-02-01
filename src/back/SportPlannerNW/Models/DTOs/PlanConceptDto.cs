using System.Text.Json.Serialization;

namespace SportPlannerNW.Models.DTOs;

public class PlanConceptDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = null!;

    [JsonPropertyName("planId")]
    public string PlanId { get; set; } = null!;

    [JsonPropertyName("conceptId")] // Corrected property name
    public string ConceptId { get; set; } = null!;

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("scheduledDate")]
    public DateTime? ScheduledDate { get; set; }

    [JsonPropertyName("sortOrder")]
    public int SortOrder { get; set; }
}

public class AddPlanConceptDto
{
    [JsonPropertyName("conceptId")]
    public string ConceptId { get; set; } = null!;

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("scheduledDate")]
    public DateTime? ScheduledDate { get; set; }
}
