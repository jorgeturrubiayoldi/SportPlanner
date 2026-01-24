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
3.  **Desarrollo Frontend (Angular)**:
    *   Usar **Angular CLI** para generar componentes, servicios, etc.
    *   Respetar `angular-best-practices`.
4.  **Desarrollo Backend**:
    *   Mantener consistencia estricta: `Controller` -> `Service` -> `Repository` -> `DTOs` -> `Mappers`.
    *   Respetar `lang-dotnet-dev` (si aplica .NET) o `supabase-reference-architecture` (si aplica Supabase).
5.  **Interacción**:
    *   Si tienes preguntas, formula la pregunta y **ESPERA** a que el usuario conteste. No asumas.

## 2. Orquestación de Skills

Usa las siguientes skills según la naturaleza de la tarea. No intentes reinventar la rueda; usa la guía especializada.

| Skill | Cuándo usarla |
| :--- | :--- |
| **product-designer** | Al inicio de una feature. Para definir UX, UI, User Journeys y estética. **Siempre antes de codificar UI compleja.** |
| **angular-best-practices** | Para todo código Angular. Signals, Componentes Standalone, RxJS, estructura de carpetas. |
| **tailwind-design-system** | Al escribir CSS/HTML. Para design tokens, responsividad y coherencia visual. |
| **supabase-reference-architecture** | Al diseñar tablas, RLS, Edge Functions o estructura de base de datos. |
| **lang-dotnet-dev** | Si tocamos Backend .NET (si aplica en el contexto). |

## 3. Flujo de Trabajo Estándar (The "Conductor" Flow)

Para cualquier tarea de complejidad media/alta, sigue este proceso:

### Fase 1: Análisis y Diseño (Product & Design)
*   **Activar**: `product-designer`.
*   **Objetivo**: Entender el "Qué" y el "Por qué".
*   **Salida Esperada**: Wireframes mentales, lista de requisitos, User Journey validado.

### Fase 2: Arquitectura de Datos (Data & Logic)
*   **Activar**: `supabase-reference-architecture` (o backend pertinente).
*   **Objetivo**: Definir modelo de datos necesario para soportar el diseño.
*   **Salida Esperada**: Definiciones de tablas, DTOs, cambios en API.

### Fase 3: Implementación Frontend (Dev)
*   **Activar**: `angular-best-practices` + `tailwind-design-system`.
*   **Objetivo**: Construir la UI y lógica.
*   **Pasos**:
    1.  Generar componentes con Angular CLI.
    2.  Aplicar estructura HTML/CSS (Tailwind).
    3.  Implementar lógica (Servicios, Signals).
    4.  Conectar con Backend.

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
