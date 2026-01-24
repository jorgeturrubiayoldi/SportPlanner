---
name: project-conductor
description: Orquestador principal del proyecto. Define normas globales, flujos de trabajo y selecciona skills especializadas.
---

# Project Conductor

Este skill actúa como el **Project Lead** y **Arquitecto Principal**. Su responsabilidad es mantener la coherencia global, recordar las reglas de negocio y delegar tareas técnicas a las skills especializadas.

## 1. Reglas Globales (Inquebrantables)

1.  **Idioma**: Toda comunicación debe ser en **Castellano**.
2.  **Estilo Visual**:
    *   Diseño Premium: "High-Performance Dark Mode Sport Tech".
    *   Componentes deben seguir estrictamente los estilos y colores de la aplicación (variables CSS/Tailwind existentes).
    *   No usar placeholders; generar imágenes si es necesario.
3.  **Desarrollo Frontend (Angular + Tailwind)**:
    *   **Arquitectura**: Usar `angular-best-practices` (Angular CLI, Standalone, Signals).
    *   **Diseño**: Consultar `sportplanner-design-system` para saber QUÉ colores/tokens usar.
    *   **Estilado**: Implementar usando `tailwind-design-system` (Tailwind v4) para saber CÓMO aplicarlo (HTML classes).

## 2. Orquestación de Skills

Usa las siguientes skills según la naturaleza de la tarea. No intentes reinventar la rueda; usa la guía especializada.

| Skill | Cuándo usarla |
| :--- | :--- |
| **product-designer** | Al inicio de una feature. Para definir UX, UI, User Journeys y estética. **Siempre antes de codificar UI compleja.** |
| **angular-best-practices** | **OBLIGATORIA** para lógica/estructura. Define: Signals, Standalone Components, RxJS, Project Structure. |
| **sportplanner-design-system** | **OBLIGATORIA** (Fuente de Verdad Visual). Define: Tokens de colores (Primary/Secondary), Tipografía, y Reglas de Marca. |
| **tailwind-design-system** | **OBLIGATORIA** (Implementación Técnica). Define: Configuración Tailwind v4, Clases Utilitarias, Patrones de implementación UI. |
| **supabase-reference-architecture** | Al diseñar tablas, RLS, Edge Functions o estructura de base de datos. |
| **lang-dotnet-dev** | Si tocamos Backend .NET. |

## 3. Flujo de Trabajo Estándar (The "Conductor" Flow)

Para cualquier tarea de complejidad media/alta, sigue este proceso:

### Fase 1: Análisis y Diseño (Product & Design)
*   **Activar**: `product-designer` + `sportplanner-design-system`.
*   **Objetivo**: Entender el "Qué" y alinearlo con la Marca.
*   **Salida Esperada**: Lista de requisitos y validación visual contra el sistema de diseño.

### Fase 2: Arquitectura de Datos (Data & Logic)
*   **Activar**: `supabase-reference-architecture` (o backend pertinente).
*   **Objetivo**: Definir modelo de datos necesario.
*   **Salida Esperada**: Definiciones de tablas, DTOs, cambios en API.

### Fase 3: Implementación Frontend (Dev)
*   **Activar Tríada Frontend**: `angular-best-practices` + `sportplanner-design-system` + `tailwind-design-system`.
*   **Objetivo**: Construcción técnica precisa.
*   **Pasos**:
    1.  **Estructura**: Generar componentes con Angular CLI (`angular-best-practices`).
    2.  **Tokens**: Consultar `sportplanner-design-system` para obtener los valores correctos (ej: usar `bg-primary` en lugar de `bg-green-500`).
    3.  **Estilado**: Aplicar clases de Tailwind (`tailwind-design-system`) directamente en el HTML. Prohibido usar estilos externos a menos que sea inevitable.
    4.  **Lógica**: Implementar Signals y Servicios (`angular-best-practices`).
    5.  **Validación**: Asegurar Dark Mode nativo y Responsividad.

### Fase 4: Revisión (QA)
*   Verificar contra las **Reglas Globales**.
*   ¿Se ve "Premium"?
*   ¿El código es limpio y sigue los patrones?

## 4. Estructura de Proyecto y Directorios Clave

*   `src/front`: Aplicación Frontend (Angular).
*   `.agent/skills`: Base de conocimiento del agente.
*   `.agent/workflows`: Flujos de trabajo automatizados.

## 5. Instrucciones de Planificación

Antes de escribir código:
1.  Analiza qué skills necesitas.
2.  Lee sus archivos `SKILL.md` si no los tienes frescos en contexto.
3.  Propón un plan paso a paso al usuario citando qué skills usarás en cada paso.
