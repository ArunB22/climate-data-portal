import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminDatasetService } from '../../../core/services/admin-dataset.service';
import { ChartType, Domain } from '../../../core/models/dataset.model';
import { ErrorResponse } from '../../../core/models/auth.model';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { Field } from '../../../shared/ui/field/field';
import { RadioCard } from '../../../shared/ui/radio-card/radio-card';

type ChartCategory = 'LATLONG_MAP' | 'STATE_HEATMAP' | 'TIME_SERIES';

const CSV_SPECS: Record<ChartCategory, { columns: string; example: string }> = {
  LATLONG_MAP: { columns: 'latitude,longitude,value', example: '26.9157,70.9083,120\n23.7337,69.8597,85' },
  STATE_HEATMAP: { columns: 'state,value', example: 'Rajasthan,24500\nGujarat,21800' },
  TIME_SERIES: { columns: 'year,value', example: '2019,25.1\n2020,25.4' },
};

@Component({
  selector: 'app-add-dataset',
  standalone: true,
  imports: [ReactiveFormsModule, Button, Card, Field, RadioCard],
  template: `
    <div class="app-main">
      <div class="page-head">
        <div>
          <span class="eyebrow">Add a dataset</span>
          <h1>Submit a new dataset</h1>
          <p class="sub">Submitted datasets go to the Super Admin for review before they appear publicly.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-layout">
        <app-card class="form-card">
          <div class="fieldset">
            <div class="lg">Domain<span>Where it appears on the atlas</span></div>
            <div class="radio-cards">
              <app-radio-card
                title="Climate"
                [selected]="form.value.domain === 'CLIMATE'"
                (click)="form.patchValue({ domain: 'CLIMATE' })"
              />
              <app-radio-card
                title="Energy"
                [selected]="form.value.domain === 'ENERGY'"
                (click)="form.patchValue({ domain: 'ENERGY' })"
              />
              <app-radio-card
                title="Power"
                [selected]="form.value.domain === 'POWER'"
                (click)="form.patchValue({ domain: 'POWER' })"
              />
            </div>
          </div>

          <div class="fieldset">
            <div class="lg">Chart type<span>Decides which columns the CSV must have</span></div>
            <div class="radio-cards">
              <app-radio-card
                title="Lat / Long map"
                description="Points plotted on an India map"
                columns="latitude, longitude, value"
                [selected]="form.value.chartCategory === 'LATLONG_MAP'"
                (click)="form.patchValue({ chartCategory: 'LATLONG_MAP' })"
              />
              <app-radio-card
                title="State heatmap"
                description="One value per state or UT, shaded"
                columns="state, value"
                [selected]="form.value.chartCategory === 'STATE_HEATMAP'"
                (click)="form.patchValue({ chartCategory: 'STATE_HEATMAP' })"
              />
              <app-radio-card
                title="Time series"
                description="Values over dates or years"
                columns="year, value"
                [selected]="form.value.chartCategory === 'TIME_SERIES'"
                (click)="form.patchValue({ chartCategory: 'TIME_SERIES' })"
              />
            </div>
            @if (form.value.chartCategory === 'TIME_SERIES') {
              <div class="sub-opt">
                <span class="lab">Draw the series as</span>
                <div class="seg">
                  <div [class.on]="form.value.timeSeriesType === 'LINE'" (click)="form.patchValue({ timeSeriesType: 'LINE' })">Line</div>
                  <div [class.on]="form.value.timeSeriesType === 'BAR'" (click)="form.patchValue({ timeSeriesType: 'BAR' })">Bar</div>
                  <div [class.on]="form.value.timeSeriesType === 'AREA'" (click)="form.patchValue({ timeSeriesType: 'AREA' })">Area</div>
                </div>
              </div>
            }
          </div>

          <div class="fieldset">
            <app-field label="Title" hint="as it will appear on the public chart">
              <input class="input" type="text" formControlName="title" placeholder="e.g. Renewable Energy Capacity – State Wise" />
            </app-field>
          </div>

          <div class="fieldset">
            <app-field label="CSV file">
              <div class="drop">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                </svg>
                <b>Choose a CSV file</b>
                <span>UTF-8 · header row required · columns <span class="mono">{{ CSV_SPECS[form.value.chartCategory!].columns }}</span></span>
                <input type="file" accept=".csv" (change)="onFileSelected($event)" style="margin-top:10px" />
                @if (selectedFile()) {
                  <div class="chosen"><i></i>{{ selectedFile()!.name }}</div>
                }
              </div>
            </app-field>
          </div>

          @if (errorMessage()) {
            <p class="error">{{ errorMessage() }}</p>
          }
          @if (fieldErrors().length > 0) {
            <ul class="field-errors">
              @for (err of fieldErrors(); track err) {
                <li>{{ err }}</li>
              }
            </ul>
          }

          <div class="form-actions">
            <span class="hint-text">You can edit the title and file while the dataset is pending.</span>
            <app-button type="submit" variant="primary" [disabled]="form.invalid || !selectedFile() || submitting()">
              {{ submitting() ? 'Uploading...' : 'Submit for review' }}
            </app-button>
          </div>
        </app-card>

        <aside class="side">
          <app-card class="pad">
            <h3>What the CSV should look like</h3>
            <p>Columns: <b class="mono">{{ CSV_SPECS[form.value.chartCategory!].columns }}</b></p>
            <div class="csvspec">{{ CSV_SPECS[form.value.chartCategory!].columns }}<br />{{ CSV_SPECS[form.value.chartCategory!].example }}</div>
          </app-card>
          <app-card class="pad">
            <h3>Before you submit</h3>
            <ul class="check-list">
              <li>The title names the unit or scope clearly</li>
              <li>No merged cells, footnotes or totals rows</li>
              <li>State names match India's official state/UT names</li>
            </ul>
          </app-card>
        </aside>
      </form>
    </div>
  `,
  styleUrl: './add-dataset.css',
})
export class AddDataset {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    domain: ['CLIMATE' as Domain, Validators.required],
    title: ['', Validators.required],
    chartCategory: ['LATLONG_MAP' as ChartCategory, Validators.required],
    timeSeriesType: ['LINE' as ChartType, Validators.required],
  });
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly fieldErrors = signal<string[]>([]);
  protected readonly CSV_SPECS = CSV_SPECS;

  constructor(
    private readonly adminDatasetService: AdminDatasetService,
    private readonly router: Router,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  submit(): void {
    const file = this.selectedFile();
    if (this.form.invalid || !file) {
      return;
    }

    const { domain, title, chartCategory, timeSeriesType } = this.form.getRawValue();
    const chartType: ChartType = chartCategory === 'TIME_SERIES' ? timeSeriesType : chartCategory;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set([]);

    this.adminDatasetService.create({ domain, title, chartType, file }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        if (error instanceof HttpErrorResponse) {
          const body = error.error as ErrorResponse | undefined;
          this.errorMessage.set(body?.message ?? 'Something went wrong. Please try again.');
          this.fieldErrors.set(body?.fieldErrors ?? []);
        } else {
          this.errorMessage.set('Something went wrong. Please try again.');
        }
      },
    });
  }
}
