import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { number } from "echarts";
import { tap } from "lodash";
import { BehaviorSubject, Observable } from "rxjs";
import { Image } from "src/app/shared/models/image.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ServiceParent implements Resolve<any> {
  constructor(protected http: HttpClient) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    throw new Error("Method not implemented.");
  }

  url: string = environment.apiUrl;

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  };

  private _modelLists: BehaviorSubject<any[] | null> = new BehaviorSubject(
    null
  );

  get modelLists$(): Observable<any[]> {
    return this._modelLists.asObservable();
  }

  // list(url, max, offset): Observable<any[]> {
  //   return this.http.get<any[]>(this.url+ `${url}`+"?max=" + max + "&offset=" + offset);
  // }

  list(
    url: string,
    max: number,
    offset: number,
    projectId?: number
  ): Observable<any[]> {
    let params = new HttpParams()
      .set("max", max.toString())
      .set("offset", offset.toString());
    if (projectId != undefined && projectId != null) {
      params = params.set("projectId", projectId.toString());
    }
    return this.http.get<any[]>(`${this.url}${url}`, { params });
  }

  searchGlobal(
    url: string,
    searchTerm: string,
    projectId?: number,
    max: number = 100,
    offset: number = 0,
  ): Observable<any[]> {
    let params = new HttpParams()
      .set("searchTerm", searchTerm)
      .set("offset", offset.toString())
      .set("max", max.toString());

    if (projectId != null) {
      params = params.set("projectId", projectId.toString());
    }
    const fullUrl = `${this.url}${url+"/search"}`;

    return this.http.get<any[]>(fullUrl, { params });
  }

  liste(url, max, offset, categorieLibelle): Observable<any[]> {
    return this.http.get<any[]>(
      this.url +
        `${url}` +
        "?max=" +
        max +
        "&offset=" +
        offset +
        "&categorieLibelle=" +
        categorieLibelle
    );
  }

  listeByProject(url, max, offset, projectId): Observable<any[]> {
    return this.http.get<any[]>(
      this.url +
        `${url}` +
        "?max=" +
        max +
        "&offset=" +
        offset +
        "&projectId=" +
        projectId
    );
  }
}
