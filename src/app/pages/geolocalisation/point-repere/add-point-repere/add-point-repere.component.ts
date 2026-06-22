import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ServiceParent } from "src/app/core/services/serviceParent";

export const TYPE_OPTIONS = [
  { value: "MARCHE", label: "Marché" },
  { value: "ECOLE", label: "École" },
  { value: "HOPITAL", label: "Hôpital" },
  { value: "MOSQUE", label: "Mosquée" },
  { value: "EGLISE", label: "Église" },
  { value: "BANQUE", label: "Banque" },
  { value: "PHARMACIE", label: "Pharmacie" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "STATION", label: "Station" },
  { value: "ARRET_BUS", label: "Arrêt de bus" },
  { value: "PARC", label: "Parc" },
  { value: "AUTRE", label: "Autre" },
];

@Component({
  selector: "app-add-point-repere",
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    AngularMaterialModule,
  ],
  providers: [SnackBarService],
  templateUrl: "./add-point-repere.component.html",
  styleUrl: "./add-point-repere.component.css",
})
export class AddPointRepereComponent implements OnInit {
  dialogTitle: string;
  labelButton: string;
  action: string;
  id: number;
  initForm: UntypedFormGroup;
  loader = false;

  typeOptions = TYPE_OPTIONS;
  quartiers: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<AddPointRepereComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private parentService: ServiceParent,
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this._data?.action === "new") {
      this.labelButton = "Ajouter";
      this.action = "new";
      this.initForms();
    } else {
      this.labelButton = "Modifier";
      this.action = "edit";
      this.id = this._data?.data?.id ?? this._data?.id;
      this.initForms(this._data?.data ?? this._data);
    }
    this.dialogTitle = `${this.labelButton} un point de repère`;
    this.loadQuartiers();
  }

  initForms(data?: any): void {
    this.initForm = this.fb.group({
      nom: [data?.nom ?? null, [Validators.required, Validators.minLength(2)]],
      type: [data?.type ?? null, [Validators.required]],
      quartierId: [data?.quartier?.id ?? null, [Validators.required]],
      latitude: [data?.latitude ?? null, [Validators.required]],
      longitude: [data?.longitude ?? null, [Validators.required]],
      photoUrl: [data?.photoUrl ?? null],
      description: [data?.description ?? null, [Validators.maxLength(500)]],
    });
  }

  loadQuartiers(): void {
    this.parentService.list("geolocation/quartiers", 1000, 0).subscribe(
      (resp: any) => {
        if (resp["responseCode"] === 200) {
          this.quartiers = resp["data"];
          this.cdr.markForCheck();
        }
      },
      () => {}
    );
  }

  checkRecap(): void {
    if (this.action === "new") {
      this.addItem();
    } else {
      this.updateItem();
    }
  }

  addItem(): void {
    if (this.initForm.invalid) {
      this.initForm.markAllAsTouched();
      return;
    }
    this.snackbar.showConfirmation("Voulez-vous vraiment créer ce point de repère ?").then((result) => {
      if (result["value"] === true) {
        this.loader = true;
        this.coreService.addItem(this.initForm.value, "geolocation/points").subscribe(
          (resp: any) => {
            this.loader = false;
            if (resp["responseCode"] === 201) {
              this.snackbar.openSnackBar("Point de repère créé avec succès", "OK", ["mycssSnackbarGreen"]);
              this.matDialogRef.close(resp["data"]);
            } else {
              this.snackbar.openSnackBar(resp["message"], "OK", ["mycssSnackbarRed"]);
            }
            this.cdr.markForCheck();
          },
          (error) => {
            this.loader = false;
            this.snackbar.showErrors(error);
            this.cdr.markForCheck();
          }
        );
      }
    });
  }

  updateItem(): void {
    if (this.initForm.invalid) {
      this.initForm.markAllAsTouched();
      return;
    }
    this.snackbar.showConfirmation("Voulez-vous vraiment modifier ce point de repère ?").then((result) => {
      if (result["value"] === true) {
        this.loader = true;
        this.coreService.updateItem(this.initForm.value, this.id, "geolocation/points").subscribe(
          (resp: any) => {
            this.loader = false;
            if (resp["responseCode"] === 200) {
              this.snackbar.openSnackBar("Point de repère modifié avec succès", "OK", ["mycssSnackbarGreen"]);
              this.matDialogRef.close(resp["data"]);
            } else {
              this.snackbar.openSnackBar(resp["message"], "OK", ["mycssSnackbarRed"]);
            }
            this.cdr.markForCheck();
          },
          (error) => {
            this.loader = false;
            this.snackbar.showErrors(error);
            this.cdr.markForCheck();
          }
        );
      }
    });
  }
}
