import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The one button in the app. Renders a native <button>, or an <a routerLink>
 * when [routerLink] is set — both look identical, so a "+ Add dataset" nav
 * link and a "Save" submit button are the same component.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (routerLink) {
      <a [routerLink]="routerLink" class="btn {{ variant }} {{ size }}" [class.disabled]="disabled">
        <ng-content />
      </a>
    } @else {
      <button [type]="type" [disabled]="disabled" class="btn {{ variant }} {{ size }}">
        <ng-content />
      </button>
    }
  `,
  styleUrl: './button.css',
})
export class Button {
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() routerLink?: string | unknown[];
}
