import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
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
import {
  HEURE_DEBUT_JOURNEE,
  HEURE_FIN_JOURNEE,
  STATUT_OPTIONS,
} from "../tasks.constants";

/** "HH:mm" → minutes depuis minuit. */
function toMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + m;
}

/** "HH:mm" d'une date, en heure locale. */
function heureDe(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Copie de la date avec l'heure "HH:mm" appliquée. */
function combiner(date: any, heure: string): Date {
  const d = new Date(date);
  const [h, m] = heure.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Heure comprise dans la plage de travail. */
function dansPlage(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string | null;
  if (!v) return null;
  const min = toMinutes(v);
  return min < toMinutes(HEURE_DEBUT_JOURNEE) || min > toMinutes(HEURE_FIN_JOURNEE)
    ? { horsPlage: true }
    : null;
}

/** La fin (date + heure) doit être après le début. */
const finApresDebut: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { dateDebut, dateFin, heureDebut, heureFin } = group.value;
  if (!dateDebut || !dateFin || !heureDebut || !heureFin) return null;
  return combiner(dateFin, heureFin) <= combiner(dateDebut, heureDebut)
    ? { finAvantDebut: true }
    : null;
};

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
    heureDebut:   this.fb.control<string>(HEURE_DEBUT_JOURNEE, [Validators.required, dansPlage]),
    heureFin:     this.fb.control<string>(HEURE_FIN_JOURNEE, [Validators.required, dansPlage]),
    statut:      this.fb.control<string | null>(null, Validators.required),
    progression:  this.fb.control<number>(0, [Validators.min(0), Validators.max(100)]),
    utilisateurs: this.fb.array([]),
    observation:  this.fb.control<string | null>(null),
  }, { validators: finApresDebut });

  // Options statut avec couleurs Jibili
  readonly statutOptions = STATUT_OPTIONS;
  readonly heureMin = HEURE_DEBUT_JOURNEE;
  readonly heureMax = HEURE_FIN_JOURNEE;

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
          dateDebut:  _data.data.prefillDateDebut,
          dateFin:    _data.data.prefillDateFin,
          heureDebut: _data.data.prefillHeureDebut ?? HEURE_DEBUT_JOURNEE,
          heureFin:   _data.data.prefillHeureFin ?? HEURE_FIN_JOURNEE,
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
    // Les tâches créées avant l'ajout des heures sont à minuit : on leur
    // propose la plage par défaut.
    const heureOu = (valeur: any, defaut: string): string => {
      if (!valeur) return defaut;
      const h = heureDe(new Date(valeur));
      return h === "00:00" ? defaut : h;
    };
    this.initForm.patchValue({
      libelle:     data.libelle,
      description: data.description,
      dateDebut:   data.dateDebut,
      dateFin:     data.dateFin,
      heureDebut:  heureOu(data.dateDebut, HEURE_DEBUT_JOURNEE),
      heureFin:    heureOu(data.dateFin, HEURE_FIN_JOURNEE),
      statut:      data.statut,
      progression: data.progression ?? 0,
      observation: data.observation,

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

  /** Valeur envoyée au serveur : date + heure fusionnées, sans les champs heure. */
  private payload(): any {
    const { heureDebut, heureFin, ...valeur } = this.initForm.value;
    return {
      ...valeur,
      dateDebut: combiner(valeur.dateDebut, heureDebut!),
      dateFin:   combiner(valeur.dateFin, heureFin!),
    };
  }

  private addItems(): void {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment créer cette tâche ?")
      .then((result) => {
        if (result?.value) {
          this.loader = true;
          this.coreService
            .addItemWithProject(this.payload(), this.url, +this.currentProjectId)
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
            .updateItemWithProject(this.payload(), this.id, this.url, +this.currentProjectId)
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