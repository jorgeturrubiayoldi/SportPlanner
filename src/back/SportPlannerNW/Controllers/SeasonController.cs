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

    [HttpGet("all/{userId}")]
    public async Task<IActionResult> GetAllSeasons(string userId)
    {
        var seasons = await _seasonService.GetSeasonsAsync(userId);
        return Ok(seasons);
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

    [HttpPut("{seasonId}")]
    public async Task<IActionResult> UpdateSeason(string seasonId, [FromBody] UpdateSeasonRequest request)
    {
        try
        {
            var season = await _seasonService.UpdateSeasonAsync(request.UserId, seasonId, request);
            return Ok(season);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{seasonId}/activate")]
    public async Task<IActionResult> SetActiveSeason(string seasonId, [FromBody] ActivateSeasonRequest request)
    {
        try
        {
            var season = await _seasonService.SetActiveSeasonAsync(request.UserId, seasonId);
            return Ok(season);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
