import { Component, Input } from '@angular/core';
import { Domain } from '../../../core/models/dataset.model';

const LABELS: Record<Domain, string> = {
  CLIMATE: 'Climate',
  ENERGY: 'Energy',
  POWER: 'Power',
};

/** A fixed color per domain that never changes meaning — used as a nav underline,
 *  a table tag, and the chart's series color, so it doubles as its own legend. */
@Component({
  selector: 'app-domain-tag',
  standalone: true,
  template: `<span class="dom" [class]="domain.toLowerCase()">{{ LABELS[domain] }}</span>`,
  styleUrl: './domain-tag.css',
})
export class DomainTag {
  @Input({ required: true }) domain!: Domain;
  protected readonly LABELS = LABELS;
}
