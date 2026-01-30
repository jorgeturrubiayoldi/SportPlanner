export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, default 3000
}

// Future expansion for persistent notifications
export interface Notification {
  id: string;
  type: 'system' | 'message' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}
