using Microsoft.AspNetCore.Mvc;
using SportPlannerNW.Models.DTOs;
using SportPlannerNW.Services;

namespace SportPlannerNW.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Obtiene todas las categorías activas de un deporte
    /// </summary>
    [HttpGet("sport/{sportId}")]
    public async Task<IActionResult> GetCategoriesBySport(string sportId)
    {
        try
        {
            var categories = await _categoryService.GetCategoriesBySportIdAsync(sportId);
            return Ok(categories);
        }
        catch (Exception ex)
        {
            // Log detallado (en un entorno real usaríamos ILogger)
            Console.WriteLine($"[Error] GetCategoriesBySport: {ex.Message}");
            Console.WriteLine($"[StackTrace] {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[Inner] {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
        }
    }

    /// <summary>
    /// Obtiene una categoría por su ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(string id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    /// <summary>
    /// Crea una nueva categoría personalizada
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        try
        {
            var category = await _categoryService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una categoría personalizada (no del sistema)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] UpdateCategoryRequest request)
    {
        try
        {
            var category = await _categoryService.UpdateCategoryAsync(id, request);
            return Ok(category);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Elimina una categoría personalizada (no del sistema)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        try
        {
            await _categoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
