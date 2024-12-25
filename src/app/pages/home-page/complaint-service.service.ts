import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ComplaintServiceService {
  private apiUrl = "localhost:8081/complaints";
  constructor(private http: HttpClient) {}
  submitComplaint(complaintData: any): Observable<any> {
    return this.http.post<any>(environment.apiURL+'complaints', complaintData);
  }
}
