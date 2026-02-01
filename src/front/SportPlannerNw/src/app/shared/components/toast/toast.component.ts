import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../core/models/notification.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card mb-4 flex w-full max-w-sm items-start gap-4 rounded-lg border p-4 shadow-lg transition-all duration-300 pointer-events-auto"
         [ngClass]="getClasses()"
         role="alert">
      
      <!-- Icon -->
      <div class="flex-shrink-0 pt-0.5">
        <span class="text-xl">
          @switch (toast.type) {
            @case ('success') { 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
            @case ('error') { 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            }
            @case ('warning') { 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
                </svg>
            }
            @case ('info') { 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            }
          }
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1">
        @if (toast.title) {
          <h3 class="mb-1 font-semibold leading-none tracking-tight">{{ toast.title }}</h3>
        }
        <p class="text-sm opacity-90 leading-relaxed">{{ toast.message }}</p>
      </div>

      <!-- Close Button -->
      <button (click)="close.emit(toast.id)" 
              class="flex-shrink-0 rounded-md p-1.5 opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Close notification">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ToastComponent {
  @Input({ required: true }) toast!: Toast;
  @Output() close = new EventEmitter<string>();

  getClasses(): string {
    switch (this.toast.type) {
        case 'success':
            return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/20';
        case 'error':
            return 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 dark:bg-red-500/20';
        case 'warning':
            return 'bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-400 dark:bg-orange-500/20';
        case 'info':
            return 'bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20';
        default:
            return 'bg-white border-gray-200';
    }
  }
}
