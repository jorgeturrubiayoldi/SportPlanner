import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col items-end w-full max-w-sm pointer-events-none">
      @for (toast of notificationService.toasts(); track toast.id) {
        <app-toast [toast]="toast" (close)="notificationService.remove($event)"></app-toast>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
