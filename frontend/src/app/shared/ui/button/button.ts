import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The one button in the app. Renders a native <button>, or an <a routerLink>
 * when [routerLink] is set — both look identical, so a "+ Add dataset" nav
 * link and a "Save" submit button are the same component.
 *
 * Content is captured once via `<ng-template #content>` and projected with
 * `ngTemplateOutlet` into whichever host is active — a bare `<ng-content>`
 * repeated in both the @if and @else branches only ever renders in the
 * last one (Angular assigns the single default projection slot to it),
 * leaving the other branch's host element permanently empty.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (routerLink) {
      <a [routerLink]="routerLink" class="btn {{ variant }} {{ size }}" [class.disabled]="disabled">
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <button [type]="type" [disabled]="disabled" class="btn {{ variant }} {{ size }}">
        <ng-container [ngTemplateOutlet]="content" />
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
