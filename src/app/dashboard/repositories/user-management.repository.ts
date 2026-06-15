import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserManagementRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/auth`;

    updateProfile(body: any): Observable<any> {
        return this.http.put(`${this.BASE}/user/`, body);
    }

    listAll(): Observable<any> {
        return this.http.get(`${this.BASE}/users/all/`);
    }

    list(page = 1, email?: string): Observable<any> {
        let params = new HttpParams().set('page', page);
        if (email) params = params.set('email', email);
        return this.http.get(`${this.BASE}/users-list/`, { params });
    }

    create(body: any): Observable<any> {
        return this.http.post(`${this.BASE}/users-list/`, body);
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.BASE}/users-list/${id}/`);
    }

    update(id: number, body: any): Observable<any> {
        return this.http.put(`${this.BASE}/users-list/${id}/`, body);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.BASE}/users-list/${id}/`);
    }

    getByRole(role: string): Observable<any> {
        return this.http.get(`${this.BASE}/users/role/${role}/`);
    }
}
