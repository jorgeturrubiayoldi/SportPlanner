import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { environment } from '../../../environments/environment';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabaseService = inject(SupabaseService);
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (!isApiUrl) {
    return next(req);
  }

  return from(supabaseService.getClient().auth.getSession()).pipe(
    switchMap(({ data: { session } }) => {
      if (session?.access_token) {
        // console.log('[AuthInterceptor] Attaching token:', session.access_token.substring(0, 10) + '...');
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
      } else {
        console.warn('[AuthInterceptor] No active session found.');
      }
      return next(req);
    })
  );
};
