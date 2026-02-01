using System.Text.Json.Serialization;

namespace SportPlannerNW.Models.DTOs;

public class PlanDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = null!;

    [JsonPropertyName("teamId")]
    public string? TeamId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    [JsonPropertyName("trainingDays")]
    public List<string> TrainingDays { get; set; } = new();

    [JsonPropertyName("duration")]
    public int? Duration { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}

public class CreatePlanDto
{
    [JsonPropertyName("teamId")]
    public string TeamId { get; set; } = null!;

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    [JsonPropertyName("trainingDays")]
    public List<string> TrainingDays { get; set; } = new();

    [JsonPropertyName("duration")]
    public int? Duration { get; set; }

    [JsonPropertyName("conceptIds")]
    public List<string> ConceptIds { get; set; } = new();
}
