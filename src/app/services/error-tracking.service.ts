import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppError, ErrorKind } from '../models/app-error.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ErrorTrackingService {
  private readonly toast = inject(ToastService);

  private readonly _lastError = signal<AppError | null>(null);
  readonly lastError = this._lastError;

  track(operation: string, error: unknown, retried?: number): AppError {
    const appError = this.toAppError(operation, error, retried);
    this._lastError.set(appError);

    console.error(
      `[ErrorTracking] ${appError.operation} (${appError.kind})`,
      appError.technicalMessage ?? appError.message
    );

    this.toast.fromAppError(appError);

    return appError;
  }

  clear(): void {
    this._lastError.set(null);
  }

  private toAppError(operation: string, error: unknown, retried?: number): AppError {
    let kind: ErrorKind = 'unknown';
    let message = 'Προέκυψε ένα απρόσμενο σφάλμα. Δοκίμασε ξανά.';
    let technicalMessage: string | undefined;
    let statusCode: number | undefined;

    if (error instanceof HttpErrorResponse) {
      statusCode = error.status;
      technicalMessage = error.message;

      if (!navigator.onLine) {
        kind = 'network';
        message = 'Δεν υπάρχει σύνδεση στο διαδίκτυο.';
      } else if (statusCode >= 500) {
        kind = 'server';
        message = 'Προέκυψε σφάλμα στο server μετά από 3 προσπάθειες. Δοκίμασε ξανά.';
      } else if (statusCode >= 400) {
        kind = 'client';
        message = 'Το αίτημα δεν ήταν έγκυρο. Έλεγξε τα στοιχεία σου και δοκίμασε ξανά.';
      }
    } else if (error instanceof Error) {
      kind = 'unknown';
      technicalMessage = error.message;
    }

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      operation,
      kind,
      message,
      technicalMessage,
      statusCode,
      retried,
      timestamp: Date.now(),
    };
  }
}
