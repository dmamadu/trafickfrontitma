import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { PermissionAdminService, PermissionDTO } from "src/app/core/services/permission-admin.service";

interface ModuleGroup {
  module: string;
  label: string;
  permissions: PermissionDTO[];
}

/**
 * Matrice de permissions pour UN rôle (plutôt qu'une grande grille Rôle x Permission) :
 * plus simple à administrer, cohérent avec les dialogs existants (AddRoleComponent...).
 * Voir GESTION_PERMISSIONS_DOC.md §7.
 */
@Component({
  selector: "app-role-permissions",
  standalone: true,
  imports: [CommonModule, AngularMaterialModule],
  templateUrl: "./role-permissions.component.html",
  styleUrl: "./role-permissions.component.css",
})
export class RolePermissionsComponent implements OnInit {
  role: any;
  groups: ModuleGroup[] = [];
  checked = new Set<string>();
  isLoading = true;
  isSaving = false;

  constructor(
    public matDialogRef: MatDialogRef<RolePermissionsComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    private permissionAdminService: PermissionAdminService,
    private snackbar: SnackBarService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.role = this.dialogData?.data;
  }

  ngOnInit(): void {
    const initialCodes: string[] = (this.role?.permissions || []).map((p: PermissionDTO) => p.code);
    this.checked = new Set(initialCodes);

    this.permissionAdminService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.groups = this.groupByModule(permissions);
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackbar.showErrors(error);
      },
    });
  }

  private groupByModule(permissions: PermissionDTO[]): ModuleGroup[] {
    const byModule = new Map<string, PermissionDTO[]>();
    for (const permission of permissions) {
      const list = byModule.get(permission.module) || [];
      list.push(permission);
      byModule.set(permission.module, list);
    }
    return Array.from(byModule.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, perms]) => ({ module, label: this.formatModule(module), permissions: perms }));
  }

  private formatModule(module: string): string {
    return module
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  isChecked(code: string): boolean {
    return this.checked.has(code);
  }

  toggle(code: string): void {
    if (this.checked.has(code)) {
      this.checked.delete(code);
    } else {
      this.checked.add(code);
    }
  }

  isModuleFullyChecked(group: ModuleGroup): boolean {
    return group.permissions.every((p) => this.checked.has(p.code));
  }

  toggleModule(group: ModuleGroup): void {
    const fullyChecked = this.isModuleFullyChecked(group);
    for (const permission of group.permissions) {
      if (fullyChecked) {
        this.checked.delete(permission.code);
      } else {
        this.checked.add(permission.code);
      }
    }
  }

  save(): void {
    this.isSaving = true;
    this.permissionAdminService.setRolePermissions(this.role.id, Array.from(this.checked)).subscribe({
      next: (resp) => {
        this.isSaving = false;
        this.snackbar.openSnackBar("Permissions du rôle mises à jour", "OK", ["mycssSnackbarGreen"]);
        this.matDialogRef.close(resp?.data?.[0]);
      },
      error: (error) => {
        this.isSaving = false;
        this.snackbar.showErrors(error);
      },
    });
  }
}
