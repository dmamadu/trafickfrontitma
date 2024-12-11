import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ComplaintServiceService {
  private apiUrl = "localhost:8081/complaints";
  constructor(private http: HttpClient) {}
  submitComplaint(complaintData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, complaintData);
  }
}
