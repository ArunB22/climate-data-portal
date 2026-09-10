import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1>Page not found</h1>
      <a routerLink="/">Back to the homepage</a>
    </div>
  `,
  styleUrl: './not-found.css',
})
export class NotFound {}
