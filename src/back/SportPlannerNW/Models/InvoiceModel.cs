using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SportPlannerNW.Models;

[Table("invoices")]
public class InvoiceModel : BaseModel
{
    [PrimaryKey("id")] public string Id { get; set; } = null!;
    [Column("subscription_id")] public string SubscriptionId { get; set; } = null!;
    [Column("invoice_number")] public string InvoiceNumber { get; set; } = null!;
    [Column("amount")] public decimal Amount { get; set; }
    [Column("currency")] public string Currency { get; set; } = null!;
    [Column("status")] public string Status { get; set; } = null!;
    [Column("due_date")] public DateTime DueDate { get; set; }
    [Column("paid_at")] public DateTime? PaidAt { get; set; }
    [Column("payment_method")] public string? PaymentMethod { get; set; }
    [Column("description")] public string? Description { get; set; }
}
