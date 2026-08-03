import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { UserProjectRoleDTO, UserProjectRoleService } from "src/app/core/services/user-project-role.service";

/**
 * Affecte un rôle à un utilisateur, par projet (ou globalement). Remplace, à terme, le rôle
 * global unique porté par User.roles — voir GESTION_PERMISSIONS_DOC.md §3.4.
 */
@Component({
  selector: "app-user-project-roles",
  standalone: true,
  imports: [CommonModule, FormsModule, AngularMaterialModule],
  templateUrl: "./user-project-roles.component.html",
  styleUrl: "./user-project-roles.component.css",
})
export class UserProjectRolesComponent implements OnInit {
  user: any;
  assignments: UserProjectRoleDTO[] = [];
  roles: any[] = [];
  isLoading = true;

  selectedProjectId: number | "GLOBAL" = "GLOBAL";
  selectedRoleId: number | null = null;
  isSaving = false;

  constructor(
    public matDialogRef: MatDialogRef<UserProjectRolesComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    private userProjectRoleService: UserProjectRoleService,
    private parentService: ServiceParent,
    private snackbar: SnackBarService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.user = this.dialogData?.data;
  }

  ngOnInit(): void {
    this.loadAssignments();
    this.parentService.list("roles/all", 1000, 0).subscribe({
      next: (resp: any) => {
        this.roles = resp?.data || [];
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => this.snackbar.showErrors(error),
    });
  }

  get userProjects(): any[] {
    return this.user?.projects || [];
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.userProjectRoleService.listByUser(this.user.id).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackbar.showErrors(error);
      },
    });
  }

  addAssignment(): void {
    if (!this.selectedRoleId) {
      return;
    }
    const projectId = this.selectedProjectId === "GLOBAL" ? null : (this.selectedProjectId as number);
    this.isSaving = true;
    this.userProjectRoleService.assign(this.user.id, projectId, this.selectedRoleId).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackbar.openSnackBar("Rôle affecté avec succès", "OK", ["mycssSnackbarGreen"]);
        this.loadAssignments();
      },
      error: (error) => {
        this.isSaving = false;
        this.snackbar.showErrors(error);
      },
    });
  }

  removeAssignment(assignment: UserProjectRoleDTO): void {
    this.snackbar.showConfirmation("Retirer cette affectation de rôle ?").then((result) => {
      if (result["value"] == true) {
        this.userProjectRoleService.remove(assignment.id).subscribe({
          next: () => {
            this.snackbar.openSnackBar("Affectation supprimée", "OK", ["mycssSnackbarGreen"]);
            this.loadAssignments();
          },
          error: (error) => this.snackbar.showErrors(error),
        });
      }
    });
  }
}
