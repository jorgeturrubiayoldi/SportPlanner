using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    // ============================================
    // Team endpoints
    // ============================================

    /// <summary>
    /// Get all teams for a given subscription
    /// </summary>
    [HttpGet("subscription/{subscriptionId}")]
    public async Task<IActionResult> GetTeams(string subscriptionId)
    {
        var teams = await _teamService.GetTeamsAsync(subscriptionId);
        return Ok(teams);
    }

    /// <summary>
    /// Get teams by season (includes season configuration)
    /// </summary>
    [HttpGet("season/{seasonId}")]
    public async Task<IActionResult> GetTeamsBySeason(string seasonId)
    {
        var teams = await _teamService.GetTeamsBySeasonAsync(seasonId);
        return Ok(teams);
    }

    /// <summary>
    /// Get a single team by ID
    /// </summary>
    [HttpGet("{teamId}")]
    public async Task<IActionResult> GetTeamById(string teamId)
    {
        var team = await _teamService.GetTeamByIdAsync(teamId);
        if (team == null) return NotFound();
        return Ok(team);
    }

    /// <summary>
    /// Create a new team
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
    {
        try
        {
            var team = await _teamService.CreateTeamAsync(request);
            return CreatedAtAction(nameof(GetTeamById), new { teamId = team.Id }, team);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing team
    /// </summary>
    [HttpPut("{teamId}")]
    public async Task<IActionResult> UpdateTeam(string teamId, [FromBody] UpdateTeamRequest request)
    {
        try
        {
            var team = await _teamService.UpdateTeamAsync(teamId, request);
            return Ok(team);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a team (soft delete)
    /// </summary>
    [HttpDelete("{teamId}")]
    public async Task<IActionResult> DeleteTeam(string teamId)
    {
        try
        {
            await _teamService.DeleteTeamAsync(teamId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============================================
    // TeamSeason endpoints
    // ============================================

    /// <summary>
    /// Get all season configurations for a team
    /// </summary>
    [HttpGet("{teamId}/seasons")]
    public async Task<IActionResult> GetTeamSeasons(string teamId)
    {
        var teamSeasons = await _teamService.GetTeamSeasonsAsync(teamId);
        return Ok(teamSeasons);
    }

    /// <summary>
    /// Create a team-season configuration (assign team to season with category)
    /// </summary>
    [HttpPost("season")]
    public async Task<IActionResult> CreateTeamSeason([FromBody] CreateTeamSeasonRequest request)
    {
        try
        {
            var teamSeason = await _teamService.CreateTeamSeasonAsync(request);
            return CreatedAtAction(nameof(GetTeamSeasons), new { teamId = request.TeamId }, teamSeason);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update a team-season configuration
    /// </summary>
    [HttpPut("season/{teamSeasonId}")]
    public async Task<IActionResult> UpdateTeamSeason(string teamSeasonId, [FromBody] UpdateTeamSeasonRequest request)
    {
        try
        {
            var teamSeason = await _teamService.UpdateTeamSeasonAsync(teamSeasonId, request);
            return Ok(teamSeason);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
