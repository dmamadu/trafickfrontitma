import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RootService } from "./root.service";
import { ResponseData } from "src/app/pages/projects/project.model";

export interface PermissionDTO {
  id: number;
  code: string;
  libelle: string;
  module: string;
}

/**
 * Consomme le catalogue de permissions et l'affectation Rôle -> Permissions pour l'écran
 * d'administration (matrice Rôle x Permission). Voir GESTION_PERMISSIONS_DOC.md §7 (UI d'admin).
 */
@Injectable({
  providedIn: "root",
})
export class PermissionAdminService extends RootService {
  getAllPermissions(): Observable<PermissionDTO[]> {
    return this.http
      .get<ResponseData<PermissionDTO[]>>(`${this.url}permissions/all`)
      .pipe(map((res) => res.data || []));
  }

  setRolePermissions(roleId: number, permissionCodes: string[]): Observable<any> {
    return this.http.put<any>(`${this.url}roles/${roleId}/permissions`, permissionCodes);
  }
}
