import { Injectable, signal, computed } from '@angular/core';
import { Toast, ToastType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());

  constructor() {}

  show(type: ToastType, message: string, title?: string, duration: number = 5000): void {
    const id = this.generateId();
    const newToast: Toast = { id, type, title, message, duration };
    
    this._toasts.update(toasts => [...toasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Success'): void {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error'): void {
    this.show('error', message, title);
  }

  info(message: string, title: string = 'Info'): void {
    this.show('info', message, title);
  }

  warning(message: string, title: string = 'Warning'): void {
    this.show('warning', message, title);
  }

  remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
