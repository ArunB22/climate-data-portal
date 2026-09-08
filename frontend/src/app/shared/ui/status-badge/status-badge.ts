import { Component, Input } from '@angular/core';
import { DatasetStatus } from '../../../core/models/dataset.model';

const LABELS: Record<DatasetStatus, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/** Pending is a dashed slate, not amber — so it never collides with the Energy domain
 *  color in the same table row. Every state carries an icon and a word, never color alone. */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    @switch (status) {
      @case ('APPROVED') {
        <span class="status ok">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3 3 7-7" /></svg>
          {{ LABELS[status] }}
        </span>
      }
      @case ('REJECTED') {
        <span class="status bad">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          {{ LABELS[status] }}
        </span>
      }
      @default {
        <span class="status pending">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" />
          </svg>
          {{ LABELS[status] }}
        </span>
      }
    }
  `,
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  @Input({ required: true }) status!: DatasetStatus;
  protected readonly LABELS = LABELS;
}
