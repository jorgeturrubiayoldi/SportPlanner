namespace SportPlannerNW.Models.DTOs;

public record SubscribeRequest(string UserId, string PlanType, decimal Amount, string SportId);

public record SubscriptionResponse(string SubscriptionId, string InvoiceId);

public record SportResponse(string Id, string Name, string? Icon, string? Color);

public record ActiveSubscriptionResponse(
    string Id, 
    string SportId, 
    string SportName,
    string PlanType, 
    string Status,
    DateTime StartDate,
    DateTime EndDate
);

// ============================================
// Invoice DTOs
// ============================================

public record InvoiceResponse(
    string Id,
    string SubscriptionId,
    string InvoiceNumber,
    decimal Amount,
    string Currency,
    string Status,
    DateTime DueDate,
    DateTime? PaidAt,
    string? PaymentMethod,
    string? Description
);

// ============================================
// User Profile DTOs
// ============================================

public record UserProfileResponse(
    string Id,
    string? FullName,
    string? AvatarUrl,
    string? Language
);
