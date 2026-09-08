import { Component, Input } from '@angular/core';

/** A small icon-only action button — used in table rows for edit/delete. */
@Component({
  selector: 'app-icon-button',
  standalone: true,
  template: `
    <button type="button" class="iconbtn" [class.danger]="danger" [attr.title]="label" [attr.aria-label]="label">
      <ng-content />
    </button>
  `,
  styleUrl: './icon-button.css',
})
export class IconButton {
  @Input() label = '';
  @Input() danger = false;
}
