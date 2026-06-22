import { Injectable, inject, OnDestroy } from "@angular/core";
import { Auth, User } from "src/app/store/Authentication/auth.models";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalService } from "./local.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuthenticationService implements OnDestroy {
  user: User;
  url: string = environment.apiUrl;

  private tokenCheckInterval: ReturnType<typeof setInterval>;
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

  ngOnDestroy(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  public currentUser(): Auth | null {
    const userJSON = localStorage.getItem("currentUser");
    return userJSON ? JSON.parse(userJSON) : null;
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<Auth>(`${this.url}users/login`, { email, password }, this.httpOptions)
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
      localStorage.setItem("token", user.token);
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
    }
    return "Erreur de connexion au serveur";
  }

  resetPassword(email: string) {
    return this.http.post(`${this.url}users/reset`, { email }).pipe(
      map((response: any) => response)
    );
  }

  changePassword(newPassword: string, token: string) {
    return this.http
      .post(`${this.url}users/reset-password`, { newPassword, token })
      .pipe(map((response: any) => response));
  }

  changementDuPassword(newPassword: any) {
    return this.http
      .post(`${this.url}users/change-password`, newPassword)
      .pipe(map((response: any) => response));
  }

  logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("ProjectId");
  }

  startTokenExpirationCheck() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    this.tokenCheckInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 5 * 60 * 1000);
  }

  // Appelé par le check périodique uniquement (session active) → affiche le modal
  checkTokenExpiration() {
    const accessToken = localStorage.getItem("token");
    if (accessToken && this.jwtHelper.isTokenExpired(accessToken)) {
      this.handleTokenExpired();
    }
  }

  // Appelé par AuthGuard → silencieux, pas de modal (token peut être expiré depuis la veille)
  isAuthenticated(): boolean {
    try {
      const accessToken = localStorage.getItem("token");
      if (!accessToken || typeof accessToken !== "string") {
        return false;
      }
      if (this.jwtHelper.isTokenExpired(accessToken)) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  // Modal "session expirée" + logout : uniquement pour expiration en cours de session active
  private async handleTokenExpired(): Promise<void> {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    try {
      await this._snackbar.showSimpleNotification(
        "Session expirée",
        "Votre session a expiré, veuillez vous reconnecter."
      );
    } finally {
      this.logout();
      this.router.navigateByUrl("/auth/login", { replaceUrl: true });
    }
  }
}
