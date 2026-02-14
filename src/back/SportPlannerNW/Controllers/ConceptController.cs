using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ConceptController : ControllerBase
{
    private readonly IConceptService _conceptService;

    public ConceptController(IConceptService conceptService)
    {
        _conceptService = conceptService;
    }

    #region Categorías

    /// <summary>
    /// Obtiene el árbol de categorías de conceptos para un deporte
    /// </summary>
    [HttpGet("categories/{sportId}")]
    public async Task<IActionResult> GetCategoriesTree(string sportId)
    {
        try
        {
            var categories = await _conceptService.GetCategoriesTreeAsync(sportId);
            return Ok(categories);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Error] GetCategoriesTree: {ex.Message}");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene una categoría por su ID
    /// </summary>
    [HttpGet("categories/detail/{id}")]
    public async Task<IActionResult> GetCategory(string id)
    {
        var category = await _conceptService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    /// <summary>
    /// Crea una nueva categoría de concepto
    /// </summary>
    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateConceptCategoryRequest request)
    {
        try
        {
            var category = await _conceptService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una categoría de concepto
    /// </summary>
    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] UpdateConceptCategoryRequest request)
    {
        try
        {
            var category = await _conceptService.UpdateCategoryAsync(id, request);
            return Ok(category);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Elimina una categoría de concepto
    /// </summary>
    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        try
        {
            await _conceptService.DeleteCategoryAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Conceptos

    /// <summary>
    /// Obtiene conceptos de una categoría específica
    /// </summary>
    [HttpGet("categories/{categoryId}/concepts")]
    public async Task<IActionResult> GetConceptsByCategory(string categoryId)
    {
        try
        {
            var concepts = await _conceptService.GetConceptsByCategoryAsync(categoryId);
            return Ok(concepts);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Error] GetConceptsByCategory: {ex.Message}");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene todos los conceptos (del sistema + custom de la suscripción si se proporciona)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllConcepts([FromQuery] string? subscriptionId = null)
    {
        try
        {
            var concepts = await _conceptService.GetAllConceptsAsync(subscriptionId);
            return Ok(concepts);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Error] GetAllConcepts: {ex.Message}");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene un concepto por su ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetConcept(string id)
    {
        var concept = await _conceptService.GetConceptByIdAsync(id);
        if (concept == null) return NotFound();
        return Ok(concept);
    }

    /// <summary>
    /// Crea un nuevo concepto
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateConcept([FromBody] CreateConceptRequest request)
    {
        try
        {
            var concept = await _conceptService.CreateConceptAsync(request);
            return CreatedAtAction(nameof(GetConcept), new { id = concept.Id }, concept);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza un concepto
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateConcept(string id, [FromBody] UpdateConceptRequest request)
    {
        try
        {
            var concept = await _conceptService.UpdateConceptAsync(id, request);
            return Ok(concept);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Elimina un concepto
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteConcept(string id)
    {
        try
        {
            await _conceptService.DeleteConceptAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion
}
