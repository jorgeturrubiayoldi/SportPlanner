using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models;
using Supabase;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarketplaceController : ControllerBase
{
    private readonly Client _supabase;

    public MarketplaceController(Client supabase)
    {
        _supabase = supabase;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublishedPlans([FromQuery] string? category)
    {
        await _supabase.InitializeAsync();
        var query = _supabase.From<PublishedPlanModel>().Where(x => x.IsPublished == true);
        
        if (!string.IsNullOrEmpty(category))
            query = query.Where(x => x.Category == category);

        var result = await query.Get();
        return Ok(result.Models);
    }

    [HttpPost("publish/{planId}")]
    [Authorize]
    public async Task<IActionResult> PublishPlan(string planId, [FromBody] PublishRequest request)
    {
        // Logic to clone plan and create published_plan record
        return Ok(new { message = "Plan published to marketplace" });
    }
}

public record PublishRequest(string Title, string Description, decimal Price, string Category);
