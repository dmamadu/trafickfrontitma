import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

// Auth Services
import { AuthenticationService } from "../services/auth.service";
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // this.authenticationService.checkTokenExpiration();
    const isAuthenticated = this.authenticationService.isAuthenticated();
    if (isAuthenticated) {
      return true;
    }
    this.router.navigate(["/home"], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
