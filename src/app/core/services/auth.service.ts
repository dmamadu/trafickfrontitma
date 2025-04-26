import { Injectable, inject } from "@angular/core";

import { getFirebaseBackend } from "../../authUtils";
import { Auth, User } from "src/app/store/Authentication/auth.models";
import { catchError, from, map, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { T } from "@fullcalendar/core/internal-common";
import { LocalService } from "./local.service";
import { TokenStorageService } from "./token-storage.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { Router } from "@angular/router";
@Injectable({ providedIn: "root" })
export class AuthenticationService {
  user: User;
  url: string = environment.apiUrl;

  private tokenCheckInterval: any;

  private jwtHelper = new JwtHelperService();

  private httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  };

  private http = inject(HttpClient);
  private localService = inject(LocalService);
  constructor(private _snackbar: SnackBarService, private router: Router) {}

  /**
   * Returns the current user
   */
  public currentUser(): Auth | null {
    const userJSON = localStorage.getItem("currentUser");
    if (userJSON) {
      return JSON.parse(userJSON);
    } else {
      return null;
    }
  }

  /**
   * Performs the auth
   * @param email email of user
   * @param password password of user
   */
  login(email: string, password: string): Observable<any> {
    return this.http
      .post<Auth>(
        `${this.url}users/login`,
        { email, password },
        this.httpOptions
      )
      .pipe(
        map((user: Auth) => {
          if (user?.token) {
            this.storeUserData(user);
          }
          return user;
        }),
        catchError((error) => {
          console.error("Login error:", error);
          return throwError(() => new Error(this.getErrorMessage(error)));
        })
      );
  }

  private storeUserData(user: any): void {
    try {
      localStorage.setItem("currentUser", JSON.stringify(user));
      this.localService.saveItem("token", user.token);
      this.localService.saveDataJson("user", user.user);
    } catch (e) {
      console.error("LocalStorage error:", e);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 403) {
      return "Accès refusé - Problème CORS. Contactez l'administrateur.";
    } else if (error.status === 401) {
      return "Email ou mot de passe incorrect";
    } else {
      return "Erreur de connexion au serveur";
    }
  }
  /**
   * Performs the register
   * @param email email
   * @param password password
   */

  /**
   * Reset password
   * @param email email
   */
  resetPassword(email: string) {
    return this.http.post(`${this.url}users/reset`, { email }).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  changePassword(newPassword: string, token: string) {
    return this.http
      .post(`${this.url}users/reset-password`, { newPassword, token })
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   * Logout the user
   */
  logout() {
    // logout the user
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("ProjectId");
    localStorage.clear();
  }

  /**
   * Ce service checker le token par intervalle de 30 minutes
   *
   */
  startTokenExpirationCheck() {
    this.tokenCheckInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 5 * 60 * 1000);
  }
  q;

  /**
   * Ce service savoir si le token est valide
   *
   */
  checkTokenExpiration() {
    const accessToken = localStorage.getItem("token");
    if (accessToken && this.jwtHelper.isTokenExpired(accessToken)) {
      this.handleTokenExpired();
    }
  }

  isAuthenticated(): boolean {
    const accessToken: any = localStorage.getItem("token");
    return !!(accessToken && !this.jwtHelper.isTokenExpired(accessToken));
  }

  /**
   * Fonction pour gérer l'expiration du token
   */

  private handleTokenExpired() {
    const sessionExpireTitre = "Session expirée";
    const sessionExpireDescription =
      "Votre session a expiré, veuillez vous reconnecter.";
    this._snackbar
      .showSimpleNotification(sessionExpireTitre, sessionExpireDescription)
      .then(() => {
        this.logout();
        this.router.navigate(["/auth/login"]);
      });
  }
}
