---
name: sportplanner-dev-standards
description: Estándares técnicos y mejores prácticas para el proyecto SportPlanner (Angular 20 + .NET 10 + Supabase). Úsalo para asegurar consistencia en tipado, seguridad y manejo de errores.
---

# SportPlanner Development Standards

Este skill define las reglas innegociables para el desarrollo en SportPlanner. Todos los agentes deben seguir estas directrices.

## 1. Frontend (Angular 20+)

### Cero `any` Policy
- Está prohibido el uso de `any`. Si una respuesta del backend no tiene tipo, **créalo**.
- Usa interfaces DTO para todas las respuestas de API.

### Gestión de Memoria (RxJS)
- Prohibido suscribirse manualmente sin cierre.
- Usa el operador `takeUntilDestroyed()` de `@angular/core/rxjs-interop` para todas las suscripciones en componentes.

### Arquitectura Moderna
- Usa **Standalone Components** siempre.
- Prioriza **Signals** sobre `BehaviorSubject` para el estado local.
- Usa `ChangeDetectionStrategy.OnPush` por defecto.

## 2. Backend (.NET 10)

### Seguridad de API
- Todos los controladores deben tener el atributo `[Authorize]` a nivel de clase.
- Solo excepciones explícitas (Login/Register) pueden usar `[AllowAnonymous]`.

### Manejo de Errores
- No uses `try-catch` genéricos en los controladores.
- Confía en el `ErrorHandlingMiddleware` global. 
- Si necesitas lanzar un error, usa excepciones específicas (`KeyNotFoundException`, `ArgumentException`).

## 3. Base de Datos (Supabase/PostgreSQL)

### Row Level Security (RLS)
- **Toda tabla nueva debe tener RLS activado.**
- Cada tabla debe tener al menos una política para `authenticated` users basada en su `subscription_id` o `user_id`.

## 4. Workflow de Implementación
1. **Analizar:** Leer interfaces existentes.
2. **Definir:** Crear tipos/DTOs necesarios.
3. **Implementar:** Escribir código siguiendo los patrones arriba mencionados.
4. **Verificar:** Ejecutar `dotnet build` o `ng build`.
