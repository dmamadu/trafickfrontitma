import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";

import { AuthenticationService } from "../services/auth.service";
import { Router } from "@angular/router";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private excludedRoutes = [
    "/home",
    "/auth/register",
    "auth/reset-password",
    "auth/login",
    "/auth/refresh-token",
  ];

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const shouldExclude = this.excludedRoutes.some((route) =>
      req.url.includes(route)
    );

    if (shouldExclude) {
      return next.handle(req);
    }

    const token = localStorage.getItem("token");
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.authenticationService.logout();
          this.router.navigate(["/auth/login"]);
        }
        return throwError(() => err);
      })
    );
  }
}
