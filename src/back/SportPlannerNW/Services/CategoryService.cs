using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponse>> GetCategoriesBySportIdAsync(string sportId);
    Task<CategoryResponse?> GetCategoryByIdAsync(string id);
    Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
    Task<CategoryResponse> UpdateCategoryAsync(string id, UpdateCategoryRequest request);
    Task<bool> DeleteCategoryAsync(string id);
}

public class CategoryService : ICategoryService
{
    private readonly Supabase.Client _supabase;

    public CategoryService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<IEnumerable<CategoryResponse>> GetCategoriesBySportIdAsync(string sportId)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<CategoryModel>()
            .Filter("sport_id", Constants.Operator.Equals, sportId)
            .Filter("active", Constants.Operator.Equals, "true")
            .Order("sort_order", Constants.Ordering.Ascending)
            .Get();

        return response.Models.Select(c => new CategoryResponse(
            c.Id,
            c.SportId,
            c.Name,
            c.MinBirthYear,
            c.MaxBirthYear,
            c.SortOrder,
            c.IsSystem,
            c.Active
        ));
    }

    public async Task<CategoryResponse?> GetCategoryByIdAsync(string id)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<CategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (response == null) return null;

        return new CategoryResponse(
            response.Id,
            response.SportId,
            response.Name,
            response.MinBirthYear,
            response.MaxBirthYear,
            response.SortOrder,
            response.IsSystem,
            response.Active
        );
    }

    public async Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request)
    {
        await _supabase.InitializeAsync();

        var newCategory = new CategoryModel
        {
            SportId = request.SportId,
            Name = request.Name,
            MinBirthYear = request.MinBirthYear,
            MaxBirthYear = request.MaxBirthYear,
            SortOrder = request.SortOrder,
            IsSystem = false, // Usuario crea categorías custom, no del sistema
            Active = true
        };

        var response = await _supabase.From<CategoryModel>().Insert(newCategory);

        if (response.Model == null)
            throw new Exception("Error al crear la categoría.");

        return new CategoryResponse(
            response.Model.Id,
            response.Model.SportId,
            response.Model.Name,
            response.Model.MinBirthYear,
            response.Model.MaxBirthYear,
            response.Model.SortOrder,
            response.Model.IsSystem,
            response.Model.Active
        );
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(string id, UpdateCategoryRequest request)
    {
        await _supabase.InitializeAsync();

        var existing = await _supabase.From<CategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existing == null)
            throw new Exception("Categoría no encontrada.");

        if (existing.IsSystem)
            throw new Exception("No se pueden modificar categorías del sistema.");

        existing.Name = request.Name;
        existing.MinBirthYear = request.MinBirthYear;
        existing.MaxBirthYear = request.MaxBirthYear;
        existing.SortOrder = request.SortOrder;
        existing.Active = request.Active;
        existing.UpdatedAt = DateTime.UtcNow;

        var response = await _supabase.From<CategoryModel>().Update(existing);

        if (response.Model == null)
            throw new Exception("Error al actualizar la categoría.");

        return new CategoryResponse(
            response.Model.Id,
            response.Model.SportId,
            response.Model.Name,
            response.Model.MinBirthYear,
            response.Model.MaxBirthYear,
            response.Model.SortOrder,
            response.Model.IsSystem,
            response.Model.Active
        );
    }

    public async Task<bool> DeleteCategoryAsync(string id)
    {
        await _supabase.InitializeAsync();

        var existing = await _supabase.From<CategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existing == null)
            throw new Exception("Categoría no encontrada.");

        if (existing.IsSystem)
            throw new Exception("No se pueden eliminar categorías del sistema.");

        await _supabase.From<CategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Delete();

        return true;
    }
}
