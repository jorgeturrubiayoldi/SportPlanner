namespace SportPlannerNW.Models.DTOs;

// ============================================
// Concept Category DTOs
// ============================================

/// <summary>
/// Response para una categoría de concepto
/// </summary>
public record ConceptCategoryResponse(
    string Id,
    string SportId,
    string? ParentId,
    string Name,
    string? Description,
    int SortOrder,
    bool IsSystem,
    bool Active,
    List<ConceptCategoryResponse>? Children = null
);

/// <summary>
/// Request para crear una categoría de concepto
/// </summary>
public record CreateConceptCategoryRequest(
    string SportId,
    string? ParentId,
    string Name,
    string? Description,
    int SortOrder = 0
);

/// <summary>
/// Request para actualizar una categoría de concepto
/// </summary>
public record UpdateConceptCategoryRequest(
    string Name,
    string? Description,
    int SortOrder,
    bool Active
);

// ============================================
// Concept DTOs
// ============================================

/// <summary>
/// Response para un concepto de entrenamiento
/// </summary>
public record ConceptResponse(
    string Id,
    string ConceptCategoryId,
    string? SubscriptionId,
    string Name,
    string? Description,
    string? VideoUrl,
    string? ImageUrl,
    int DifficultyLevel,
    bool IsSystem,
    bool Active,
    string? CategoryName = null // Para mostrar el nombre de la categoría
);

/// <summary>
/// Request para crear un concepto
/// </summary>
public record CreateConceptRequest(
    string ConceptCategoryId,
    string? SubscriptionId,
    string Name,
    string? Description,
    string? VideoUrl,
    string? ImageUrl,
    int DifficultyLevel = 1
);

/// <summary>
/// Request para actualizar un concepto
/// </summary>
public record UpdateConceptRequest(
    string ConceptCategoryId,
    string Name,
    string? Description,
    string? VideoUrl,
    string? ImageUrl,
    int DifficultyLevel,
    bool Active
);
