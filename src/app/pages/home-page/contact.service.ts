import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ContactService {
  constructor(private http: HttpClient) {}
  sendContactForm(formData: any): Observable<any> {
    // const url = 'localhost:8080/mailusers';
    const apiURL= "http://localhost:8081/mailusers";
    return this.http.post<any>(apiURL, formData);
  }
}
