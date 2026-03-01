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
  FormGroup,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { MatStepperModule } from "@angular/material/stepper";
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
  ADD_CONFIRM: "Voulez-vous vraiment ajouter ce PAP ?",
  UPDATE_CONFIRM: "Voulez-vous vraiment modifier ce PAP ?",
  COMPLETE_CONFIRM: "Voulez-vous compléter les données de ce PAP ?",
  ADD_SUCCESS: "PAP ajouté avec succès",
  UPDATE_SUCCESS: "PAP modifié avec succès",
  COMPLETE_SUCCESS: "Données complétées avec succès",
  FILE_UPLOAD_SUCCESS: "Fichier chargé avec succès",
  FILE_ERROR: "Fichier invalide",
} as const;

@Component({
  selector: "app-add-pap-flexible",
  standalone: true,
  templateUrl: "./add-pap-flexible.component.html",
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
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
export class AddPapFlexibleComponent implements OnInit, OnDestroy {
  initForm: UntypedFormGroup;
  dialogTitle: string;
  labelButton: string;
  loader: boolean = false;
  action: string;
  id: string;
  currentProjectId: any;
  imageToff: any;
  readonly url = "databasePapPlaceAffaire";
  readonly urlImage = environment.apiUrl + "image/getFile/";

  private destroy$ = new Subject<void>();

  constructor(
    public matDialogRef: MatDialogRef<AddPapFlexibleComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private localService: LocalService,
    private clientServive: ClientVueService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.action = _data?.action;

    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter";
      this.dialogTitle = "Ajouter un PAP";
    } else if (_data?.action == "edit" || _data?.action == "complete") {
      this.labelButton = _data?.action == "edit" ? "Modifier" : "Compléter";
      this.dialogTitle = _data?.action == "edit" ? "Modifier un PAP" : "Compléter données PAP";
      this.id = _data.data.id;
      this.initForms(_data.data);
      if (_data.data?.photoPap) {
        this.imageToff = _data.data.photoPap;
      }
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForms(donnees?: any): void {
    // SEUL codePap est obligatoire
    this.initForm = this.fb.group({
      codePap: [donnees?.codePap || "", Validators.required],
      statutCompletion: [donnees?.statutCompletion || "a_completer"],
      projectId: [donnees?.projectId || (this.currentProjectId ? +this.currentProjectId : null), Validators.required],
      
      // Tous les autres champs sont optionnels
      prenom: [donnees?.prenom || ""],
      nom: [donnees?.nom || ""],
      sexe: [donnees?.sexe || ""],
      nationalite: [donnees?.nationalite || ""],
      situationMatrimoniale: [donnees?.situationMatrimoniale || ""],
      commune: [donnees?.commune || ""],
      departement: [donnees?.departement || ""],
      nombrePlaceAffaire: [donnees?.nombrePlaceAffaire || ""],
      codePlaceAffaire: [donnees?.codePlaceAffaire || ""],
      evaluationPerte: [donnees?.evaluationPerte || ""],
      caracteristiquePlaceAffaire: [donnees?.caracteristiquePlaceAffaire || ""],
      perteArbreJeune: [donnees?.perteArbreJeune || 0],
      perteArbreAdulte: [donnees?.perteArbreAdulte || 0],
      perteTotaleArbre: [donnees?.perteTotaleArbre || 0],
      vulnerabilite: [donnees?.vulnerabilite || ""],
      typePni: [donnees?.typePni || ""],
      numeroPni: [donnees?.numeroPni || ""],
      surnom: [donnees?.surnom || ""],
      numeroTelephone: [donnees?.numeroTelephone || ""],
      perteEquipement: [donnees?.perteEquipement || 0],
      perteBatiment: [donnees?.perteBatiment || 0],
      perteTotale: [donnees?.perteTotale || 0],
      informationsEtendues: [donnees?.informationsEtendues || ""],
      photoPap: [donnees?.photoPap || null],
      description: [donnees?.description || null],
      religion: [donnees?.religion || null],
      langueParlee: [donnees?.langueParlee || ""],
      niveauEtude: [donnees?.niveauEtude || ""],
      optionPaiement: [donnees?.optionPaiement || ""],
      membreFoyer: [donnees?.membreFoyer || ""],
      membreFoyerHandicape: [donnees?.membreFoyerHandicape || ""],
      typeHandicape: [donnees?.typeHandicape || ""],
    });
  }

  isToComplete(): boolean {
    return this.initForm.get('statutCompletion')?.value === 'a_completer';
  }

  markAsComplete(): void {
    this.initForm.get('statutCompletion')?.setValue('complet');
  }

  addItems(): void {
    this.snackbar.showConfirmation(MESSAGES.ADD_CONFIRM).then((result) => {
      if (result["value"] !== true) return;
      this.loader = true;
      const value = this.initForm.value;
      this.coreService.addItem([value], this.url).pipe(takeUntil(this.destroy$)).subscribe(
        (resp) => {
          if (resp["responseCode"] == 201) {
            this.snackbar.openSnackBar(MESSAGES.ADD_SUCCESS, "OK", ["mycssSnackbarGreen"]);
            this.loader = false;
            this.matDialogRef.close(resp["data"]);
            this.changeDetectorRefs.markForCheck();
          } else {
            this.loader = false;
            this.changeDetectorRefs.markForCheck();
          }
        },
        (error) => {
          this.loader = false;
          this.changeDetectorRefs.markForCheck();
          this.snackbar.showErrors(error.message);
        }
      );
    });
  }

  updateItems(): void {
    const message = this.action === 'complete' ? MESSAGES.COMPLETE_CONFIRM : MESSAGES.UPDATE_CONFIRM;
    const successMessage = this.action === 'complete' ? MESSAGES.COMPLETE_SUCCESS : MESSAGES.UPDATE_SUCCESS;

    // Si action = complete, marquer comme complet
    if (this.action === 'complete') {
      this.markAsComplete();
    }

    this.snackbar.showConfirmation(message).then((result) => {
      if (result["value"] !== true) return;
      this.loader = true;
      const value = this.initForm.value;
      this.coreService.updateItem(value, this.id, this.url).pipe(takeUntil(this.destroy$)).subscribe(
        (resp) => {
          if (resp) {
            this.loader = false;
            this.matDialogRef.close(resp);
            this.snackbar.openSnackBar(successMessage, "OK", ["mycssSnackbarGreen"]);
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

  checkRecap(type: string): void {
    if (type == "new") {
      this.addItems();
    } else if (type == "edit" || type == "complete") {
      this.updateItems();
    }
  }

  selectOnFile(evt: any): void {
    const accept = [".png", ".PNG", ".jpg", ".JPG"];
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(MESSAGES.FILE_ERROR, "OK", ["mycssSnackbarRed"]);
        return;
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.saveStoreFile(file);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  saveStoreFile(file: File): void {
    let formData = new FormData();
    formData.append("file", file);
    this.changeDetectorRefs.detectChanges();
    this.loader = true;
    this.clientServive.saveStoreFile(formData).pipe(takeUntil(this.destroy$)).subscribe(
      (resp) => {
        if (resp) {
          this.imageToff = `${this.urlImage + resp["fileName"]}`;
          this.initForm.get("photoPap").setValue(this.imageToff);
          this.snackbar.openSnackBar(MESSAGES.FILE_UPLOAD_SUCCESS, "OK", ["mycssSnackbarGreen"]);
        }
        this.loader = false;
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
}