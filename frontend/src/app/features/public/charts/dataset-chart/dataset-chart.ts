import { Component, Input } from '@angular/core';
import { ChartableDataset, ChartType } from '../../../../core/models/dataset.model';
import { DomainTag } from '../../../../shared/ui/domain-tag/domain-tag';
import { LatLongMap } from '../latlong-map/latlong-map';
import { StateHeatmap } from '../state-heatmap/state-heatmap';
import { TimeSeriesChart } from '../time-series-chart/time-series-chart';

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  LATLONG_MAP: 'Lat / Long · map',
  STATE_HEATMAP: 'State-wise · heatmap',
  LINE: 'Time series · line',
  BAR: 'Time series · bar',
  AREA: 'Time series · area',
};

/** Renders whichever chart type a dataset was published with. This is the one place that
 *  needs to know all three chart types exist; every other screen just passes a dataset through. */
@Component({
  selector: 'app-dataset-chart',
  standalone: true,
  imports: [DomainTag, LatLongMap, StateHeatmap, TimeSeriesChart],
  template: `
    <article class="card chart-card">
      <div class="head">
        <app-domain-tag [domain]="dataset.domain" />
        <h3>{{ dataset.title }}</h3>
        <div class="meta"><span>{{ CHART_TYPE_LABELS[dataset.chartType] }}</span></div>
      </div>
      <figure>
        @switch (dataset.chartType) {
          @case ('LATLONG_MAP') {
            <app-latlong-map [payload]="dataset.payload" />
          }
          @case ('STATE_HEATMAP') {
            <app-state-heatmap [payload]="dataset.payload" />
          }
          @default {
            <app-time-series-chart [payload]="dataset.payload" [chartType]="dataset.chartType" [title]="dataset.title" />
          }
        }
      </figure>
    </article>
  `,
  styleUrl: './dataset-chart.css',
})
export class DatasetChart {
  @Input({ required: true }) dataset!: ChartableDataset;
  protected readonly CHART_TYPE_LABELS = CHART_TYPE_LABELS;
}
