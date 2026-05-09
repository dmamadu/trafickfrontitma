import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ProjectService } from "src/app/core/services/project.service";
import { LocalService } from "src/app/core/services/local.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { NormeProject } from "../project.model";
import { ActionButton } from "src/app/shared/refactore/page-actions/page-actions.component";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";

@Component({
  selector: "app-normes-list",
  templateUrl: "./normes-list.component.html",
  styleUrls: ["./normes-list.component.scss"],
})
export class NormesListComponent implements OnInit, OnDestroy {
  @ViewChild("normeModal", { static: false }) normeModal!: ModalDirective;
  @ViewChild("detailModal", { static: false }) detailModal!: ModalDirective;

  normes: NormeProject[] = [];
  filteredNormes: NormeProject[] = [];
  selectedNorme: NormeProject | null = null;
  isLoading = false;
  isSaving = false;
  isEditing = false;
  editingId: number | null = null;
  normeForm!: FormGroup;

  breadCrumbItems!: Array<{}>;
  pageActions: ActionButton[] = [
    {
      label: "Ajouter une norme",
      icon: "mdi mdi-plus me-1",
      action: "add",
      type: "primary",
    },
  ];
  headers: any = [];
  btnActions: ButtonAction[] = [];
  pageSizeOptions = [5, 10, 25, 100];
  pageSize = 10;
  pageIndex = 0;
  length = 0;

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
    this.breadCrumbItems = [
      { label: "Projets" },
      { label: "Normes du projet", active: true },
    ];
    this.headers = this.createHeaders();
    this.btnActions = this.createActions();
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
          this.filteredNormes = this.normes;
          this.length = this.normes.length;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  filterTable(searchValue: string): void {
    const val = searchValue.toLowerCase();
    if (val) {
      this.filteredNormes = this.normes.filter(
        (n) =>
          n.titre?.toLowerCase().includes(val) ||
          n.description?.toLowerCase().includes(val)
      );
    } else {
      this.filteredNormes = this.normes;
    }
    this.length = this.filteredNormes.length;
  }

  handleAction(action: string): void {
    if (action === "add") this.openAddModal();
  }

  pageChanged(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  openDetailModal(norme: NormeProject): void {
    this.selectedNorme = norme;
    this.detailModal.show();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.normeForm.reset();
    this.normeModal.show();
  }

  openEditModal(norme: NormeProject): void {
    this.isEditing = true;
    this.editingId = norme.id ?? null;
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
            .deleteNorme(norme.id!)
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

  private createHeaders(): any[] {
    return [
      { th: "Titre", td: "titre" },
      { th: "Description", td: "description" },
    ];
  }

  private createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-info-circle",
        couleur: "black",
        size: "icon-size-4",
        title: "Détail",
        isDisabled: false,
        action: (element: any) => this.openDetailModal(element),
      },
      {
        icon: "bxs-edit",
        couleur: "green",
        size: "icon-size-4",
        title: "Modifier",
        isDisabled: false,
        action: (element: any) => this.openEditModal(element),
      },
      {
        icon: "bxs-trash-alt",
        couleur: "#D45C00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: false,
        action: (element: any) => this.delete(element),
      },
    ];
  }
}
