import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { CoreService } from "src/app/shared/core/core.service";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { DialogHeaderComponent } from "src/app/shared/refactore/dialog-header/dialog-header.component";
import { UIModule } from "src/app/shared/ui/ui.module";

export interface StatutOption {
  value: string;
  label: string;
  icon: string;
  bg: string;
  border: string;
  color: string;
}

@Component({
  selector: "app-createtask",
  templateUrl: "./createtask.component.html",
  styleUrls: ["./createtask.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DialogHeaderComponent,
    UIModule,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatetaskComponent implements OnInit {

  dialogTitle = "";
  labelButton = "Ajouter";
  action = "";
  id: string;
  loader = false;
  url = "taches";

  // Utilisateurs
  listMo: any[] = [];
  assignList: any[] = [];
  usersToUpdate: any[] = [];
  userSearchText = "";
  filteredUsers: any[] = [];

  pageSize = 100;
  offset = 0;
  currentProjectId: any;

  // Formulaire
  initForm = this.fb.group({
    libelle:      this.fb.control<string | null>(null, Validators.required),
    description:  this.fb.control<string | null>(null, Validators.required),
    dateDebut:    this.fb.control<string | null>(null, Validators.required),
    dateFin:      this.fb.control<string | null>(null, Validators.required),
    statut:       this.fb.control<string | null>(null, Validators.required),
    utilisateurs: this.fb.array([]),
  });

  // Options statut avec couleurs Jibili
  readonly statutOptions: StatutOption[] = [
    { value: 'en-attente', label: 'En attente', icon: 'hourglass_empty', bg: '#FFF3CD', border: '#F59E0B', color: '#92400E' },
    { value: 'en-cours',   label: 'En cours',   icon: 'sync',            bg: '#DBEAFE', border: '#2563EB', color: '#1E3A8A' },
    { value: 'approuve',   label: 'Approuvé',   icon: 'verified',        bg: '#E8F5E9', border: '#2E7D32', color: '#1B5E20' },
    { value: 'complete',   label: 'Complété',   icon: 'check_circle',    bg: '#EDE9FE', border: '#7C3AED', color: '#4C1D95' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<CreatetaskComponent>,
    @Inject(MAT_DIALOG_DATA) _data: any,
    private fb: FormBuilder,
    private coreService: CoreService,
    private localService: LocalService,
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef,
    private parentService: ServiceParent,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.action = _data.action;

    if (_data?.action === "new") {
      this.labelButton = "Créer la tâche";
      this.dialogTitle = "Nouvelle tâche";
      // Pré-remplissage dates depuis calendrier
      if (_data?.data?.prefillDateDebut) {
        this.initForm.patchValue({
          dateDebut: _data.data.prefillDateDebut,
          dateFin:   _data.data.prefillDateFin,
        });
      }
    } else if (_data?.action === "edit") {
      this.labelButton = "Enregistrer";
      this.dialogTitle = "Modifier la tâche";
      this.id = _data.data.id;
      this.patchForm(_data.data);
    }
  }

  ngOnInit(): void {
    this.fetchMo();
  }

  // ── Formulaire ───────────────────────────────────────────
  private patchForm(data: any): void {
    this.initForm.patchValue({
      libelle:     data.libelle,
      description: data.description,
      dateDebut:   data.dateDebut,
      dateFin:     data.dateFin,
      statut:      data.statut,
    });
    if (data.utilisateurs?.length) {
      this.usersToUpdate = data.utilisateurs;
    }
  }

  get assignListFormArray(): FormArray {
    return this.initForm.get("utilisateurs") as FormArray;
  }

  // ── Chargement membres ───────────────────────────────────
  fetchMo(): void {
    this.parentService
      .list(
        `users/by_role/projects?roleName=Maitre d'ouvrage&projectId=${this.currentProjectId}`,
        this.pageSize,
        this.offset
      )
      .subscribe((response: any) => {
        this.listMo = (response.data ?? []).map((user: any) => ({
          ...user,
          checked: this.usersToUpdate.some((u) => u.id === user.id) ? "1" : "0",
        }));

        // Pré-sélection en édition
        this.usersToUpdate.forEach((user) => {
          if (!this.assignList.some((a) => a.id === user.id)) {
            this.assignList.push(user);
            this.assignListFormArray.push(this.fb.control(user));
          }
        });

        this.filteredUsers = [...this.listMo];
        this.cdr.markForCheck();
      });
  }

  // ── Sélection membres ────────────────────────────────────
  isSelected(user: any): boolean {
    return this.assignList.some((u) => u.id === user.id);
  }

  toggleUserSelection(user: any): void {
    if (this.isSelected(user)) {
      this.removeAssignee(user);
    } else {
      this.assignList.push(user);
      this.assignListFormArray.push(this.fb.control(user));
    }
    this.cdr.markForCheck();
  }

  removeAssignee(user: any): void {
    const index = this.assignList.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.assignList.splice(index, 1);
      this.assignListFormArray.removeAt(index);
      this.cdr.markForCheck();
    }
  }

  filterUsers(): void {
    const q = this.userSearchText.toLowerCase().trim();
    this.filteredUsers = q
      ? this.listMo.filter(
          (u) =>
            u.lastname?.toLowerCase().includes(q) ||
            u.firstname?.toLowerCase().includes(q)
        )
      : [...this.listMo];
  }

  // ── Sauvegarde ───────────────────────────────────────────
  checkRecap(type: string): void {
    this.initForm.markAllAsTouched();
    if (!this.initForm.valid) return;

    if (type === "new")  this.addItems();
    if (type === "edit") this.updateItems();
  }

  private addItems(): void {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment créer cette tâche ?")
      .then((result) => {
        if (result?.value) {
          this.loader = true;
          this.coreService
            .addItemWithProject(this.initForm.value, this.url, +this.currentProjectId)
            .subscribe({
              next: (resp: any) => {
                this.loader = false;
                if (resp?.responseCode === 200) {
                  this.snackbar.openSnackBar("Tâche ajoutée avec succès", "OK", ["mycssSnackbarGreen"]);
                  this.matDialogRef.close(resp.data);
                }
                this.cdr.markForCheck();
              },
              error: (err) => {
                this.loader = false;
                this.snackbar.showErrors(err);
                this.cdr.markForCheck();
              },
            });
        }
      });
  }

  private updateItems(): void {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment modifier cette tâche ?")
      .then((result) => {
        if (result?.value) {
          this.loader = true;
          this.coreService
            .updateItem(this.initForm.value, this.id, this.url)
            .subscribe({
              next: (resp: any) => {
                this.loader = false;
                this.snackbar.openSnackBar("Tâche modifiée avec succès", "OK", ["mycssSnackbarGreen"]);
                this.matDialogRef.close(resp?.data);
                this.cdr.markForCheck();
              },
              error: (err) => {
                this.loader = false;
                this.snackbar.showErrors(err);
                this.cdr.markForCheck();
              },
            });
        }
      });
  }

  // ── Helpers ──────────────────────────────────────────────
  getImageFromBase64(imageType: string, imageData: any): string {
    return `data:${imageType};base64,${imageData}`;
  }
}