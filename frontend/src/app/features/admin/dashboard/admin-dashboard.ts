import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminDatasetService } from '../../../core/services/admin-dataset.service';
import { AdminDatasetDto } from '../../../core/models/dataset.model';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { DomainTag } from '../../../shared/ui/domain-tag/domain-tag';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, Button, Card, DomainTag, StatusBadge],
  template: `
    <div class="app-main">
      <div class="page-head">
        <div>
          <span class="eyebrow">Welcome back</span>
          <h1>Your datasets</h1>
          <p class="sub">Everything you've uploaded, and where it stands with review. Approved datasets are live on the public atlas.</p>
        </div>
        <app-button variant="primary" size="lg" routerLink="/admin/add">+ Add dataset</app-button>
      </div>

      <div class="tiles">
        <div class="tile"><span class="eyebrow">Uploaded</span><div class="v mono">{{ datasets().length }}</div></div>
        <div class="tile"><span class="eyebrow">Approved · live</span><div class="v mono">{{ approvedCount() }}</div></div>
        <div class="tile hl"><span class="eyebrow">Pending review</span><div class="v mono">{{ pendingCount() }}</div></div>
        <div class="tile"><span class="eyebrow">Rejected</span><div class="v mono">{{ rejectedCount() }}</div></div>
      </div>

      @if (datasets().length === 0) {
        <p class="empty">You haven't added any datasets yet.</p>
      } @else {
        <app-card>
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Domain</th>
                  <th>Chart type</th>
                  <th>Status</th>
                  <th class="num">Added</th>
                </tr>
              </thead>
              <tbody>
                @for (dataset of datasets(); track dataset.id) {
                  <tr>
                    <td><div class="title">{{ dataset.title }}</div></td>
                    <td><app-domain-tag [domain]="dataset.domain" /></td>
                    <td>{{ dataset.chartType }}</td>
                    <td><app-status-badge [status]="dataset.status" /></td>
                    <td class="num">{{ dataset.createdAt | date: 'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }
    </div>
  `,
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  protected readonly datasets = signal<AdminDatasetDto[]>([]);
  protected readonly approvedCount = computed(() => this.datasets().filter((d) => d.status === 'APPROVED').length);
  protected readonly pendingCount = computed(() => this.datasets().filter((d) => d.status === 'PENDING').length);
  protected readonly rejectedCount = computed(() => this.datasets().filter((d) => d.status === 'REJECTED').length);

  constructor(private readonly adminDatasetService: AdminDatasetService) {}

  ngOnInit(): void {
    this.adminDatasetService.myDatasets().subscribe((data) => this.datasets.set(data));
  }
}
