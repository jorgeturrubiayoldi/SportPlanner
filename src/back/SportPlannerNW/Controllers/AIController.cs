using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    [HttpPost("analyze/team/{teamId}")]
    public async Task<IActionResult> AnalyzeTeamPerformance(string teamId)
    {
        // Simulation of AI processing
        var insights = new List<dynamic>
        {
            new { Type = "Opportunity", Content = "El equipo tiene un 85% de asistencia, pero el rendimiento físico baja los jueves.", Confidence = 0.9 },
            new { Type = "Risk", Content = "El jugador 'Carlos' muestra signos de fatiga acumulada.", Confidence = 0.85 }
        };
        
        return Ok(insights);
    }
}
