import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { LocalService } from "src/app/core/services/local.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
import { environment } from "src/environments/environment";
import { ImageModalComponent } from "src/app/shared/image-modal.component";
import { LoaderComponent } from "src/app/shared/loader/loader.component";
import { Subject, takeUntil } from "rxjs";
import { DialogHeaderComponent } from "src/app/shared/refactore/dialog-header/dialog-header.component";
import { CommonModule } from "@angular/common";

const MESSAGES = {
  IDENTIFY_CONFIRM: "Voulez-vous marquer ce PAP comme identifié et complet ?",
  IDENTIFY_SUCCESS: "PAP identifié avec succès",
  FILE_UPLOAD_SUCCESS: "Photo ajoutée avec succès",
  FILE_ERROR: "Format de fichier invalide",
  FORM_INVALID: "Veuillez remplir tous les champs obligatoires",
} as const;

@Component({
  selector: "app-formulaire-identification",
  standalone: true,
  templateUrl: "./formulaire-identification.component.html",
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    LoaderComponent,
    AngularMaterialModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DialogHeaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: MatPaginatorIntl },
    SnackBarService,
    MatDatepickerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormulaireIdentificationComponent implements OnInit, OnDestroy {
  identificationForm: UntypedFormGroup;
  dialogTitle: string = "Identification terrain du PAP";
  loader: boolean = false;
  papId: string;
  papCode: string;
  currentProjectId: any;
  imageToff: any;
  readonly url = "databasePapPlaceAffaire";
  readonly urlImage = environment.apiUrl + "image/getFile/";

  private destroy$ = new Subject<void>();

  // Sections du formulaire
  currentSection: number = 1;
  totalSections: number = 5;

  constructor(
    public matDialogRef: MatDialogRef<FormulaireIdentificationComponent>,
    @Inject(MAT_DIALOG_DATA) private _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private localService: LocalService,
    private clientServive: ClientVueService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.papId = _data?.data?.id;
    this.papCode = _data?.data?.codePap;
    this.initForm(_data?.data);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(donnees?: any): void {
    this.identificationForm = this.fb.group({
      // Données de base (déjà présentes)
      codePap: [{ value: donnees?.codePap || "", disabled: true }],
      projectId: [donnees?.projectId || this.currentProjectId],
      statutCompletion: ["complet"], // Sera mis à "complet" après identification
      
      // Identité - OBLIGATOIRES pour identification
      prenom: [donnees?.prenom || "", Validators.required],
      nom: [donnees?.nom || "", Validators.required],
      sexe: [donnees?.sexe || "", Validators.required],
      nationalite: [donnees?.nationalite || "", Validators.required],
      situationMatrimoniale: [donnees?.situationMatrimoniale || "", Validators.required],
      
      // Contact
      numeroTelephone: [donnees?.numeroTelephone || "", Validators.required],
      surnom: [donnees?.surnom || ""],
      
      // Localisation
      commune: [donnees?.commune || "", Validators.required],
      departement: [donnees?.departement || "", Validators.required],
      
      // Socio-économique
      langueParlee: [donnees?.langueParlee || ""],
      niveauEtude: [donnees?.niveauEtude || ""],
      religion: [donnees?.religion || ""],
      membreFoyer: [donnees?.membreFoyer || "", Validators.required],
      membreFoyerHandicape: [donnees?.membreFoyerHandicape || 0],
      vulnerabilite: [donnees?.vulnerabilite || ""],
      typeHandicape: [donnees?.typeHandicape || ""],
      
      // Documents
      typePni: [donnees?.typePni || ""],
      numeroPni: [donnees?.numeroPni || ""],
      photoPap: [donnees?.photoPap || null],
      
      // Pertes (optionnel)
      nombrePlaceAffaire: [donnees?.nombrePlaceAffaire || ""],
      codePlaceAffaire: [donnees?.codePlaceAffaire || ""],
      evaluationPerte: [donnees?.evaluationPerte || ""],
      caracteristiquePlaceAffaire: [donnees?.caracteristiquePlaceAffaire || ""],
      perteArbreJeune: [donnees?.perteArbreJeune || 0],
      perteArbreAdulte: [donnees?.perteArbreAdulte || 0],
      perteTotaleArbre: [donnees?.perteTotaleArbre || 0],
      perteEquipement: [donnees?.perteEquipement || 0],
      perteBatiment: [donnees?.perteBatiment || 0],
      perteTotale: [donnees?.perteTotale || 0],
      
      // Autres
      informationsEtendues: [donnees?.informationsEtendues || ""],
      description: [donnees?.description || ""],
      optionPaiement: [donnees?.optionPaiement || ""],
    });

    if (donnees?.photoPap) {
      this.imageToff = donnees.photoPap;
    }
  }

  identifierPap(): void {
    if (this.identificationForm.invalid) {
      this.identificationForm.markAllAsTouched();
      this.snackbar.openSnackBar(MESSAGES.FORM_INVALID, "OK", ["mycssSnackbarRed"]);
      return;
    }

    this.snackbar.showConfirmation(MESSAGES.IDENTIFY_CONFIRM).then((result) => {
      if (result["value"] !== true) return;

      this.loader = true;
      const formValue = this.identificationForm.getRawValue();
      
      this.coreService
        .updateItem(formValue, this.papId, this.url)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (resp) => {
            if (resp) {
              this.loader = false;
              this.matDialogRef.close(resp);
              this.snackbar.openSnackBar(MESSAGES.IDENTIFY_SUCCESS, "OK", ["mycssSnackbarGreen"]);
            } else {
              this.loader = false;
              this.snackbar.openSnackBar(resp["message"], "OK", ["mycssSnackbarRed"]);
            }
          },
          (error) => {
            this.loader = false;
            this.snackbar.showErrors(error);
          }
        );
    });
  }

  selectOnFile(evt: any): void {
    const accept = [".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG"];
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(MESSAGES.FILE_ERROR, "OK", ["mycssSnackbarRed"]);
        return;
      } else {
        this.saveStoreFile(file);
      }
    }
  }

  saveStoreFile(file: File): void {
    let formData = new FormData();
    formData.append("file", file);
    this.loader = true;
    
    this.clientServive.saveStoreFile(formData).pipe(takeUntil(this.destroy$)).subscribe(
      (resp) => {
        if (resp) {
          this.imageToff = `${this.urlImage + resp["fileName"]}`;
          this.identificationForm.get("photoPap").setValue(this.imageToff);
          this.snackbar.openSnackBar(MESSAGES.FILE_UPLOAD_SUCCESS, "OK", ["mycssSnackbarGreen"]);
        }
        this.loader = false;
        this.changeDetectorRefs.detectChanges();
      },
      (error) => {
        this.snackbar.showErrors(error);
        this.loader = false;
      }
    );
  }

  openImageModal(imageUrl: string): void {
    if (imageUrl) {
      this._matDialog.open(ImageModalComponent, {
        data: { imageUrl: imageUrl },
      });
    }
  }

  nextSection(): void {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
    }
  }

  previousSection(): void {
    if (this.currentSection > 1) {
      this.currentSection--;
    }
  }

  goToSection(section: number): void {
    this.currentSection = section;
  }

  getSectionValidity(section: number): boolean {
    switch (section) {
      case 1: // Identité
        return this.identificationForm.get('prenom')?.valid &&
               this.identificationForm.get('nom')?.valid &&
               this.identificationForm.get('sexe')?.valid &&
               this.identificationForm.get('nationalite')?.valid &&
               this.identificationForm.get('situationMatrimoniale')?.valid;
      case 2: // Contact & Localisation
        return this.identificationForm.get('numeroTelephone')?.valid &&
               this.identificationForm.get('commune')?.valid &&
               this.identificationForm.get('departement')?.valid;
      case 3: // Socio-économique
        return this.identificationForm.get('membreFoyer')?.valid;
      default:
        return true;
    }
  }
}