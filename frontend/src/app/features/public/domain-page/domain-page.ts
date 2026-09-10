import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { PublicDatasetService } from '../../../core/services/public-dataset.service';
import { Domain, PublicDatasetDto } from '../../../core/models/dataset.model';
import { DatasetChart } from '../charts/dataset-chart/dataset-chart';

const DOMAIN_LABELS: Record<Domain, string> = {
  CLIMATE: 'Climate',
  ENERGY: 'Energy',
  POWER: 'Power',
};

const DOMAIN_DESCRIPTIONS: Record<Domain, string> = {
  CLIMATE: 'Temperature and rainfall series, extreme-event counts and station data, published after review.',
  ENERGY: 'Installed capacity, generation mix and renewable energy datasets by state.',
  POWER: 'Grid infrastructure, plant locations, demand and transmission datasets.',
};

@Component({
  selector: 'app-domain-page',
  standalone: true,
  imports: [DatasetChart],
  template: `
    <div class="dom-head" [style.--dom]="'var(--' + domain().toLowerCase() + ')'">
      <div>
        <div class="stripe"></div>
        <span class="eyebrow">Domain · {{ label() }}</span>
        <h1>{{ label() }}</h1>
        <p>{{ DOMAIN_DESCRIPTIONS[domain()] }}</p>
      </div>
      <div class="counts">
        <div><b class="mono">{{ datasets().length }}</b><span>datasets</span></div>
      </div>
    </div>
    <div class="app-main">
      @if (datasets().length === 0) {
        <p class="empty">No {{ label() }} visualizations have been published yet.</p>
      } @else {
        <div class="grid">
          @for (dataset of datasets(); track dataset.id) {
            <app-dataset-chart [dataset]="dataset" />
          }
        </div>
      }
    </div>
  `,
  styleUrl: './domain-page.css',
})
export class DomainPage implements OnInit {
  protected readonly datasets = signal<PublicDatasetDto[]>([]);
  protected readonly domain = signal<Domain>('CLIMATE');
  protected readonly label = signal('');
  protected readonly DOMAIN_DESCRIPTIONS = DOMAIN_DESCRIPTIONS;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly publicDatasetService: PublicDatasetService,
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap(({ domain }) => {
          this.domain.set(domain as Domain);
          this.label.set(DOMAIN_LABELS[domain as Domain]);
          return this.publicDatasetService.byDomain(domain as Domain);
        }),
      )
      .subscribe((data) => this.datasets.set(data));
  }
}
