import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SuperAdminAccountService } from '../../../core/services/super-admin-account.service';
import { AdminAccountDto, ErrorResponse } from '../../../core/models/auth.model';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { Field } from '../../../shared/ui/field/field';

@Component({
  selector: 'app-superadmin-admins',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, Button, Card, Field],
  template: `
    <div class="app-main">
      <div class="page-head">
        <div>
          <span class="eyebrow">Manage staff</span>
          <h1>Admin accounts</h1>
          <p class="sub">Create Admin accounts, and enable or disable access at any time.</p>
        </div>
      </div>

      <app-card class="pad" style="margin-bottom: 24px">
        <form [formGroup]="form" (ngSubmit)="createAdmin()" class="create-form">
          <app-field label="Email">
            <input class="input" type="email" formControlName="email" placeholder="admin@vasudha-foundation.org" />
          </app-field>
          <app-field label="Temporary password" hint="min 8 characters">
            <input class="input" type="password" formControlName="password" />
          </app-field>
          <app-button type="submit" variant="primary" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Creating...' : 'Create admin' }}
          </app-button>
        </form>
        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
      </app-card>

      <app-card>
        <div class="table-scroll">
          <table class="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th class="num">Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (admin of admins(); track admin.id) {
                <tr>
                  <td><div class="title">{{ admin.email }}</div></td>
                  <td>
                    <span class="status" [class.ok]="admin.enabled" [class.bad]="!admin.enabled">
                      @if (admin.enabled) {
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3 3 7-7" /></svg>
                      } @else {
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                      }
                      {{ admin.enabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="num">{{ admin.createdAt | date: 'mediumDate' }}</td>
                  <td class="actions">
                    <app-button variant="quiet" size="sm" (click)="toggle(admin)">{{ admin.enabled ? 'Disable' : 'Enable' }}</app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styleUrl: './superadmin-admins.css',
})
export class SuperAdminAdmins implements OnInit {
  private readonly fb = inject(FormBuilder);

  protected readonly admins = signal<AdminAccountDto[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(private readonly service: SuperAdminAccountService) {}

  ngOnInit(): void {
    this.load();
  }

  createAdmin(): void {
    if (this.form.invalid) {
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.service.create(email, password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset();
        this.load();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        if (error instanceof HttpErrorResponse) {
          const body = error.error as ErrorResponse | undefined;
          this.errorMessage.set(body?.message ?? 'Could not create the admin account.');
        }
      },
    });
  }

  toggle(admin: AdminAccountDto): void {
    this.service.setEnabled(admin.id, !admin.enabled).subscribe(() => this.load());
  }

  private load(): void {
    this.service.list().subscribe((data) => this.admins.set(data));
  }
}
