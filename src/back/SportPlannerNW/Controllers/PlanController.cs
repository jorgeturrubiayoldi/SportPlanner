using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;
using System.Security.Claims;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlanController : ControllerBase
{
    private readonly IPlanService _planService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<PlanController> _logger;

    public PlanController(IPlanService planService, ISubscriptionService subscriptionService, ILogger<PlanController> logger)
    {
        _planService = planService;
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<List<PlanDto>>> GetByTeam(string teamId)
    {
        try
        {
            var plans = await _planService.GetPlansByTeam(teamId);
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting plans for team {TeamId}", teamId);
            return StatusCode(500, "Error updating data");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlanDto>> GetById(string id)
    {
        try
        {
            var plan = await _planService.GetPlanById(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }
        catch (Exception ex)
        {
             _logger.LogError(ex, "Error getting plan {Id}", id);
            return StatusCode(500, "Error updating data");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PlanDto>> Create([FromBody] CreatePlanDto dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var activeSubscription = await _subscriptionService.GetActiveSubscriptionAsync(userId);
            if (activeSubscription == null)
            {
                return BadRequest("No active subscription found for the user.");
            }

            var created = await _planService.CreatePlan(dto, activeSubscription.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating plan");
            return StatusCode(500, "Error creating data");
        }
    }

    [HttpGet("{id}/concepts")]
    public async Task<ActionResult<List<PlanConceptDto>>> GetConcepts(string id)
    {
        try
        {
            var concepts = await _planService.GetPlanConcepts(id);
            return Ok(concepts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting concepts for plan {Id}", id);
            return StatusCode(500, "Error getting data");
        }
    }

    [HttpPost("{id}/concepts")]
    public async Task<ActionResult> AddConcept(string id, [FromBody] AddPlanConceptDto dto)
    {
        try
        {
            await _planService.AddConceptToPlan(id, dto.ConceptId, dto.Notes, dto.ScheduledDate);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding concept to plan {Id}", id);
            return StatusCode(500, "Error adding data");
        }
    }

    [HttpDelete("{id}/concepts/{conceptId}")]
    public async Task<ActionResult> RemoveConcept(string id, string conceptId)
    {
        try
        {
            await _planService.RemoveConceptFromPlan(id, conceptId);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing concept from plan {Id}", id);
            return StatusCode(500, "Error removing data");
        }
    }
}
