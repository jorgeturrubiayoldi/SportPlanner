import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="relative group">
      <select
        [ngModel]="currentLang()"
        (ngModelChange)="switchLanguage($event)"
        class="appearance-none bg-card/50 backdrop-blur-sm border border-border/50 text-foreground text-sm font-medium rounded-xl pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer transition-all duration-300 hover:bg-card hover:border-border hover:shadow-lg hover:shadow-primary/5"
      >
        @for (lang of languages; track lang) {
          <option [value]="lang" class="bg-card text-foreground py-2">
            {{ lang | uppercase }}
          </option>
        }
      </select>
      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors duration-300">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private translate = inject(TranslateService);
  
  languages = ['es', 'en', 'fr'];
  currentLang = signal<string>('es');

  constructor() {
    // Initialize with current service value
    const serviceLang = this.translate.currentLang || this.translate.defaultLang || 'es';
    this.currentLang.set(serviceLang);
    console.log('LanguageSwitcher initialized. Service lang:', serviceLang);

    // Subscribe to changes
    this.translate.onLangChange.subscribe((event) => {
      console.log('LanguageSwitcher: onLangChange event:', event.lang);
      this.currentLang.set(event.lang);
    });
  }

  switchLanguage(lang: string) {
    console.log('LanguageSwitcher: switching to', lang);
    this.translate.use(lang);
  }
}
