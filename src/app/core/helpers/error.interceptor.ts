import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthenticationService } from "../services/auth.service";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    public toastr: ToastrService
  ) {}


  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          //this.toastr.error("401");
          //  this.authenticationService.logout();
         // location.reload();
        }
        if (err.status === 400) {
          // auto logout if 401 response returned from api
         // this.toastr.error( `${err.error.message}`);
          //  this.authenticationService.logout();
         // location.reload();
        }
        if (err.status === 500) {
          // auto logout if 401 response returned from api
         // this.toastr.error("Une erreur s'est produite ,veillez réessayez plus tard");
          //  this.authenticationService.logout();
         // location.reload();
        }
      //  const error = err.error.message || err.statusText;
        const error = err.error;
        return throwError(error);
      })
    );
  }
}
