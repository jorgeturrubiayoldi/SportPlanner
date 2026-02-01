using SportPlannerNW.Models;
using SportPlannerNW.Models.DTOs;
using Supabase.Postgrest;

namespace SportPlannerNW.Services;

public interface IConceptService
{
    // Categorías
    Task<IEnumerable<ConceptCategoryResponse>> GetCategoriesTreeAsync(string sportId);
    Task<ConceptCategoryResponse?> GetCategoryByIdAsync(string id);
    Task<ConceptCategoryResponse> CreateCategoryAsync(CreateConceptCategoryRequest request);
    Task<ConceptCategoryResponse> UpdateCategoryAsync(string id, UpdateConceptCategoryRequest request);
    Task<bool> DeleteCategoryAsync(string id);

    // Conceptos
    Task<IEnumerable<ConceptResponse>> GetConceptsByCategoryAsync(string categoryId);
    Task<IEnumerable<ConceptResponse>> GetAllConceptsAsync(string? subscriptionId = null);
    Task<ConceptResponse?> GetConceptByIdAsync(string id);
    Task<ConceptResponse> CreateConceptAsync(CreateConceptRequest request);
    Task<ConceptResponse> UpdateConceptAsync(string id, UpdateConceptRequest request);
    Task<bool> DeleteConceptAsync(string id);
}

public class ConceptService : IConceptService
{
    private readonly Supabase.Client _supabase;

    public ConceptService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    #region Categorías

    public async Task<IEnumerable<ConceptCategoryResponse>> GetCategoriesTreeAsync(string sportId)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<ConceptCategoryModel>()
            .Filter("sport_id", Constants.Operator.Equals, sportId)
            .Filter("active", Constants.Operator.Equals, "true")
            .Order("sort_order", Constants.Ordering.Ascending)
            .Get();

        var allCategories = response.Models.Select(MapToResponse).ToList();

