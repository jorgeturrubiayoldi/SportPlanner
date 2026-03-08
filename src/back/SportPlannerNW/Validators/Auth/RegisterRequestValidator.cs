using FluentValidation;
using SportPlannerNW.Models.DTOs;

namespace SportPlannerNW.Validators.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("El nombre completo es requerido")
            .MaximumLength(100).WithMessage("El nombre no puede exceder los 100 caracteres");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es requerido")
            .EmailAddress().WithMessage("El formato del email no es válido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres");

        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("El idioma es requerido")
            .Must(x => new[] { "es", "en", "fr" }.Contains(x)).WithMessage("El idioma debe ser es, en o fr");
    }
}
