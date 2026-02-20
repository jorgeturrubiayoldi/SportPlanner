import { Injectable, inject, effect, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebMcpService {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private mcpInstance: any = null;

  constructor() {
    // Only run in the browser — SSR has no window/WebMCP
    if (isPlatformBrowser(this.platformId)) {
      // Set up reactive user-profile resource inside the injection context
      effect(() => {
        const user = this.authService.currentUser();
        if (user && this.mcpInstance) {
          this.mcpInstance.registerResource(
            'user-profile',
            'Perfil del usuario actualmente autenticado',
            {
              uri: 'user://profile',
              mimeType: 'application/json'
            },
            () => ({
              contents: [{
                uri: 'user://profile',
                mimeType: 'application/json',
                text: JSON.stringify(user)
              }]
            })
          );
        }
      });

      // Wait until the browser has rendered before polling for the global class
      afterNextRender(() => this.initWhenReady());
    }
  }

  private initWhenReady(): void {
    console.log('[WebMCP] Service Instantiated. Waiting for WebMCP class...');
    let attempts = 0;
    const maxAttempts = 30; // 30 × 500ms = 15 seconds max

    const checkInterval = setInterval(() => {
      attempts++;
      const WebMCPClass = (window as any).WebMCP;

      if (WebMCPClass) {
        clearInterval(checkInterval);

        if (!(window as any).mcp) {
          (window as any).mcp = new WebMCPClass();
        }

        this.mcpInstance = (window as any).mcp;
        this.registerResources();
        console.log('[WebMCP] Successfully integrated after', attempts, 'attempts');
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('[WebMCP] Gave up waiting for WebMCP class after', maxAttempts, 'attempts.');
      } else if (attempts % 5 === 0) {
        console.log('[WebMCP] Still waiting for WebMCP class... (attempt', attempts + ')');
      }
    }, 500);
  }

  private registerResources(): void {
    if (!this.mcpInstance) return;

    // Resource: Application Context
    this.mcpInstance.registerResource(
      'app-context',
      'Información general de la aplicación SportPlanner',
      {
        uri: 'app://context',
        mimeType: 'application/json'
      },
      () => ({
        contents: [{
          uri: 'app://context',
          mimeType: 'application/json',
          text: JSON.stringify({
            name: 'SportPlanner',
            version: '1.0.0-nw',
            environment: 'development',
            timestamp: new Date().toISOString()
          })
        }]
      })
    );

    // Tool: Navigate
    this.mcpInstance.registerTool(
      'navigate',
      'Navega a una sección específica de la aplicación',
      {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Ruta a la que navegar (ej: /dashboard, /teams)'
          }
        },
        required: ['path']
      },
      (args: any) => {
        window.location.hash = args.path;
        return {
          content: [{ type: 'text', text: `Navegando a ${args.path}` }]
        };
      }
    );
  }
}
