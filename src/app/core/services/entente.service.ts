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

  getEntenteDetails(ententeId: number): Observable<any> {
    return this.http.get(`${this.url}${ententeId}/${this.apiUrl}`);
  }

  synchroniserEntente(ententeId: number): Observable<any> {
    return this.http.post(`${this.url}${this.apiUrl}/${ententeId}/synchroniser`, {});
  }

  finaliserEntente(ententeId: number): Observable<any> {
    return this.http.post(`${this.url}${this.apiUrl}/${ententeId}/finaliser`, {});
  }

  getEntentesByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/${this.apiUrl}/project/${projectId}`);
  }

}