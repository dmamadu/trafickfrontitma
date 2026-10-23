import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

// Auth Services
import { AuthenticationService } from "../services/auth.service";
import { LocalService } from "../services/local.service";
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private localService: LocalService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // this.authenticationService.checkTokenExpiration();
    const isAuthenticated = this.authenticationService.isAuthenticated();
    // Session ouverte avant le changement obligatoire du mot de passe : on renvoie à la connexion
    const mustChangePassword = this.localService.getDataJson("user")?.mustChangePassword === true;
    if (isAuthenticated && mustChangePassword) {
      this.authenticationService.logout();
      this.router.navigate(["/auth/login"]);
      return false;
    }
    if (isAuthenticated) {
      return true;
    }
    this.router.navigate(["/home"], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
