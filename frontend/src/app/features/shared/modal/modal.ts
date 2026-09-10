import { Component, Input, Output, EventEmitter } from '@angular/core';

/** Generic overlay dialog. Content is whatever's projected inside <app-modal>...</app-modal>. */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open) {
      <div class="backdrop" (click)="closed.emit()">
        <div class="panel" [style.maxWidth]="maxWidth" (click)="$event.stopPropagation()">
          <button type="button" class="close" (click)="closed.emit()" aria-label="Close">&times;</button>
          <ng-content />
        </div>
      </div>
    }
  `,
  styleUrl: './modal.css',
})
export class Modal {
  @Input() open = false;
  @Input() maxWidth = '480px';
  @Output() closed = new EventEmitter<void>();
}
