using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerformanceController : ControllerBase
{
    private readonly IPerformanceService _performanceService;

    public PerformanceController(IPerformanceService performanceService)
    {
        _performanceService = performanceService;
    }

    [HttpPost("attendance")]
    public async Task<IActionResult> TrackAttendance([FromBody] AttendanceRequest request)
    {
        await _performanceService.TrackAttendanceAsync(request.PlanConceptId, request.PlayerId, request.Status, request.Notes);
        return Ok();
    }

    [HttpPost("stats")]
    public async Task<IActionResult> UpdateStats([FromBody] StatsRequest request)
    {
        await _performanceService.UpdateStatsAsync(
            request.PlanConceptId, 
            request.PlayerId, 
            request.Rating, 
            request.PhysicalLoad, 
            request.Technical, 
            request.Tactical, 
            request.Comments);
        return Ok();
    }
}

public record AttendanceRequest(string PlanConceptId, string PlayerId, string Status, string? Notes);
public record StatsRequest(string PlanConceptId, string PlayerId, double Rating, int PhysicalLoad, int Technical, int Tactical, string? Comments);
