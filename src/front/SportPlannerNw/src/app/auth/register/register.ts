import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
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

    const { password, confirmPassword } = this.form.controls;
    if (password.value !== confirmPassword.value) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { fullName, email, password: pwd } = this.form.getRawValue();
    const result = await this.authService.signUp(email, pwd, fullName);

    this.loading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Error al crear la cuenta');
    }
  }
}
