import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChartType, Domain, SuperAdminDatasetDto } from '../models/dataset.model';

export interface EditDatasetRequest {
  domain: Domain;
  chartType: ChartType;
  title: string;
  file?: File;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminDatasetService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<SuperAdminDatasetDto[]> {
    return this.http.get<SuperAdminDatasetDto[]>(`${environment.apiBaseUrl}/superadmin/datasets`);
  }

  approve(id: string): Observable<SuperAdminDatasetDto> {
    return this.http.post<SuperAdminDatasetDto>(`${environment.apiBaseUrl}/superadmin/datasets/${id}/approve`, {});
  }

  reject(id: string): Observable<SuperAdminDatasetDto> {
    return this.http.post<SuperAdminDatasetDto>(`${environment.apiBaseUrl}/superadmin/datasets/${id}/reject`, {});
  }

  edit(id: string, request: EditDatasetRequest): Observable<SuperAdminDatasetDto> {
    const formData = new FormData();
    formData.set('domain', request.domain);
    formData.set('chartType', request.chartType);
    formData.set('title', request.title);
    if (request.file) {
      formData.set('file', request.file);
    }
    return this.http.put<SuperAdminDatasetDto>(`${environment.apiBaseUrl}/superadmin/datasets/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/superadmin/datasets/${id}`);
  }
}
