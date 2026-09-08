import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminAccountDto } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class SuperAdminAccountService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<AdminAccountDto[]> {
    return this.http.get<AdminAccountDto[]>(`${environment.apiBaseUrl}/superadmin/admins`);
  }

  create(email: string, password: string): Observable<AdminAccountDto> {
    return this.http.post<AdminAccountDto>(`${environment.apiBaseUrl}/superadmin/admins`, { email, password });
  }

  setEnabled(id: string, enabled: boolean): Observable<AdminAccountDto> {
    const params = new HttpParams().set('enabled', enabled);
    return this.http.patch<AdminAccountDto>(`${environment.apiBaseUrl}/superadmin/admins/${id}`, {}, { params });
  }
}
