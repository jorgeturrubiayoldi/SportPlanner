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
