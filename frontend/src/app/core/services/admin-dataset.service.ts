import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDatasetDto, ChartType, Domain } from '../models/dataset.model';

export interface CreateDatasetRequest {
  domain: Domain;
  chartType: ChartType;
  title: string;
  file: File;
}

@Injectable({ providedIn: 'root' })
export class AdminDatasetService {
  constructor(private readonly http: HttpClient) {}

  myDatasets(): Observable<AdminDatasetDto[]> {
    return this.http.get<AdminDatasetDto[]>(`${environment.apiBaseUrl}/admin/datasets`);
  }

  create(request: CreateDatasetRequest): Observable<AdminDatasetDto> {
    const formData = new FormData();
    formData.set('domain', request.domain);
    formData.set('chartType', request.chartType);
    formData.set('title', request.title);
    formData.set('file', request.file);
    return this.http.post<AdminDatasetDto>(`${environment.apiBaseUrl}/admin/datasets`, formData);
  }
}
