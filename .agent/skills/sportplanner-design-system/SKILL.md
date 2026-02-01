---
name: sportplanner-design-system
description: Sistema de diseño oficial y guía de estilos para SportPlanner. Usa esta habilidad para todas las tareas de UI/UX.
---

# SportPlanner Design System

Esta habilidad actúa como la fuente de verdad central para el diseño visual de SportPlanner. Define la paleta de colores, tipografía, espaciado, estilos de componentes y patrones de UI.

## 🚀 Instrucciones de Uso para el Agente

1.  **Consultar Siempre Primero**: Antes de crear o modificar cualquier componente de UI, revisa este archivo para ver los estilos y patrones existentes.
2.  **Adherencia Estricta**: Sigue rigurosamente los colores, fuentes y estructuras de componentes definidos. No inventes nuevos estilos a menos que sea necesario.
3.  **Evolución Proactiva**:
    *   Si creas un nuevo componente o defines un nuevo estilo que NO está documentado aquí, **Se requiere interacción con el usuario**.
    *   Pregunta al usuario: *"Hemos definido un nuevo estilo/componente ([Nombre]). ¿Quieres que lo añada a la habilidad 'sportplanner-design-system' para futuras referencias?"*
    *   Si el usuario está de acuerdo, usa la herramienta `replace_file_content` o `multi_replace_file_content` para actualizar este archivo con las nuevas especificaciones.
    *   Mantén el formato Markdown limpio y organizado.
4.  **Prohibición de Degradados (Flat Design)**: No utilices degradados (`linear-gradient`, `text-gradient`, `bg-gradient-to-*`) en textos, fondos o bordes. El estilo oficial es "Flat Premium" usando colores sólidos. **Excepción única**: Solo si el usuario lo sugiere explícitamente para un elemento concreto.

## 🎨 Design Tokens (Estado Actual: Inicializando)

*Nota: Esta sección se poblará a medida que evolucione el proyecto.*

### Paleta de Colores (Tailwind CSS v4 Tokens)

El sistema utiliza **HSL** para permitir opacidades dinámicas en Tailwind.

#### Colores de Marca
*   **Primary (Esmeralda)**: `hsl(160 84% 39%)` -> `bg-primary`, `text-primary`
    *   *Uso*: Acciones principales, bordes activos, anillos de foco.
*   **Secondary (Naranja)**: `hsl(25 95% 53%)` -> `bg-secondary`, `text-secondary`
    *   *Uso*: Acentos, destacados, badges de "Nuevo" o "Popular".

#### Paleta Semántica (Light / Dark Mode Automático)
Estas variables cambian automáticamente según la clase `.dark` (Tailwind Native).

| Token | Light Mode (Valor) | Dark Mode (Valor) | Uso |
| :--- | :--- | :--- | :--- |
| **background** | `hsl(0 0% 100%)` (Blanco) | `hsl(222 47% 11%)` (Slate 900) | Fondo global de la página |
| **foreground** | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` (Blanco roto) | Texto principal |
| **card** | `hsl(0 0% 100%)` | `hsl(222 47% 11%)` | Fondo de tarjetas |
| **muted** | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Fondos secundarios, áreas deshabilitadas |
| **muted-foreground** | `hsl(215.4 16.3% 46.9%)` | `hsl(215 20.2% 65.1%)` | Texto secundario o descriptivo |
| **border** | `hsl(214.3 31.8% 91.4%)` | `hsl(217.2 32.6% 17.5%)` | Bordes de contenedores e inputs |

#### Utilidades Clave
*   **Glassmorphism**: `.glass-card` (Fondo translúcido + Blur + Borde sutil)
*   **Flat Text**: Siempre usa `text-primary` o `text-foreground` en lugar de degradados.

### Tipografía
*   **Familia Tipográfica**: TBD (ej. Inter, Roboto)
*   **Encabezados**: TBD
*   **Cuerpo**: TBD

## 🧩 Biblioteca de Componentes

### Botones (Buttons)
*   **Acciones de Creación/Alta (Create/Add)**: Deben usar **SIEMPRE** el color **Secondary** (Naranja Corporativo).
    *   Clase: `.btn-secondary`
    *   Ejemplos: "Nueva Temporada", "Añadir Jugador", "Crear Equipo".
    *   *Razón*: Diferenciar las acciones principales de creación del resto de la interfaz.
*   **Acciones Principales (General)**: Para otras acciones principales que no sean de creación, usar **Primary** (Esmeralda).
    *   Clase: `.btn-primary`
*   **Acciones Secundarias/Neutras**: Usar estilo `outline` o `ghost`.
    *   Clase: `.btn-outline` o `.btn-ghost`

### Inputs
*   *Pendiente de definición...*

### Tarjetas / Contenedores (Cards)
*   *Pendiente de definición...*

---
*Creado para mantener consistencia en el diseño de SportPlanner.*
