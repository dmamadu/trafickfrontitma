import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RootService } from "./root.service";
import { ResponseData } from "src/app/pages/projects/project.model";

export interface UserProjectRoleDTO {
  id: number;
  userId: number;
  projectId?: number;
  projectLibelle?: string;
  roleId: number;
  roleName: string;
}

/**
 * Affectation d'un rôle à un utilisateur, par projet (ou globalement si projectId est absent).
 * Voir GESTION_PERMISSIONS_DOC.md §3.4.
 */
@Injectable({
  providedIn: "root",
})
export class UserProjectRoleService extends RootService {
  listByUser(userId: number): Observable<UserProjectRoleDTO[]> {
    return this.http
      .get<ResponseData<UserProjectRoleDTO[]>>(`${this.url}user-project-roles/user/${userId}`)
      .pipe(map((res) => res.data || []));
  }

  assign(userId: number, projectId: number | null, roleId: number): Observable<UserProjectRoleDTO> {
    return this.http
      .post<ResponseData<UserProjectRoleDTO[]>>(`${this.url}user-project-roles`, { userId, projectId, roleId })
      .pipe(map((res) => (res.data || [])[0]));
  }

  remove(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}user-project-roles/${id}`);
  }
}
