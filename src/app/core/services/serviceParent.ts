import { HttpClient, HttpHeaders } from "@angular/common/http";
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

  list(url, max, offset): Observable<any[]> {
    return this.http.get<any[]>(this.url+ `${url}`+"?max=" + max + "&offset=" + offset);
  }

  liste(url, max, offset,categorieLibelle): Observable<any[]> {
    return this.http.get<any[]>(this.url+ `${url}`+"?max=" + max + "&offset="+offset+"&categorieLibelle="+categorieLibelle);
  }
}