        // Construir árbol jerárquico
        return BuildCategoryTree(allCategories, null);
    }

    private List<ConceptCategoryResponse> BuildCategoryTree(
        List<ConceptCategoryResponse> allCategories,
        string? parentId)
    {
        return allCategories
            .Where(c => c.ParentId == parentId)
            .Select(c => c with
            {
                Children = BuildCategoryTree(allCategories, c.Id)
            })
            .ToList();
    }

    public async Task<ConceptCategoryResponse?> GetCategoryByIdAsync(string id)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<ConceptCategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        return response == null ? null : MapToResponse(response);
    }

    public async Task<ConceptCategoryResponse> CreateCategoryAsync(CreateConceptCategoryRequest request)
    {
        await _supabase.InitializeAsync();

        var newCategory = new ConceptCategoryModel
        {
            SportId = request.SportId,
            ParentId = request.ParentId,
            Name = request.Name,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsSystem = false,
            Active = true
        };

        var response = await _supabase.From<ConceptCategoryModel>().Insert(newCategory);

        if (response.Model == null)
            throw new Exception("Error al crear la categoría de concepto.");

        return MapToResponse(response.Model);
    }

    public async Task<ConceptCategoryResponse> UpdateCategoryAsync(string id, UpdateConceptCategoryRequest request)
    {
        await _supabase.InitializeAsync();

        var existing = await _supabase.From<ConceptCategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existing == null)
            throw new Exception("Categoría de concepto no encontrada.");

        if (existing.IsSystem)
            throw new Exception("No se pueden modificar categorías del sistema.");

        existing.Name = request.Name;
        existing.Description = request.Description;
        existing.SortOrder = request.SortOrder;
        existing.Active = request.Active;
        existing.UpdatedAt = DateTime.UtcNow;

        var response = await _supabase.From<ConceptCategoryModel>().Update(existing);

        if (response.Model == null)
            throw new Exception("Error al actualizar la categoría de concepto.");

        return MapToResponse(response.Model);
    }

    public async Task<bool> DeleteCategoryAsync(string id)
    {
        await _supabase.InitializeAsync();

        var existing = await _supabase.From<ConceptCategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existing == null)
            throw new Exception("Categoría de concepto no encontrada.");

        if (existing.IsSystem)
            throw new Exception("No se pueden eliminar categorías del sistema.");

        // Verificar si tiene hijos
        var children = await _supabase.From<ConceptCategoryModel>()
            .Filter("parent_id", Constants.Operator.Equals, id)
            .Get();

        if (children.Models.Any())
            throw new Exception("No se puede eliminar una categoría con subcategorías. Elimine primero las subcategorías.");

        // Verificar si tiene conceptos asociados
        var concepts = await _supabase.From<ConceptModel>()
            .Filter("concept_category_id", Constants.Operator.Equals, id)
            .Get();

        if (concepts.Models.Any())
            throw new Exception("No se puede eliminar una categoría con conceptos. Elimine o mueva primero los conceptos.");

        await _supabase.From<ConceptCategoryModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Delete();

        return true;
    }

    private static ConceptCategoryResponse MapToResponse(ConceptCategoryModel model)
    {
        return new ConceptCategoryResponse(
            model.Id,
            model.SportId,
            model.ParentId,
            model.Name,
            model.Description,
            model.SortOrder,
            model.IsSystem,
            model.Active
        );
    }

    #endregion

    #region Conceptos

    public async Task<IEnumerable<ConceptResponse>> GetConceptsByCategoryAsync(string categoryId)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<ConceptModel>()
            .Filter("concept_category_id", Constants.Operator.Equals, categoryId)
            .Filter("active", Constants.Operator.Equals, "true")
            .Order("name", Constants.Ordering.Ascending)
            .Get();

        return response.Models.Select(MapConceptToResponse);
    }

    public async Task<IEnumerable<ConceptResponse>> GetAllConceptsAsync(string? subscriptionId = null)
    {
        await _supabase.InitializeAsync();

        var query = _supabase.From<ConceptModel>()
            .Filter("active", Constants.Operator.Equals, "true");

        // Si hay subscriptionId, obtener conceptos del sistema + los custom de esa suscripción
        // Si no hay, solo los del sistema
        if (!string.IsNullOrEmpty(subscriptionId))
        {
            // Obtener conceptos del sistema
            var systemConcepts = await _supabase.From<ConceptModel>()
                .Filter("active", Constants.Operator.Equals, "true")
                .Filter("is_system", Constants.Operator.Equals, "true")
                .Order("name", Constants.Ordering.Ascending)
                .Get();

            // Obtener conceptos custom de la suscripción
            var customConcepts = await _supabase.From<ConceptModel>()
                .Filter("active", Constants.Operator.Equals, "true")
                .Filter("subscription_id", Constants.Operator.Equals, subscriptionId)
                .Order("name", Constants.Ordering.Ascending)
                .Get();

            var allConcepts = systemConcepts.Models
                .Concat(customConcepts.Models)
                .DistinctBy(c => c.Id)
                .OrderBy(c => c.Name);

            return allConcepts.Select(MapConceptToResponse);
        }

        var response = await query
            .Filter("is_system", Constants.Operator.Equals, "true")
            .Order("name", Constants.Ordering.Ascending)
            .Get();

        return response.Models.Select(MapConceptToResponse);
    }

    public async Task<ConceptResponse?> GetConceptByIdAsync(string id)
    {
        await _supabase.InitializeAsync();

        var response = await _supabase.From<ConceptModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        return response == null ? null : MapConceptToResponse(response);
    }

    public async Task<ConceptResponse> CreateConceptAsync(CreateConceptRequest request)
    {
        await _supabase.InitializeAsync();

        var newConcept = new ConceptModel
        {
            ConceptCategoryId = request.ConceptCategoryId,
            SubscriptionId = request.SubscriptionId,
            Name = request.Name,
            Description = request.Description,
            VideoUrl = request.VideoUrl,
            ImageUrl = request.ImageUrl,
            DifficultyLevel = Math.Clamp(request.DifficultyLevel, 1, 5),
            IsSystem = string.IsNullOrEmpty(request.SubscriptionId), // Si no hay subscription, es del sistema
            Active = true
        };

        var response = await _supabase.From<ConceptModel>().Insert(newConcept);

        if (response.Model == null)
            throw new Exception("Error al crear el concepto.");

        return MapConceptToResponse(response.Model);
    }

    public async Task<ConceptResponse> UpdateConceptAsync(string id, UpdateConceptRequest request)
    {
        await _supabase.InitializeAsync();

        var existing = await _supabase.From<ConceptModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existing == null)
            throw new Exception("Concepto no encontrado.");

        if (existing.IsSystem)
            throw new Exception("No se pueden modificar conceptos del sistema.");

        existing.ConceptCategoryId = request.ConceptCategoryId;
        existing.Name = request.Name;
        existing.Description = request.Description;
        existing.VideoUrl = request.VideoUrl;
        existing.ImageUrl = request.ImageUrl;
        existing.DifficultyLevel = Math.Clamp(request.DifficultyLevel, 1, 5);
        existing.Active = request.Active;
        existing.UpdatedAt = DateTime.UtcNow;

        var response = await _supabase.From<ConceptModel>().Update(existing);

        if (response.Model == null)
            throw new Exception("Error al actualizar el concepto.");

        return MapConceptToResponse(response.Model);
    }

    public async Task<bool> DeleteConceptAsync(string id)
    {
        await _supabase.InitializeAsync();

        var existing = await _supabase.From<ConceptModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Single();

        if (existing == null)
            throw new Exception("Concepto no encontrado.");

        if (existing.IsSystem)
            throw new Exception("No se pueden eliminar conceptos del sistema.");

        await _supabase.From<ConceptModel>()
            .Filter("id", Constants.Operator.Equals, id)
            .Delete();

        return true;
    }

    private static ConceptResponse MapConceptToResponse(ConceptModel model)
    {
        return new ConceptResponse(
            model.Id,
            model.ConceptCategoryId,
            model.SubscriptionId,
            model.Name,
            model.Description,
            model.VideoUrl,
            model.ImageUrl,
            model.DifficultyLevel,
            model.IsSystem,
            model.Active
        );
    }

    #endregion
}
