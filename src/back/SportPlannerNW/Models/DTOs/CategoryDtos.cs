namespace SportPlannerNW.Models.DTOs;

// ============================================
// Category DTOs
// ============================================

public record CategoryResponse(
    string Id,
    string SportId,
    string Name,
    int? MinBirthYear,
    int? MaxBirthYear,
    int SortOrder,
    bool IsSystem,
    bool Active
);

public record CreateCategoryRequest(
    string SportId,
    string Name,
    int? MinBirthYear,
    int? MaxBirthYear,
    int SortOrder
);

public record UpdateCategoryRequest(
    string Name,
    int? MinBirthYear,
    int? MaxBirthYear,
    int SortOrder,
    bool Active
);
