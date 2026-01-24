# Análisis Funcional Exhaustivo: SportPlanner

Este documento detalla la lógica operativa, flujos de datos y algoritmos de **SportPlanner**, basado en la ingeniería inversa del archivo maestro de producto. Actúa como la fuente de verdad para el comportamiento del sistema.

---

## 1. Onboarding y Configuración del Equipo (Lógica de Datos)

El proceso de creación de un equipo no es solo un registro administrativo; es el disparador que inicializa el motor de inteligencia deportiva de la aplicación.

### 1.1. Registro y Selección de Itinerario
Cuando un usuario registra un nuevo equipo, el sistema ejecuta las siguientes operaciones internas:

1.  **Input del Usuario:**
    *   **Nombre del Equipo**
    *   **Categoría (Edad):** (Ej. *Alevín*)
    *   **Nivel Inicial:** (Ej. *Nivel B*)

2.  **Carga del "Itinerario Base" (Pre-cargado):**
    *   Basado en la **Categoría**, el sistema selecciona un conjunto de conceptos predefinidos ("Itinerarios por edad").
    *   *Lógica:* `SI Categoría == "Alevín" ENTONCES Cargar_Itinerario("Alevín_Standard")`
    *   Esto evita que el entrenador parta de cero, ofreciéndole un esqueleto metodológico adaptado a la edad.

3.  **Cálculo del "Gap" de Nivel (Esperado vs. Real):**
    El sistema posee una tabla de referencia que dicta el nivel ideal para cada categoría.
    
    | Variable | Descripción | Ejemplo (Datos Excel) |
    | :--- | :--- | :--- |
    | **Nivel Esperado** | Estándar teórico definido por el sistema para la categoría. | `5` (para Alevín) |
    | **Nivel Real** | Evaluación subjetiva del entrenador o input histórico. | `3 por debajo de lo esperado` |
    | **Nivel Efectivo** | Resultado del cálculo (`Esperado - Gap`). | `2` |

    *   **Consecuencia:** El sistema ajusta automáticamente la **Complejidad Técnica** inicial de los ejercicios sugeridos. En este ejemplo, el equipo comenzaría trabajando con ejercicios de **Complejidad 2** en lugar de 5.

---

## 2. El Motor de Planificación (Core del Negocio)

El motor de planificación cruza el calendario disponible con los conceptos deportivos y sus complejidades.

### 2.1. Conceptos y "Esqueletos de Complejidad"
El sistema no trata todos los ejercicios por igual. Utiliza una matriz de dos dimensiones para clasificar la dificultad:

*   **Complejidad Técnica (CTec):** Ejecución individual (0 a 10).
*   **Complejidad Táctica (CTac):** Toma de decisiones colectiva.

**Reglas de Negocio (Constraints):**
*   **Técnica Pura:** Los ejercicios de "Técnica Individual" tienen por defecto `CTac = 0`.
*   **Juegos Tácticos:** Los ejercicios de situaciones reales (2x2, 3x3) tienen valores predeterminados de complejidad táctica y técnica que no deben ser 0.

### 2.2. Plantillas de Nivel de Concepto
Para agilizar la asignación de ejercicios, el sistema utiliza "Plantillas" que encapsulan niveles de dificultad.

| Plantilla | Complejidad Táctica | Complejidad Técnica | Nivel Efectivo Correlacionado |
| :--- | :---: | :---: | :--- |
| **Plantilla Técnica Individual A** | 0 | 2 | Iniciación (Niveles 1-3) |
| **Plantilla Técnica Individual B** | 0 | 4 | Intermedio (Niveles 4-5) |
| **Plantilla Técnica Individual C** | 0 | 6 | Avanzado (Niveles 6+) |

**Funcionamiento del Algoritmo:**
1.  El motor verifica el **Nivel Efectivo** del equipo (ej. 2).
2.  Busca la Plantilla que coincide con esa complejidad técnica (Plantilla A).
3.  Filtra y sugiere ejercicios etiquetados con esa plantilla o rango de complejidad.

---

## 3. Simulación de Flujo de Usuario (User Journey)

### Paso 1: Dashboard y Selección
*   El entrenador accede al **Dashboard** y ve su lista de equipos.
*   Selecciona "Alevín B" y entra en la **"Pantalla Planificaciones"**.

### Paso 2: Creación de Planificación (El "Wizard")
*   Define fecha inicio/fin y días de entrenamiento (ej. Lunes, Miércoles).
*   El sistema calcula el **Volumen Total de Sesiones**.
*   Se presentan los conceptos (Ataque, Defensa, Técnica) categorizados.
*   **Selección Guiada:** El entrenador selecciona conceptos. El sistema sugiere el orden metodológico ("qué va antes").

### Paso 3: Generación de Sesión (Entrenamiento)
*   El entrenador va a **"Creación de Entrenamientos"**.
*   **Input Automático:** El sistema analiza:
    *   *Lo ya entrenado* (Histórico).
    *   *Lo pendiente* (Planificación vs. Realidad).
    *   *Frecuencia necesaria* ("Un concepto no se aprende en un día").
*   **Output:** El sistema propone una sesión con ejercicios específicos.
    *   *Ejemplo:* "Hoy toca **Técnica Individual A** (Dribling)".

### Paso 4: Ejecución y Pizarra Táctica
*   Dentro de la sesión, el entrenador usa la **Pizarra Táctica**.
*   Puede visualizar "Plantillas Tácticas 1x1" o "2x2".
*   Las flechas y movimientos (pase, dribling) se grafican sobre fondos específicos del deporte.
*   Puede simular (Play) para ver la dinámica.

---

## 4. Lógica de Automatización y Feedback

El sistema es dinámico y se auto-corrige (Re-planificación).

### 4.1. El Bucle de Feedback
*   Al finalizar un entrenamiento, el entrenador marca los conceptos/ejercicios como **"Completado"** o **"Pendiente"**.
*   También puede calificar el desempeño real (Feedback).

### 4.2. Algoritmo de Ajuste de Nivel
Si el entrenador indica constantemente que el equipo "falta nivel" o no completa los objetivos:
1.  **Detección:** El sistema detecta una discrepancia negativa entre el Nivel Esperado y el Real.
2.  **Acción (Downgrade):** El "Nivel Efectivo" interno se reduce (ej. de 5 a 4).
3.  **Re-planificación Futura:** Las próximas sesiones sustituyen automáticamente ejercicios de "Plantilla B" (CTec 4) por ejercicios de "Plantilla A" (CTec 2) o aumentan la repetición de conceptos base.

### 4.3. Lógica de Completitud
*   El objetivo del algoritmo automático es **completar la planificación**.
*   Si el sistema detecta que faltan horas para cubrir todos los conceptos al ritmo actual, alertará o priorizará conceptos clave sobre los secundarios.
*   **Regla de Oro:** "Un alumno no aprende haciendo un concepto una vez". El algoritmo prioriza la **repetición espaciada** sobre la variedad caótica.
