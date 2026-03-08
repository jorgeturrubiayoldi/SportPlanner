using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.Common;
using SportPlannerNW.Models.DTOs;
using MediatR;
using SportPlannerNW.Features.Auth;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginCommand(request.Email, request.Password));
        return Ok(ApiResponse<AuthResponse>.Exitoso(result, "Login exitoso"));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request)
    {
        var result = await _mediator.Send(new RegisterCommand(request.FullName, request.Email, request.Password, request.Language));
        return Ok(ApiResponse<AuthResponse>.Exitoso(result, "Usuario registrado exitosamente"));
    }
}