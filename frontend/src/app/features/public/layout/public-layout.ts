import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-public-layout',
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
        <span class="t">Vasudha<small>Data Atlas</small></span>
      </a>
      <div class="nav-links">
        <a routerLink="/climate" routerLinkActive="active" style="--dom:var(--climate)"><span class="dot"></span>Climate</a>
        <a routerLink="/energy" routerLinkActive="active" style="--dom:var(--energy)"><span class="dot"></span>Energy</a>
        <a routerLink="/power" routerLinkActive="active" style="--dom:var(--power)"><span class="dot"></span>Power</a>
      </div>
      <span class="spacer"></span>
      <app-button variant="secondary" size="sm" routerLink="/login">Admin sign in</app-button>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styleUrl: './public-layout.css',
})
export class PublicLayout {}
