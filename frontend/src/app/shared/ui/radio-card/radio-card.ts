import { Component, Input } from '@angular/core';

/** A selectable option card — used for the domain and chart-type pickers.
 *  Naming the expected CSV columns right on the card teaches the upload format. */
@Component({
  selector: 'app-radio-card',
  standalone: true,
  template: `
    <button type="button" class="radio-card" [class.on]="selected">
      <span class="tick"></span>
      <div class="rc-title"><ng-content select="[icon]" />{{ title }}</div>
      @if (description) {
        <div class="rc-desc">{{ description }}</div>
      }
      @if (columns) {
        <div class="rc-cols mono">{{ columns }}</div>
      }
    </button>
  `,
  styleUrl: './radio-card.css',
})
export class RadioCard {
  @Input() selected = false;
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() columns = '';
}
