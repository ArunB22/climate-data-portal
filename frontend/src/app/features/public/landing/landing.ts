import { Component, OnInit, signal } from '@angular/core';
import { PublicDatasetService } from '../../../core/services/public-dataset.service';
import { PublicDatasetDto } from '../../../core/models/dataset.model';
import { DatasetChart } from '../charts/dataset-chart/dataset-chart';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [DatasetChart],
  template: `
    <div class="hero">
      <span class="eyebrow" style="color:var(--brand)">Open data · Climate, Energy &amp; Power · India</span>
      <h1>India's climate and energy numbers, <em>mapped and in the open.</em></h1>
      <p>
        Datasets reviewed by Vasudha Foundation and published as interactive maps and charts you can read and
        explore — no login required.
      </p>
      <div class="counts">
        <div><b class="mono">{{ datasets().length }}</b><span>published datasets</span></div>
      </div>
    </div>
    <div class="app-main">
      <div class="sec-head">
        <h2>Recently published</h2>
      </div>
      @if (datasets().length === 0) {
        <p class="empty">No visualizations have been published yet.</p>
      } @else {
        <div class="grid">
          @for (dataset of datasets(); track dataset.id) {
            <app-dataset-chart [dataset]="dataset" />
          }
        </div>
      }
    </div>
  `,
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  protected readonly datasets = signal<PublicDatasetDto[]>([]);

  constructor(private readonly publicDatasetService: PublicDatasetService) {}

  ngOnInit(): void {
    this.publicDatasetService.landingPage().subscribe((data) => this.datasets.set(data));
  }
}
