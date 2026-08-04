import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { Plainte, PlainteImportResult } from "./plainte.model";

const BASE_URL = "plaintes";

@Injectable({
  providedIn: "root",
})
export class PlainteService extends ServiceParent {
  constructor(http: HttpClient) {
    super(http);
  }

  getByProject(projectId: number, offset = 0, max = 20): Observable<any> {
    const params = new HttpParams()
      .set("projectId", projectId.toString())
      .set("offset", offset.toString())
      .set("max", max.toString());
    return this.http.get<any>(`${this.url}${BASE_URL}`, { params });
  }

  getById(id: number, projectId: number): Observable<Plainte> {
    const params = new HttpParams().set("projectId", projectId.toString());
    return this.http.get<Plainte>(`${this.url}${BASE_URL}/${id}`, { params });
  }

  getByStatut(projectId: number, statut: string): Observable<Plainte[]> {
    const params = new HttpParams().set("projectId", projectId.toString());
    return this.http.get<Plainte[]>(`${this.url}${BASE_URL}/statut/${statut}`, { params });
  }

  importerExcel(file: File, projectId: number): Observable<PlainteImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId.toString());
    return this.http.post<any>(`${this.url}${BASE_URL}/import`, formData).pipe(
      map((resp: any) => resp?.data?.[0] ?? resp)
    );
  }

  deletePlainte(id: number, projectId: number): Observable<any> {
    const params = new HttpParams().set("projectId", projectId.toString());
    return this.http.delete<any>(`${this.url}${BASE_URL}/${id}`, { params });
  }

  deleteMultipleByIds(ids: number[]): Observable<any> {
    if (!ids || ids.length === 0) {
      throw new Error('La liste des IDs ne peut pas être vide');
    }
    return this.http.request<any>('DELETE', `${this.url}${BASE_URL}/batch`, {
      body: ids,
      headers: this.httpOptions.headers,
    });
  }
}
