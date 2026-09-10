import { Component, Input, OnChanges } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ChartType, DatasetPayload } from '../../../../core/models/dataset.model';
import { asNumber, findColumn } from '../../../../core/utils/columns';

interface SeriesPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-time-series-chart',
  standalone: true,
  imports: [NgxChartsModule],
  template: `
    @switch (chartType) {
      @case ('BAR') {
        <ngx-charts-bar-vertical [results]="series" [xAxis]="true" [yAxis]="true" [showXAxisLabel]="true"
          [showYAxisLabel]="true" xAxisLabel="Period" yAxisLabel="Value" [showGridLines]="false" [scheme]="scheme" />
      }
      @case ('AREA') {
        <ngx-charts-area-chart [results]="chartData" [xAxis]="true" [yAxis]="true" [showXAxisLabel]="true"
          [showYAxisLabel]="true" xAxisLabel="Period" yAxisLabel="Value" [showGridLines]="false" [scheme]="scheme" />
      }
      @default {
        <ngx-charts-line-chart [results]="chartData" [xAxis]="true" [yAxis]="true" [showXAxisLabel]="true"
          [showYAxisLabel]="true" xAxisLabel="Period" yAxisLabel="Value" [showGridLines]="false" [scheme]="scheme" />
      }
    }
  `,
  styleUrl: './time-series-chart.css',
})
export class TimeSeriesChart implements OnChanges {
  @Input({ required: true }) payload!: DatasetPayload;
  @Input({ required: true }) chartType!: ChartType;
  @Input() title = 'Value';

  protected series: SeriesPoint[] = [];
  protected chartData: { name: string; series: SeriesPoint[] }[] = [];
  protected readonly scheme: Color = {
    name: 'vasudha',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#1e5a3c'],
  };

  ngOnChanges(): void {
    this.series = this.buildSeries();
    this.chartData = [{ name: this.title, series: this.series }];
  }

  private buildSeries(): SeriesPoint[] {
    if (!this.payload) {
      return [];
    }
    const timeCol = findColumn(this.payload, 'year', 'date');
    const valueCol = findColumn(this.payload, 'value');
    if (!timeCol || !valueCol) {
      return [];
    }

    return this.payload.rows
      .map((row) => ({ name: String(row[timeCol] ?? ''), value: asNumber(row[valueCol]) }))
      .filter((point): point is SeriesPoint => point.value !== null && point.name !== '')
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
