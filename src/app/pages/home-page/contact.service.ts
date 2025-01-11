import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ContactService {
  constructor(private http: HttpClient) {}
  sendContactForm(formData: any): Observable<any> {
    // const url = 'localhost:8080/mailusers';
    return this.http.post<any>(environment.apiUrl + "mailusers", formData);
  }
}
