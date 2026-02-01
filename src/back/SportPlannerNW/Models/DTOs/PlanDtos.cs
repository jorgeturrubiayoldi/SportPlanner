namespace SportPlannerNW.Models.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// Respuesta de una planificación con sus conceptos
/// </summary>
public record PlanResponse(
    string Id,
    string SubscriptionId,
    string? TeamId,
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive,
    List<PlanConceptResponse>? Concepts = null
);

/// <summary>
/// Respuesta de un concepto dentro de una planificación
/// </summary>
public record PlanConceptResponse(
    string Id,
    string ConceptId,
    string ConceptName,
    string? ConceptDescription,
    string CategoryName,
    int DifficultyLevel,
    int SortOrder,
    DateTime? ScheduledDate,
    string? Notes
);

// ========== Request DTOs ==========

/// <summary>
/// Request para crear una nueva planificación
/// </summary>
public record CreatePlanRequest(
    string SubscriptionId,
    string? TeamId,
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate
);

/// <summary>
/// Request para actualizar una planificación
/// </summary>
public record UpdatePlanRequest(
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive
);

/// <summary>
/// Request para añadir un concepto a una planificación
/// </summary>
public record AddConceptToPlanRequest(
    string ConceptId,
    int? SortOrder = null,
    DateTime? ScheduledDate = null,
    string? Notes = null
);

/// <summary>
/// Request para reordenar conceptos en una planificación
/// </summary>
public record ReorderPlanConceptsRequest(
    List<ConceptOrderItem> ConceptOrders
);

public record ConceptOrderItem(
    string ConceptId,
    int SortOrder
);
