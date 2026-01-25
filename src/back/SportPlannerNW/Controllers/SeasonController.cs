using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeasonController : ControllerBase
{
    private readonly ISeasonService _seasonService;

    public SeasonController(ISeasonService seasonService)
    {
        _seasonService = seasonService;
    }

    [HttpGet("active/{userId}")]
    public async Task<IActionResult> GetActiveSeason(string userId)
    {
        var season = await _seasonService.GetActiveSeasonAsync(userId);
        if (season == null) return NoContent(); // 204 No Content si no tiene temporada
        return Ok(season);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSeason([FromBody] CreateSeasonRequest request)
    {
        try
        {
            var season = await _seasonService.CreateSeasonAsync(request);
            return CreatedAtAction(nameof(GetActiveSeason), new { userId = request.UserId }, season);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
