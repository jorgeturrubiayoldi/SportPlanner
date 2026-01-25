import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  
  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected showPassword = signal(false);
  protected loading = signal(false);
  protected errorMessage = signal<string | null>(null);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    const result = await this.authService.signIn(email, password);

    this.loading.set(false);

    if (result.success) {
      console.log('Login successful, checking user from signal...');
      
      // La señal currentUser ya debería estar actualizada porque signIn espera a checkSession
      const user = this.authService.currentUser();
      console.log('User from signal:', user);
      
      if (user) {
        console.log('Checking subscription for user:', user.id);
        try {
          const hasSubscription = await this.subscriptionService.checkSubscriptionStatus(user.id);
          console.log('Has subscription:', hasSubscription);
          
          if (hasSubscription) {
            console.log('Redirecting to dashboard');
            this.router.navigate(['/dashboard']);
          } else {
            console.log('Redirecting to onboarding/subscription');
            this.router.navigate(['/onboarding/subscription']);
          }
        } catch (err) {
          console.error('Error checking subscription:', err);
          this.router.navigate(['/dashboard']);
        }
      } else {
        console.log('No user found in signal after login, fallback to dashboard');
        this.router.navigate(['/dashboard']);
      }
    } else {
      console.error('Login failed:', result.error);
      this.errorMessage.set(result.error || 'Error al iniciar sesión');
    }
  }
}
