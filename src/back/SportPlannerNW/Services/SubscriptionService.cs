using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface ISubscriptionService
{
    Task<IEnumerable<SportResponse>> GetSportsAsync();
    Task<SubscriptionResponse> CreateSubscriptionAsync(SubscribeRequest request);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly Supabase.Client _supabase;

    public SubscriptionService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<IEnumerable<SportResponse>> GetSportsAsync()
    {
        var response = await _supabase.From<SportModel>()
            .Where(x => x.Active == true)
            .Order(x => x.Name, Constants.Ordering.Ascending)
            .Get();

        return response.Models.Select(s => new SportResponse(s.Id, s.Name, s.Icon, s.Color));
    }

    public async Task<SubscriptionResponse> CreateSubscriptionAsync(SubscribeRequest request)
    {
        // 1. Crear Suscripción
        var subscription = new SubscriptionModel
        {
            OwnerId = request.UserId,
            PlanType = request.PlanType,
            SportId = request.SportId,
            Status = "active",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            IsPaid = true
        };

        var subResponse = await _supabase.From<SubscriptionModel>().Insert(subscription);
        var newSub = subResponse.Model;

        if (newSub == null)
            throw new Exception("Error al crear la suscripción.");

        // 2. Crear Factura
        var invoice = new InvoiceModel
        {
            SubscriptionId = newSub.Id,
            InvoiceNumber = $"INV-{newSub.Id[..8]}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
            Amount = request.Amount,
            Currency = "EUR",
            Status = "paid",
            DueDate = DateTime.UtcNow,
            PaidAt = DateTime.UtcNow,
            PaymentMethod = "card_fake",
            Description = $"Suscripción {request.PlanType}"
        };

        var invResponse = await _supabase.From<InvoiceModel>().Insert(invoice);
        
        if (invResponse.Model == null)
             throw new Exception("Error al generar la factura.");

        return new SubscriptionResponse(newSub.Id, invResponse.Model.Id);
    }
}
