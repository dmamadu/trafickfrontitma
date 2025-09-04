import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootService } from './root.service';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ModificationEntenteService extends RootService {
   private apiUrl = 'ententeSynchroniser';
  url: string = environment.apiUrl;


  modifierValeurs(modificationDTO: any,id: number): Observable<any> {
    return this.http.patch(`${this.url}${this.apiUrl}/${id}/edit-ententes`, modificationDTO);
  }

  modifierPapSource(modificationDTO: any): Observable<any> {
    return this.http.post(`${this.url}${this.apiUrl}/pap-source`, modificationDTO);
  }

  getHistoriqueModifications(ententeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}${this.apiUrl}/${ententeId}/historique`);
  }
}