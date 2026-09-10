import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SuperAdminDatasetService } from '../../../core/services/super-admin-dataset.service';
import { ChartType, DatasetStatus, Domain, SuperAdminDatasetDto } from '../../../core/models/dataset.model';
import { ErrorResponse } from '../../../core/models/auth.model';
import { Modal } from '../../shared/modal/modal';
import { DatasetChart } from '../../public/charts/dataset-chart/dataset-chart';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { DomainTag } from '../../../shared/ui/domain-tag/domain-tag';
import { Field } from '../../../shared/ui/field/field';
import { IconButton } from '../../../shared/ui/icon-button/icon-button';
import { RadioCard } from '../../../shared/ui/radio-card/radio-card';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';

type ChartCategory = 'LATLONG_MAP' | 'STATE_HEATMAP' | 'TIME_SERIES';
type Tab = DatasetStatus | 'ALL';

const TIME_SERIES_TYPES: ChartType[] = ['LINE', 'BAR', 'AREA'];

function categoryOf(chartType: ChartType): ChartCategory {
  return TIME_SERIES_TYPES.includes(chartType) ? 'TIME_SERIES' : (chartType as ChartCategory);
}

@Component({
  selector: 'app-superadmin-datasets',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, Modal, DatasetChart, Button, Card, DomainTag, Field, IconButton, RadioCard, StatusBadge],
  template: `
    <div class="app-main">
      <div class="page-head">
        <div>
          <span class="eyebrow">Review</span>
          <h1>Datasets awaiting review</h1>
          <p class="sub">Approving publishes immediately to the public atlas. Rejecting keeps the dataset with its Admin.</p>
        </div>
      </div>

      <div class="tabs">
        @for (t of tabs; track t) {
          <div [class.on]="activeTab() === t" (click)="activeTab.set(t)">
            {{ tabLabel(t) }} <span class="cnt">{{ countFor(t) }}</span>
          </div>
        }
      </div>

      @if (filtered().length === 0) {
        <p class="empty">No datasets in this view.</p>
      } @else {
        <app-card>
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:32%">Title</th>
                  <th>Domain</th>
                  <th>Chart type</th>
                  <th>Submitted by</th>
                  <th>Status</th>
                  <th class="num">Added</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (dataset of filtered(); track dataset.id) {
                  <tr>
                    <td><div class="title">{{ dataset.title }}</div></td>
                    <td><app-domain-tag [domain]="dataset.domain" /></td>
                    <td>{{ dataset.chartType }}</td>
                    <td>{{ dataset.submittedByEmail }}</td>
                    <td><app-status-badge [status]="dataset.status" /></td>
                    <td class="num">{{ dataset.createdAt | date: 'mediumDate' }}</td>
                    <td>
                      <div class="actions">
                        <app-button variant="secondary" size="sm" (click)="openPreview(dataset)">Preview</app-button>
                        @if (dataset.status === 'PENDING') {
                          <app-button variant="primary" size="sm" (click)="approve(dataset.id)">Approve</app-button>
                          <app-button variant="danger" size="sm" (click)="reject(dataset.id)">Reject</app-button>
                        }
                        <app-icon-button label="Edit" (click)="openEdit(dataset)">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 2l3 3-8 8H3v-3z" /></svg>
                        </app-icon-button>
                        <app-icon-button label="Delete" [danger]="true" (click)="delete(dataset.id)">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path d="M3 5h10M6 5V3h4v2M5 5l.7 8h4.6L11 5" />
                          </svg>
                        </app-icon-button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }
    </div>

    <!-- Preview: exactly what the public site will render, so approving means you've actually seen it plot correctly. -->
    <app-modal [open]="previewing() !== null" maxWidth="680px" (closed)="previewing.set(null)">
      @if (previewing()) {
        <app-dataset-chart [dataset]="previewing()!" />
        <div class="preview-meta">
          Submitted by {{ previewing()!.submittedByEmail }} · Status: {{ previewing()!.status }}
        </div>
        @if (previewing()!.status === 'PENDING') {
          <div class="preview-actions">
            <app-button variant="primary" (click)="approve(previewing()!.id); previewing.set(null)">Approve</app-button>
            <app-button variant="danger" (click)="reject(previewing()!.id); previewing.set(null)">Reject</app-button>
          </div>
        }
      }
    </app-modal>

    <!-- Edit: a proper dialog instead of an inline accordion row. -->
    <app-modal [open]="editingId() !== null" maxWidth="560px" (closed)="editingId.set(null)">
      <h2>Edit dataset</h2>
      <form [formGroup]="editForm" (ngSubmit)="submitEdit(editingId()!)">
        <app-field label="Title">
          <input class="input" type="text" formControlName="title" />
        </app-field>
        <app-field label="Domain">
          <select class="input" formControlName="domain">
            <option value="CLIMATE">Climate</option>
            <option value="ENERGY">Energy</option>
            <option value="POWER">Power</option>
          </select>
        </app-field>

        <div class="lg">Chart type</div>
        <div class="radio-cards">
          <app-radio-card title="Lat / Long map" [selected]="editForm.value.chartCategory === 'LATLONG_MAP'" (click)="editForm.patchValue({ chartCategory: 'LATLONG_MAP' })" />
          <app-radio-card title="State heatmap" [selected]="editForm.value.chartCategory === 'STATE_HEATMAP'" (click)="editForm.patchValue({ chartCategory: 'STATE_HEATMAP' })" />
          <app-radio-card title="Time series" [selected]="editForm.value.chartCategory === 'TIME_SERIES'" (click)="editForm.patchValue({ chartCategory: 'TIME_SERIES' })" />
        </div>

        @if (editForm.value.chartCategory === 'TIME_SERIES') {
          <div class="seg">
            <div [class.on]="editForm.value.timeSeriesType === 'LINE'" (click)="editForm.patchValue({ timeSeriesType: 'LINE' })">Line</div>
            <div [class.on]="editForm.value.timeSeriesType === 'BAR'" (click)="editForm.patchValue({ timeSeriesType: 'BAR' })">Bar</div>
            <div [class.on]="editForm.value.timeSeriesType === 'AREA'" (click)="editForm.patchValue({ timeSeriesType: 'AREA' })">Area</div>
          </div>
        }

        <app-field label="Replace CSV" hint="optional">
          <input type="file" accept=".csv" (change)="onEditFileSelected($event)" />
        </app-field>

        @if (editForm.value.chartCategory !== originalCategory() && !editFile()) {
          <p class="hint">Changing chart type requires uploading a matching CSV.</p>
        }
        @if (editError()) {
          <p class="error">{{ editError() }}</p>
        }
        @if (editFieldErrors().length > 0) {
          <ul class="field-errors">
            @for (err of editFieldErrors(); track err) {
              <li>{{ err }}</li>
            }
          </ul>
        }

        <app-button
          type="submit"
          variant="primary"
          [disabled]="editForm.invalid || editSubmitting() || (editForm.value.chartCategory !== originalCategory() && !editFile())"
        >
          {{ editSubmitting() ? 'Saving...' : 'Save changes' }}
        </app-button>
      </form>
    </app-modal>
  `,
  styleUrl: './superadmin-datasets.css',
})
export class SuperAdminDatasets implements OnInit {
  private readonly fb = inject(FormBuilder);

