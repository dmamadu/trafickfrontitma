import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { T } from "@fullcalendar/core/internal-common";
import { number } from "echarts";
import { tap } from "lodash";
import { Observable } from "rxjs";
import { Image } from "src/app/shared/models/image.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class RootService {
  constructor(protected http: HttpClient) {}

  url: string = environment.apiUrl;

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  };

  all<T>(next: string): Observable<T> {
    return this.http.get<T>(this.url + `${next}`);
  }

  add<T>(next: string, data: any): Observable<T> {
    return this.http.post<T>(this.url + `${next}`, data);
  }
  update<T, U>(next: string, data: U): Observable<T> {
    return this.http.post<T>(this.url + `${next}`, data);
  }

  getById<T>(id: number, next: string) {
    return this.http.get<T>(this.url + `${next}/${id}`);
  }

  delete<T>(id: number, next: string): Observable<T> {
    return this.http.delete<T>(
      this.url + `${next}/` + `${id}`,
      this.httpOptions
    );
  }
  uploadImage(file: File, filename: string): Observable<Image> {
    const imageFormData = new FormData();
    imageFormData.append("image", file, filename);
    const url = `${this.url + "image/upload"}`;
    return this.http.post<Image>(url, imageFormData);
  }

  updateImage(file: File, filename: string, id: number): Observable<Image> {
    const imageFormData = new FormData();
    imageFormData.append("image", file, filename);
    const url = this.url + "image/update/" + `${id}`;
    return this.http.put<Image>(url, imageFormData);
  }

  getByCodePap<T>(url: string, codePap: string, offset: number = 0, max: number = 100): Observable<T> {
    const params = new HttpParams()
      .set('codePap', codePap)
      .set('offset', offset.toString())
      .set('max', max.toString());

    return this.http.get<T>(`${this.url}${url}/by-codePap`, { params });
  }



  getPlaintEntenteByCodePap<T>(url: string, codePap: string): Observable<T> {
    const params = new HttpParams()
      .set('codePap', codePap)
    return this.http.get<T>(`${this.url}${url}/byCodePap`, { params });
  }

  deleteMultipleByIds(endpoint: string, ids: number[]): Observable<any> {
    // Vérification si la liste est vide
    if (!ids || ids.length === 0) {
      throw new Error('La liste des IDs ne peut pas être vide');
    }
    // Pour un DELETE avec body, on utilise request()
    return this.http.request<any>(
      'DELETE',
      `${this.url}${endpoint}/batch`,
      {
        body: ids,
        headers: this.httpOptions.headers
      }
    );
  }
}
