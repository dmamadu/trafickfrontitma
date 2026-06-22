import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { LocalService } from "../services/local.service";

@Injectable({ providedIn: "root" })
export class RoleGuard implements CanActivate {
  constructor(private localService: LocalService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles: string[] = route.data["roles"];

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const user = this.localService.getDataJson("user");
    const userRole: string = user?.role?.[0]?.name;

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(["/dashboards/jobs"]);
    return false;
  }
}