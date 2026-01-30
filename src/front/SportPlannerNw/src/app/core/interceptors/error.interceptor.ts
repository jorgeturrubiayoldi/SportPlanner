import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 0) {
           errorMessage = 'Unable to connect to the server.';
        } else if (error.error && error.error.message) {
           errorMessage = error.error.message;
        } else {
           errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      // We might want to skip notifications for 404s or handled errors if needed
      // For now, robust feedback means showing errors.
      notificationService.error(errorMessage, `Error ${error.status}`);

      return throwError(() => error);
    })
  );
};
