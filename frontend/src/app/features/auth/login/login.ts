import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorResponse } from '../../../core/models/auth.model';
import { Button } from '../../../shared/ui/button/button';
import { Field } from '../../../shared/ui/field/field';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Button, Field],
  template: `
    <div class="login">
      <div class="panel">
        <div class="wordmark">
          <svg class="mark" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="13" fill="none" stroke="#A9DCBE" stroke-width="1.6" />
            <path
              d="M15 2v26M2 15h26M6 7.5c5 3.5 13 3.5 18 0M6 22.5c5-3.5 13-3.5 18 0"
              fill="none"
              stroke="#A9DCBE"
              stroke-width="1.2"
              opacity=".7"
            />
          </svg>
          <span class="t">Vasudha<small>Data Atlas · staff</small></span>
        </div>
        <blockquote>Evidence that is <em>public</em> is evidence that can be acted on.</blockquote>
        <p class="fine">
          Datasets you publish here appear on the public atlas after Super Admin review.<br />
          Access is by invitation only.
        </p>
      </div>
      <div class="form">
        <div>
          <h1>Sign in to publish</h1>
          <p class="sub">Use the account your Super Admin created for you.</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <app-field label="Email">
            <input class="input" type="email" formControlName="email" autocomplete="username" />
          </app-field>
          <app-field label="Password">
            <input class="input" type="password" formControlName="password" autocomplete="current-password" />
          </app-field>
          @if (errorMessage()) {
            <p class="error">{{ errorMessage() }}</p>
          }
          <app-button type="submit" variant="primary" size="lg" [disabled]="form.invalid || submitting()" style="justify-content:center">
            {{ submitting() ? 'Signing in...' : 'Sign in' }}
          </app-button>
        </form>
        <p class="fine">There is no self-service password reset — contact your Super Admin.</p>
      </div>
    </div>
  `,
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.router.navigate([response.role === 'SUPER_ADMIN' ? '/superadmin' : '/admin']);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.extractMessage(error));
      },
    });
  }

  private extractMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      return body?.message ?? 'Something went wrong. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }
}
