import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

// Auth Services
import { AuthenticationService } from "../services/auth.service";
import { AuthfakeauthenticationService } from "../services/authfake.service";
import { environment } from "../../../environments/environment";
import { Auth } from "src/app/store/Authentication/auth.models";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  currentUser(): Auth | null {
    return this.authenticationService.currentUser();
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.currentUser();
    if (currentUser) {
      // logged in so return true
      return true;
    }

    // check if user data is in storage is logged in via API.
    // if (localStorage.getItem('currentUser')) {
    //     return true;
    // }
    // not logged in so redirect to login page with the return url
    this.router.navigate(["/home"], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
