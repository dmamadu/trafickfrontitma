import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
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

  getByProject(projectId: number, page = 0, size = 20): Observable<any> {
    const params = new HttpParams()
      .set("projectId", projectId.toString())
      .set("page", page.toString())
      .set("size", size.toString());
    return this.http.get<any>(`${this.url}${BASE_URL}`, { params });
  }

  getById(id: number): Observable<Plainte> {
    return this.http.get<Plainte>(`${this.url}${BASE_URL}/${id}`);
  }

  getByStatut(projectId: number, statut: string): Observable<Plainte[]> {
    const params = new HttpParams().set("projectId", projectId.toString());
    return this.http.get<Plainte[]>(`${this.url}${BASE_URL}/statut/${statut}`, { params });
  }

  importerExcel(file: File, projectId: number): Observable<PlainteImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId.toString());
    return this.http.post<PlainteImportResult>(`${this.url}${BASE_URL}/import`, formData);
  }

  deletePlainte(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}${BASE_URL}/${id}`);
  }
}
