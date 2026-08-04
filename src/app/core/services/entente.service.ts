import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntenteService {
  private apiUrl = 'ententeSynchroniser';
  url: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getEntenteDetails(ententeId: number, projectId: number): Observable<any> {
    return this.http.get(`${this.url}${this.apiUrl}/${ententeId}`, { params: { projectId } });
  }

  synchroniserEntente(ententeId: number, projectId: number): Observable<any> {
    return this.http.post(`${this.url}${this.apiUrl}/${ententeId}/synchroniser`, {}, { params: { projectId } });
  }

  finaliserEntente(ententeId: number, projectId: number): Observable<any> {
    return this.http.post(`${this.url}${this.apiUrl}/${ententeId}/finaliser`, {}, { params: { projectId } });
  }

  getEntentesByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}${this.apiUrl}`, { params: { projectId } });
  }

}