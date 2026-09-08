import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Domain, PublicDatasetDto } from '../models/dataset.model';

@Injectable({ providedIn: 'root' })
export class PublicDatasetService {
  constructor(private readonly http: HttpClient) {}

  landingPage(): Observable<PublicDatasetDto[]> {
    return this.http.get<PublicDatasetDto[]>(`${environment.apiBaseUrl}/public/datasets`);
  }

  byDomain(domain: Domain): Observable<PublicDatasetDto[]> {
    return this.http.get<PublicDatasetDto[]>(`${environment.apiBaseUrl}/public/datasets/domain/${domain}`);
  }
}