  protected readonly tabs: Tab[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];
  protected readonly activeTab = signal<Tab>('PENDING');
  protected readonly datasets = signal<SuperAdminDatasetDto[]>([]);
  protected readonly filtered = computed(() => {
    const tab = this.activeTab();
    return tab === 'ALL' ? this.datasets() : this.datasets().filter((d) => d.status === tab);
  });

  protected readonly previewing = signal<SuperAdminDatasetDto | null>(null);

  protected readonly editingId = signal<string | null>(null);
  protected readonly originalCategory = signal<ChartCategory | null>(null);
  protected readonly editFile = signal<File | null>(null);
  protected readonly editSubmitting = signal(false);
  protected readonly editError = signal<string | null>(null);
  protected readonly editFieldErrors = signal<string[]>([]);

  protected readonly editForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    domain: ['CLIMATE' as Domain, Validators.required],
    chartCategory: ['LATLONG_MAP' as ChartCategory, Validators.required],
    timeSeriesType: ['LINE' as ChartType, Validators.required],
  });

  constructor(private readonly service: SuperAdminDatasetService) {}

  ngOnInit(): void {
    this.load();
  }

  tabLabel(tab: Tab): string {
    return tab === 'PENDING' ? 'Pending' : tab === 'APPROVED' ? 'Approved' : tab === 'REJECTED' ? 'Rejected' : 'All';
  }

  countFor(tab: Tab): number {
    return tab === 'ALL' ? this.datasets().length : this.datasets().filter((d) => d.status === tab).length;
  }

  openPreview(dataset: SuperAdminDatasetDto): void {
    this.previewing.set(dataset);
  }

  approve(id: string): void {
    this.service.approve(id).subscribe(() => this.load());
  }

  reject(id: string): void {
    this.service.reject(id).subscribe(() => this.load());
  }

  delete(id: string): void {
    if (!confirm('Delete this dataset permanently? This cannot be undone.')) {
      return;
    }
    this.service.delete(id).subscribe(() => this.load());
  }

  openEdit(dataset: SuperAdminDatasetDto): void {
    const category = categoryOf(dataset.chartType);
    this.originalCategory.set(category);
    this.editFile.set(null);
    this.editError.set(null);
    this.editFieldErrors.set([]);
    this.editForm.setValue({
      title: dataset.title,
      domain: dataset.domain,
      chartCategory: category,
      timeSeriesType: category === 'TIME_SERIES' ? dataset.chartType : 'LINE',
    });
    this.editingId.set(dataset.id);
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editFile.set(input.files?.[0] ?? null);
  }

  submitEdit(id: string): void {
    if (this.editForm.invalid) {
      return;
    }
    const { title, domain, chartCategory, timeSeriesType } = this.editForm.getRawValue();
    const chartType: ChartType = chartCategory === 'TIME_SERIES' ? timeSeriesType : chartCategory;

    this.editSubmitting.set(true);
    this.editError.set(null);
    this.editFieldErrors.set([]);

    this.service.edit(id, { domain, chartType, title, file: this.editFile() ?? undefined }).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.editingId.set(null);
        this.load();
      },
      error: (error: unknown) => {
        this.editSubmitting.set(false);
        if (error instanceof HttpErrorResponse) {
          const body = error.error as ErrorResponse | undefined;
          this.editError.set(body?.message ?? 'Could not save changes.');
          this.editFieldErrors.set(body?.fieldErrors ?? []);
        }
      },
    });
  }

  private load(): void {
    this.service.list().subscribe((data) => this.datasets.set(data));
  }
}
