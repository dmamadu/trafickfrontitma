import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ServiceParent } from "src/app/core/services/serviceParent";

const BASE_URL = "audit";

@Injectable({
  providedIn: "root",
})
export class AuditService extends ServiceParent {
  constructor(http: HttpClient) {
    super(http);
  }

  search(offset = 0, max = 20, typeAction?: string, utilisateur?: string): Observable<any> {
    let params = new HttpParams()
      .set("offset", offset.toString())
      .set("max", max.toString());
    if (typeAction) params = params.set("typeAction", typeAction);
    if (utilisateur) params = params.set("utilisateur", utilisateur);
    return this.http.get<any>(`${this.url}${BASE_URL}`, { params });
  }
}
