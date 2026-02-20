# Track 008: Integración Contexto Vivo (WebMCP)

## Objetivos
Transformar SportPlanner en una aplicación "Agent-Ready" permitiendo que el LLM interactúe directamente con el estado de ejecución del navegador.

## Plan de Ejecución

### Fase 1: Infraestructura Base
- [x] Descargar/Instalar `@jason.today/webmcp`.
- [x] Integrar el widget en el `index.html` de la aplicación Angular.
- [ ] Verificar la aparición del widget y la generación de tokens.

### Fase 2: Exposición de Recursos (ReadOnly)
- [ ] Registrar recurso `app-state`: Estado global de la aplicación.
- [ ] Registrar recurso `current-user`: Perfil del usuario autenticado.
- [ ] Registrar recurso `active-plan`: Datos de la planificación actual en pantalla.

### Fase 3: Herramientas de Acción (Read/Write)
- [ ] Crear herramienta `navigate-to`: Permitir al agente cambiar de página.
- [ ] Crear herramienta `apply-template`: Aplicar ejercicios sugeridos por el agente directamente en la UI.

### Fase 4: Prompts Inteligentes
- [ ] Registrar prompt `analyze-session`: Analizar la carga de trabajo visualizada y sugerir ajustes.
- [ ] Registrar prompt `fix-ui-layout`: Herramienta para que el agente corrija desalineaciones detectadas por el usuario.

## Notas Técnicas
- El widget de WebMCP se comunica vía Model Context Protocol.
- El agente usará el token generado por el widget para establecer la conexión bidireccional.
