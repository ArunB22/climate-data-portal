import { Component, Input } from '@angular/core';

/** A toggle-style filter pill. Purely presentational — the parent owns the on/off state. */
@Component({
  selector: 'app-chip',
  standalone: true,
  template: `
    <button type="button" class="chip" [class.on]="on">
      <ng-content />
    </button>
  `,
  styleUrl: './chip.css',
})
export class Chip {
  @Input() on = false;
}
