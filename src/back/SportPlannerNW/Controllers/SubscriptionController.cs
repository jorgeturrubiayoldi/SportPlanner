using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpGet("sports")]
    public async Task<IActionResult> GetSports()
    {
        try
        {
            var sports = await _subscriptionService.GetSportsAsync();
            return Ok(sports);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request)
    {
        try
        {
            var result = await _subscriptionService.CreateSubscriptionAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("status/{userId}")]
    public async Task<IActionResult> GetSubscriptionStatus(string userId)
    {
        try
        {
            var isActive = await _subscriptionService.CheckSubscriptionStatusAsync(userId);
            return Ok(isActive);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la suscripción activa del usuario incluyendo el sportId
    /// </summary>
    [HttpGet("active/{userId}")]
    public async Task<IActionResult> GetActiveSubscription(string userId)
    {
        var subscription = await _subscriptionService.GetActiveSubscriptionAsync(userId);
        if (subscription == null) return NoContent();
        return Ok(subscription);
    }
}