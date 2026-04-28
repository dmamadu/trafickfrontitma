import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { UIModule } from "../../../shared/ui/ui.module";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { Plainte } from "../plainte.model";

@Component({
  selector: "app-add-plainte",
  templateUrl: "./add-plainte.component.html",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AngularMaterialModule,
    MatDatepickerModule,
    MatNativeDateModule,
    UIModule,
    LoaderComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: MatPaginatorIntl },
    SnackBarService,
    MatDatepickerModule,
  ],
  styleUrl: "./add-plainte.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPlainteComponent implements OnInit {
  dialogTitle!: string;
  labelButton!: string;
  action!: string;
  id!: string;
  initForm!: UntypedFormGroup;
  isLoading = false;
  currentProjectId: any;

  statuts = ["OUVERTE", "EN COURS", "FERMEE"];
  niveauxGravite = ["Faible", "Moyen", "Elevé"];
  categorisations = ["CAS D'ERREUR", "CAS DE CORRECTION", "CAS D'OMISSION", "COMPENSATION FAIBLE"];
  typesPap = [
    "Agricole périmetre",
    "Agricole zone de servitude",
    "Habitat zone de servitude",
    "Place d'affaire zone de servitude",
  ];
  sexes = ["Masculin", "Feminin"];

  constructor(
    public matDialogRef: MatDialogRef<AddPlainteComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private localService: LocalService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    if (_data?.action === "new") {
      this.labelButton = "Ajouter";
      this.action = "new";
    } else {
      this.labelButton = "Modifier";
      this.action = "edit";
      this.id = _data?.data?.id ?? _data?.id;
    }
    this.dialogTitle = `${this.labelButton} une plainte`;
  }

  ngOnInit(): void {
    const d: Plainte = this._data?.action === "edit"
      ? (this._data.data ?? this._data)
      : {};
    this.initForm = this.fb.group({
      // Identification
      statut:             this.fb.control(d.statut ?? null),
      numeroReference:    this.fb.control(d.numeroReference ?? null),
      dateEnregistrement: this.fb.control(d.dateEnregistrement ?? null, [Validators.required]),
      moisReception:      this.fb.control(d.moisReception ?? null),
      // PAP
      codePap:            this.fb.control(d.codePap ?? null),
      nomPrenom:          this.fb.control(d.nomPrenom ?? null, [Validators.required]),
      mandataire:         this.fb.control(d.mandataire ?? null),
      sexe:               this.fb.control(d.sexe ?? null),
      telephone:          this.fb.control(d.telephone ?? null),
      perimetreGmp:       this.fb.control(d.perimetreGmp ?? null),
      numeroParcelle:     this.fb.control(d.numeroParcelle ?? null),
      typeCarteIdentite:  this.fb.control(d.typeCarteIdentite ?? null),
      cin:                this.fb.control(d.cin ?? null),
      typePap:            this.fb.control(d.typePap ?? null),
      villageQuartier:    this.fb.control(d.villageQuartier ?? null),
      plainteParZone:     this.fb.control(d.plainteParZone ?? null),
      // Plainte
      categorisation:     this.fb.control(d.categorisation ?? null, [Validators.required]),
      objetPlainte:       this.fb.control(d.objetPlainte ?? null, [Validators.required]),
      niveauGravite:      this.fb.control(d.niveauGravite ?? null, [Validators.required]),
      descriptionPlainte: this.fb.control(d.descriptionPlainte ?? null, [Validators.required]),
      facilitateur:       this.fb.control(d.facilitateur ?? null),
      // Résolution
      descriptionReglement:      this.fb.control(d.descriptionReglement ?? null),
      observations:              this.fb.control(d.observations ?? null),
      communicationResolution1:  this.fb.control(d.communicationResolution1 ?? null),
      dateTraitementConsultant:  this.fb.control(d.dateTraitementConsultant ?? null),
      dateVisite:                this.fb.control(d.dateVisite ?? null),
      communicationResolution2:  this.fb.control(d.communicationResolution2 ?? null),
      dateTraitementClm:         this.fb.control(d.dateTraitementClm ?? null),
      communicationResolution3:  this.fb.control(d.communicationResolution3 ?? null),
      dateTraitementCcd:         this.fb.control(d.dateTraitementCcd ?? null),
      resolutionPlainte:         this.fb.control(d.resolutionPlainte ?? null),
      siNonExpliquez:            this.fb.control(d.siNonExpliquez ?? null),
      prochaineEtape:            this.fb.control(d.prochaineEtape ?? null),
      dateCloture:               this.fb.control(d.dateCloture ?? null),
      delaiResolution:           this.fb.control(d.delaiResolution ?? null),
      // Audit
      projectId: this.fb.control(this.currentProjectId ?? null),
    });
  }

  checkRecap(): void {
    if (this.action === "new") {
      this.savePlainte();
    } else {
      this.updatePlainte();
    }
  }

  savePlainte(): void {
    if (this.initForm.invalid) {
      this.initForm.markAllAsTouched();
      return;
    }
    this.snackbar.showConfirmation("Voulez-vous vraiment créer cette plainte ?").then((result) => {
      if (result?.value !== true) return;
      this.isLoading = true;
      this.cdr.markForCheck();
      this.coreService.addItem(this.initForm.value, "plainte").subscribe({
        next: (resp: any) => {
          if (resp?.responseCode == 201) {
            this.snackbar.openSnackBar("Plainte ajoutée avec succès", "OK", ["mycssSnackbarGreen"]);
            this.matDialogRef.close(resp.data);
          } else {
            this.toastr.error(resp?.message ?? "Erreur lors de la création");
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snackbar.showErrors(err);
        },
      });
    });
  }

  updatePlainte(): void {
    if (this.initForm.invalid) {
      this.initForm.markAllAsTouched();
      return;
    }
    this.snackbar.showConfirmation("Voulez-vous vraiment modifier cette plainte ?").then((result) => {
      if (result?.value !== true) return;
      this.isLoading = true;
      this.cdr.markForCheck();
      this.coreService.updateItem(this.initForm.value, this.id, "plainte").subscribe({
        next: (resp: any) => {
          if (resp) {
            this.snackbar.openSnackBar("Plainte modifiée avec succès", "OK", ["mycssSnackbarGreen"]);
            this.matDialogRef.close(resp);
          } else {
            this.toastr.error("Erreur lors de la modification");
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snackbar.showErrors(err);
        },
      });
    });
  }
}
