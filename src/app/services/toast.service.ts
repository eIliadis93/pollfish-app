import { Injectable, signal } from '@angular/core';
import { ToastKind, ToastMessage } from '../models/toast.model';
import { AppError } from '../models/app-error.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  private push(kind: ToastKind, text: string, duration = 3000) {
    const toast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind,
      text,
      duration,
    };

    this.toasts.update((list) => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(text: string, duration = 3000) {
    this.push('success', text, duration);
  }

  info(text: string, duration = 3000) {
    this.push('info', text, duration);
  }

  warning(text: string, duration = 3000) {
    this.push('warning', text, duration);
  }

  error(text: string, duration = 4000) {
    this.push('error', text, duration);
  }

  fromAppError(err: AppError) {
    this.error(err.message);
  }

  remove(id: string) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
