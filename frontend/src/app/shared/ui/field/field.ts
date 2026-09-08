import { Component, Input } from '@angular/core';

/**
 * Label + hint + error wrapper. The actual control (an <input class="input">
 * or <select class="input">) is projected in — see styles/forms.css for why
 * the control's own styling lives globally instead of in this component.
 */
@Component({
  selector: 'app-field',
  standalone: true,
  template: `
    <div class="field">
      <label>
        {{ label }}
        @if (hint) {
          <span>{{ hint }}</span>
        }
      </label>
      <ng-content />
      @if (error) {
        <span class="err">{{ error }}</span>
      }
    </div>
  `,
})
export class Field {
  @Input({ required: true }) label!: string;
  @Input() hint = '';
  @Input() error: string | null = null;
}
