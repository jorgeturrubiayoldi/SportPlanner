using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface ISubscriptionService
{
    Task<IEnumerable<SportResponse>> GetSportsAsync();
    Task<SubscriptionResponse> CreateSubscriptionAsync(SubscribeRequest request);
    Task<bool> CheckSubscriptionStatusAsync(string userId);
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
        // 0. Validar si ya tiene suscripción activa (Regla de negocio: 1 User = 1 Active Subscription)
        bool hasActiveSubscription = await CheckSubscriptionStatusAsync(request.UserId);
        if (hasActiveSubscription)
        {
            throw new InvalidOperationException($"El usuario {request.UserId} ya posee una suscripción activa.");
        }

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

        Supabase.Postgrest.Responses.ModeledResponse<SubscriptionModel> subResponse; // Declare outside try block
        try
        {
            subResponse = await _supabase.From<SubscriptionModel>().Insert(subscription);
            
            // Check for error in response if it doesn't throw (depends on client version/config)
            if (subResponse.Model == null)
              throw new Exception("La suscripción no se pudo crear (respuesta vacía).");
        }
        catch (Supabase.Postgrest.Exceptions.PostgrestException ex)
        {
            // Log ex.Message, ex.Details, ex.Hint to helpful debugging
            // Si es un error de FK, el mensaje suele contener "violates foreign key constraint"
            if (ex.Message.Contains("violates foreign key constraint"))
            {
                 throw new Exception($"El usuario con ID {request.UserId} no existe en el sistema de autenticación.");
            }
            throw new Exception($"Error de base de datos al crear suscripción: {ex.Message}");
        }

        var newSub = subResponse.Model;

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

    public async Task<bool> CheckSubscriptionStatusAsync(string userId)
    {
        try
        {
            string nowIso = DateTime.UtcNow.ToString("o");
            Console.WriteLine($"Checking subscription for User: {userId} at {nowIso}");
            
            // Using explicit chaining to avoid "failed to parse logic tree" error in Postgrest
            var response = await _supabase.From<SubscriptionModel>()
                .Filter("owner_id", Constants.Operator.Equals, userId)
                .Filter("status", Constants.Operator.Equals, "active")
                .Filter("end_date", Constants.Operator.GreaterThan, nowIso)
                .Get();

            bool hasActive = response.Models.Any();
            Console.WriteLine($"User {userId} has active subscription: {hasActive}. Found {response.Models.Count} records.");
            
            return hasActive;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error checking subscription for {userId}: {ex.Message}");
            return false;
        }
    }
}
