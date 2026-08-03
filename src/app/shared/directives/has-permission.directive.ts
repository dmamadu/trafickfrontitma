import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { PermissionService } from "src/app/core/services/permission.service";

/**
 * Affiche l'élément uniquement si l'utilisateur possède la permission donnée pour le projet actif.
 * Complément de PermissionGuard (routes) et de MenuItem.permission (sidebar) — voir
 * GESTION_PERMISSIONS_DOC.md §6.5.
 *
 * Usage : <button *appHasPermission="'PAP_SUPPRIMER'">Supprimer</button>
 *
 * Standalone : s'importe directement dans les `imports` d'un composant standalone
 * ou d'un NgModule, sans dépendre de SharedModule.
 */
@Directive({
  selector: "[appHasPermission]",
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input("appHasPermission") permission: string;

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }

  private updateView(): void {
    const granted = !this.permission || this.permissionService.hasPermission(this.permission);
    if (granted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!granted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
