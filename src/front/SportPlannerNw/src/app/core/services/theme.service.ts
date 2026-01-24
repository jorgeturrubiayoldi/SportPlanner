import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'sportplanner-theme';
  
  // Signal para el tema actual
  readonly currentTheme = signal<Theme>(this.getInitialTheme());
  
  constructor() {
    // Effect para aplicar el tema cuando cambie
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.applyTheme(this.currentTheme());
      }
    });
  }
  
  /**
   * Obtiene el tema inicial desde localStorage o preferencias del sistema
   */
  private getInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }
    
    // Intentar obtener desde localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Fallback a preferencias del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  
  /**
   * Aplica el tema al documento HTML
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Persistir en localStorage
    localStorage.setItem(this.STORAGE_KEY, theme);
  }
  
  /**
   * Alterna entre modo light y dark
   */
  toggleTheme(): void {
    this.currentTheme.update(current => current === 'light' ? 'dark' : 'light');
  }
  
  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
}
