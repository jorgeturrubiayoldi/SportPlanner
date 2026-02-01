using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerController : ControllerBase
{
    private readonly IPlayerService _playerService;

    public PlayerController(IPlayerService playerService)
    {
        _playerService = playerService;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlayer([FromBody] CreatePlayerRequest request)
    {
        try
        {
            var player = await _playerService.CreatePlayerAsync(request);
            return CreatedAtAction(nameof(GetPlayerById), new { id = player.Id }, player);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetPlayersByTeam(string teamId)
    {
        var players = await _playerService.GetPlayersByTeamAsync(teamId);
        return Ok(players);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlayerById(string id)
    {
        var player = await _playerService.GetPlayerByIdAsync(id);
        if (player == null) return NotFound();
        return Ok(player);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePlayer(string id, [FromBody] UpdatePlayerRequest request)
    {
        try
        {
            var player = await _playerService.UpdatePlayerAsync(id, request);
            return Ok(player);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlayer(string id)
    {
        await _playerService.DeletePlayerAsync(id);
        return NoContent();
    }
}
