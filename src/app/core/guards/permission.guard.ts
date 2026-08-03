import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { PermissionService } from "../services/permission.service";

/**
 * Remplace RoleGuard : compare `route.data["permission"]` (un code unique, ex. "PAP_VOIR")
 * aux permissions résolues pour l'utilisateur sur le projet actif, au lieu de comparer des
 * noms de rôle en dur. Voir GESTION_PERMISSIONS_DOC.md §6.4.
 */
@Injectable({ providedIn: "root" })
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermission: string = route.data["permission"];

    if (!requiredPermission || this.permissionService.hasPermission(requiredPermission)) {
      return true;
    }

    this.router.navigate(["/dashboards/jobs"]);
    return false;
  }
}
