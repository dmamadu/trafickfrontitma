import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { RootService } from "./root.service";
import { LocalService } from "./local.service";
import { ResponseData } from "src/app/pages/projects/project.model";

/**
 * Résout et met en cache les permissions accordées à l'utilisateur connecté pour le projet actif.
 * Voir GESTION_PERMISSIONS_DOC.md §6.1.
 *
 * Les codes sont mis en cache en session (comme "user"/"ProjectId") pour rester disponibles
 * de façon synchrone (guards, sidebar) après un rechargement de page, sans attendre un appel réseau.
 */
@Injectable({
  providedIn: "root",
})
export class PermissionService extends RootService {
  private static readonly CACHE_KEY = "permissions";

  private granted = new Set<string>();

  constructor(http: HttpClient, private localService: LocalService) {
    super(http);
    const cached = this.localService.getDataJson(PermissionService.CACHE_KEY);
    this.granted = new Set(Array.isArray(cached) ? cached : []);
  }

  /** À appeler au login et à chaque changement de projet actif, avant toute navigation. */
  load(projectId?: number | string): Observable<string[]> {
    let params = new HttpParams();
    if (projectId !== undefined && projectId !== null && projectId !== "") {
      params = params.set("projectId", projectId.toString());
    }
    return this.http.get<ResponseData<string[]>>(`${this.url}permissions/effective`, { params }).pipe(
      map((res) => res.data || []),
      tap((codes) => {
        this.granted = new Set(codes);
        this.localService.saveDataJson(PermissionService.CACHE_KEY, codes as any);
      })
    );
  }

  clear(): void {
    this.granted = new Set();
    this.localService.removeData(PermissionService.CACHE_KEY);
  }

  hasPermission(code: string): boolean {
    return this.granted.has(code);
  }

  hasAny(codes: string[]): boolean {
    return codes.some((code) => this.granted.has(code));
  }
}
