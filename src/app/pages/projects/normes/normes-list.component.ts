import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ProjectService } from "src/app/core/services/project.service";
import { LocalService } from "src/app/core/services/local.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { NormeProject } from "../project.model";

@Component({
  selector: "app-normes-list",
  templateUrl: "./normes-list.component.html",
  styleUrls: ["./normes-list.component.scss"],
})
export class NormesListComponent implements OnInit, OnDestroy {
  @ViewChild("normeModal", { static: false }) normeModal: ModalDirective;

  normes: NormeProject[] = [];
  isLoading = false;
  isSaving = false;
  isEditing = false;
  editingId: number | null = null;
  normeForm: FormGroup;

  private currentProjectId: any;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private localService: LocalService,
    private snackbar: SnackBarService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.normeForm = this.fb.group({
      titre: ["", [Validators.required, Validators.minLength(2)]],
      description: ["", [Validators.required]],
    });
    this.loadNormes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNormes(): void {
    this.isLoading = true;
    this.projectService
      .getNormesByProjectId(this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.normes = res.data ?? res;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.normeForm.reset();
    this.normeModal.show();
  }

  openEditModal(norme: NormeProject): void {
    this.isEditing = true;
    this.editingId = norme.id;
    this.normeForm.patchValue({
      titre: norme.titre,
      description: norme.description,
    });
    this.normeModal.show();
  }

  get f() {
    return this.normeForm.controls;
  }

  save(): void {
    if (this.normeForm.invalid) {
      this.normeForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.normeForm.value,
      project: { id: this.currentProjectId },
    };

    if (this.isEditing && this.editingId) {
      payload["id"] = this.editingId;
    }

    this.isSaving = true;
    const request$ = this.isEditing
      ? this.projectService.updateNormeProjet(payload, this.currentProjectId)
      : this.projectService.saveNormeProjet(payload, this.currentProjectId);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackbar.openSnackBar(
          this.isEditing ? "Norme mise à jour" : "Norme ajoutée",
          "OK",
          ["mycssSnackbarGreen"]
        );
        this.isSaving = false;
        this.normeModal.hide();
        this.loadNormes();
      },
      error: (err) => {
        this.snackbar.showErrors(err);
        this.isSaving = false;
      },
    });
  }

  delete(norme: NormeProject): void {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer cette norme ?")
      .then((result) => {
        if (result["value"]) {
          this.projectService
            .deleteNorme(norme.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackbar.openSnackBar("Norme supprimée", "OK", [
                  "mycssSnackbarGreen",
                ]);
                this.loadNormes();
              },
              error: (err) => this.snackbar.showErrors(err),
            });
        }
      });
  }
}
