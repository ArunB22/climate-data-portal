import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Button } from '../../../shared/ui/button/button';

function initialsOf(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]/).filter(Boolean);
  const chars = parts.length > 1 ? [parts[0][0], parts[1][0]] : [local[0], local[1]];
  return chars.join('').toUpperCase();
}

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Button],
  template: `
    <nav class="nav">
      <a class="wordmark" routerLink="/">
        <svg class="mark" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="13" fill="none" stroke="var(--brand)" stroke-width="1.6" />
          <path
            d="M15 2v26M2 15h26M6 7.5c5 3.5 13 3.5 18 0M6 22.5c5-3.5 13-3.5 18 0"
            fill="none"
            stroke="var(--brand)"
            stroke-width="1.2"
            opacity=".7"
          />
        </svg>
        <span class="t">Vasudha<small>Data Atlas · {{ auth.role() === 'SUPER_ADMIN' ? 'super admin' : 'admin' }}</small></span>
      </a>
      <div class="nav-links">
        @if (auth.hasRole('ADMIN')) {
          <a routerLink="/admin/dashboard" routerLinkActive="active">My datasets</a>
          <a routerLink="/admin/add" routerLinkActive="active">Add dataset</a>
        }
        @if (auth.hasRole('SUPER_ADMIN')) {
          <a routerLink="/superadmin/datasets" routerLinkActive="active">Datasets</a>
          <a routerLink="/superadmin/admins" routerLinkActive="active">Admins</a>
        }
        <a routerLink="/">Public atlas ↗</a>
      </div>
      <span class="spacer"></span>
      <div class="who">
        <span class="avatar">{{ initials() }}</span>
        <span>{{ auth.email() }}<span class="role">{{ auth.role() === 'SUPER_ADMIN' ? 'Super admin' : 'Admin' }}</span></span>
      </div>
      <app-button variant="quiet" size="sm" (click)="logout()">Sign out</app-button>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styleUrl: './authenticated-layout.css',
})
export class AuthenticatedLayout {
  protected readonly initials = computed(() => initialsOf(this.auth.email() ?? ''));

  constructor(
    protected readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
