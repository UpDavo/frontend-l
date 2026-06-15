import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/auth`;

    list(page = 1, search = ''): Observable<any> {
        let params = new HttpParams().set('page', page);
        if (search) params = params.set('search', search);
        return this.http.get(`${this.BASE}/roles/`, { params });
    }

    listAll(): Observable<any> {
        return this.http.get(`${this.BASE}/roles-all/`);
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.BASE}/roles/${id}/`);
    }

    create(body: any): Observable<any> {
        return this.http.post(`${this.BASE}/roles/`, body);
    }

    update(id: number, body: any): Observable<any> {
        return this.http.put(`${this.BASE}/roles/${id}/`, body);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.BASE}/roles/${id}/`);
    }

    listPermissions(page = 1, search = ''): Observable<any> {
        let params = new HttpParams().set('page', page);
        if (search) params = params.set('search', search);
        return this.http.get(`${this.BASE}/permissions/`, { params });
    }

    listAllPermissions(): Observable<any> {
        return this.http.get(`${this.BASE}/permissions-all/`);
    }

    createPermission(body: any): Observable<any> {
        return this.http.post(`${this.BASE}/permissions/`, body);
    }

    updatePermission(id: number, body: any): Observable<any> {
        return this.http.put(`${this.BASE}/permissions/${id}/`, body);
    }

    deletePermission(id: number): Observable<any> {
        return this.http.delete(`${this.BASE}/permissions/${id}/`);
    }
}
