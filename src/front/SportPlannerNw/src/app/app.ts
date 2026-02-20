import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { TranslateService } from '@ngx-translate/core';
import { WebMcpService } from './core/services/webmcp.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SportPlannerNw');
  private translate = inject(TranslateService);
  private webMcpService = inject(WebMcpService);

  constructor() {
    this.translate.addLangs(['es', 'fr', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }
}
