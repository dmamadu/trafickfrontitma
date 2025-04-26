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
  // Liste des routes à exclure de l'ajout du token
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

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Vérifie si la route courante doit être exclue
    const shouldExclude = this.excludedRoutes.some((route) =>
      req.url.includes(route)
    );

    // Si la route est exclue, on passe la requête sans modification
    if (shouldExclude) {
      return next.handle(req);
    }

    // Vérification de l'expiration du token
    this.authenticationService.checkTokenExpiration();

    // // Récupération du token
    // const token = this.authenticationService.getToken();

    // // Clone de la requête pour ajouter le header Authorization
    // if (token) {
    //   req = req.clone({
    //     setHeaders: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   });
    // }

    return next.handle(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.authenticationService.logout();
          this.router.navigate(["/auth/login"]);
        }
        return throwError(err);
      })
    );
  }
}
