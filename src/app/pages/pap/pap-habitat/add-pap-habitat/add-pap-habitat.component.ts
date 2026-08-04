// import {
//   CUSTOM_ELEMENTS_SCHEMA,
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
//   Component,
//   Inject,
//   OnDestroy,
//   OnInit,
//   ViewChild,
// } from "@angular/core";
// import {
//   UntypedFormGroup,
//   UntypedFormBuilder,
//   Validators,
//   FormGroup,
// } from "@angular/forms";
// import {
//   MatDialogRef,
//   MAT_DIALOG_DATA,
//   MatDialog,
// } from "@angular/material/dialog";
// import { MatStepper, MatStepperModule } from "@angular/material/stepper";
// import { CoreService } from "src/app/shared/core/core.service";
// import { SnackBarService } from "src/app/shared/core/snackBar.service";
// import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
// import { MatPaginatorIntl } from "@angular/material/paginator";
// import { MatFormFieldModule } from "@angular/material/form-field";
// import { MatIconModule } from "@angular/material/icon";
// import { MatInputModule } from "@angular/material/input";
// import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
// import { LocalService } from "src/app/core/services/local.service";
// import { MatDatepickerModule } from "@angular/material/datepicker";
// import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
// import { environment } from "src/environments/environment";
// import { MatTableDataSource } from "@angular/material/table";
// import { ImageModalComponent } from "src/app/shared/image-modal.component";
// import { LoaderComponent } from "src/app/shared/loader/loader.component";
// import { Subject, takeUntil } from "rxjs";

// // Messages constants
// const MESSAGES = {
//   ADD_CONFIRM: "Voulez-vous vraiment ajouter ce PAP habitat ?",
//   UPDATE_CONFIRM: "Voulez-vous vraiment modifier cette personne affectée ?",
//   ADD_SUCCESS: "PAP habitat ajouté avec succès",
//   UPDATE_SUCCESS: "Personne affectée modifiée avec succès",
//   FILE_UPLOAD_SUCCESS: "Fichier chargé avec succès : ",
//   FILE_ERROR: "Ce fichier n'est ",
//   FIELD_REQUIRED: "Le champ est obligatoire",
// } as const;

// @Component({
//   selector: "app-add-pap-habitat",
//   standalone: true,
//   templateUrl: "./add-pap-habitat.component.html",
//   styleUrl: "./add-pap-habitat.component.css",
//   imports: [
//     MatFormFieldModule,
//     MatInputModule,
//     MatStepperModule,
//     MatIconModule,
//     LoaderComponent,
//     AngularMaterialModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   providers: [
//     { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
//     { provide: MatPaginatorIntl },
//     SnackBarService,
//     MatDatepickerModule,
//   ],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
// })
// export class AddPapHabitatComponent implements OnInit, OnDestroy {
//   @ViewChild("stepper") private stepper: MatStepper;

//   // Form
//   initForm: UntypedFormGroup;
//   contactForm: FormGroup;

//   // UI State
//   dialogTitle: string;
//   labelButton: string;
//   loader: boolean = false;
//   action: string;

//   // Data
//   id: string;
//   currentProjectId: any;
//   imageToff: any;
//   readonly url = "databasePapHabitat";
//   readonly urlImage = environment.apiUrl + "image/getFile/";

//   // Table
//   displayedColumns: string[] = ["nom", "prenom", "sexe", "telephone"];
//   contacts = new MatTableDataSource<any>();

//   // Options
//   sexeOptions = [
//     { id: "M", name: "Masculin" },
//     { id: "F", name: "Féminin" },
//   ];

//   private destroy$ = new Subject<void>();

//   constructor(
//     public matDialogRef: MatDialogRef<AddPapHabitatComponent>,
//     @Inject(MAT_DIALOG_DATA) _data,
//     private fb: UntypedFormBuilder,
//     private coreService: CoreService,
//     private _matDialog: MatDialog,
//     private snackbar: SnackBarService,
//     private changeDetectorRefs: ChangeDetectorRef,
//     private localService: LocalService,
//     private clientServive: ClientVueService
//   ) {
//     this.currentProjectId = this.localService.getData("ProjectId");
//     this.action = _data?.action;

//     if (_data?.action == "new") {
//       this.initForms();
//       this.labelButton = "Ajouter ";
//     } else if (_data?.action == "edit") {
//       this.labelButton = "Modifier ";
//       this.id = _data.data.id;
//       this.initForms(_data.data);
//       this.initForm.get("sexe").setValue(_data.data.sexe);
      
//       if (_data.data?.coProprietaire) {
//         this.contacts.data.push(_data.data.coProprietaire);
//         this.contacts._updateChangeSubscription();
//       }
//     }

//     this.dialogTitle = this.labelButton + " une personne affectée";
//     this.createCoProprietaire();
//   }

//   ngOnInit(): void {
//     this.createCoProprietaire();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // Form initialization
//   initForms(donnees?: any): void {
//     this.initForm = this.fb.group({
//       // Étape 1 : Informations personnelles
//       prenom: [donnees?.prenom || "", Validators.required],
//       nom: [donnees?.nom || "", Validators.required],
//       sexe: [donnees?.sexe || "", Validators.required],
//       codePap: [donnees?.codePap || "", Validators.required],
//       nationalite: [donnees?.nationalite || "", Validators.required],
//       langueParlee: [donnees?.langueParlee || "", Validators.required],
//       situationMatrimoniale: [donnees?.situationMatrimoniale || "", Validators.required],
//       commune: [donnees?.commune || "", Validators.required],
//       departement: [donnees?.departement || "", Validators.required],
//       nombreParcelles: [donnees?.nombreParcelles || "", Validators.required],
//       niveauEtude: [donnees?.niveauEtude || null],
//       religion: [donnees?.religion || null],
      
//       // Étape 2 : Informations parcelle (DIFFÉRENT de Place Affaire)
//       codeParcelle: [donnees?.codeParcelle || "", Validators.required],
//       superficie: [donnees?.superficie || "", Validators.required],
//       evaluationPerte: [donnees?.evaluationPerte || "", Validators.required],
//       perteTotaleArbre: [donnees?.perteTotaleArbre || 0],
//       caracteristiqueParcelle: [donnees?.caracteristiqueParcelle || "", Validators.required],
      
//       // Étape 3 : Documents et détails supplémentaires
//       photoPap: [donnees?.photoPap || null],
//       statutPap: [donnees?.statutPap || "", Validators.required],
//       vulnerabilite: [donnees?.vulnerabilite || "", Validators.required],
//       vulnerabiliteSpecifique: [donnees?.vulnerabiliteSpecifique || ""],
//       typePni: [donnees?.typePni || ""],
//       numeroPni: [donnees?.numeroPni || ""],
//       surnom: [donnees?.surnom || ""],
//       numeroTelephone: [donnees?.numeroTelephone || ""],
//       membreFamilial: [donnees?.membreFamilial || ""],
//       membreFamilialHandicape: [donnees?.membreFamilialHandicape || ""],
      
//       // Étape 4 : Co-propriétaires (identique)
//       coProprietaire: [donnees?.coProprietaire || null],
      
//       // Étape 5 : Bâtiments/Revenus (DIFFÉRENT de Place Affaire)
//       perteEquipement: [donnees?.perteEquipement || 0],
//       perteBatiment: [donnees?.perteBatiment || 0],
//       perteCloture: [donnees?.perteCloture || 0],
//       perteRevenue: [donnees?.perteRevenue || 0],
//       fraisDeplacement: [donnees?.fraisDeplacement || 0],
//       appuiRecolalisation: [donnees?.appuiRecolalisation || 0],
//       perteTotale: [donnees?.perteTotale || 0],
//       informationsEtendues: [donnees?.informationsEtendues || ""],
//       optionPaiement: [donnees?.optionPaiement || "", Validators.required],
      
//       // Autres
//       pointGeometriques: [donnees?.pointGeometriques || null],
//       description: [donnees?.description || null],
//       projectId: [
//         donnees?.projectId || (this.currentProjectId ? +this.currentProjectId : null),
//         [Validators.required]
//       ],
//     });
//   }

//   createCoProprietaire(): void {
//     this.contactForm = this.fb.group({
//       codeCoProprietaire: ["", Validators.required],
//       nomComplet: ["", Validators.required],
//       infoComplementaire: ["", Validators.required],
//       sexeCoProprietaire: ["", Validators.required],
//       contactTelephonique: ["", Validators.required],
//     });
//   }

//   // CRUD Operations
//   addItems(): void {
//     this.initForm
//       .get("coProprietaire")
//       .setValue(JSON.stringify(this.contactForm.value));
      
//     this.snackbar
//       .showConfirmation(MESSAGES.ADD_CONFIRM)
//       .then((result) => {
//         if (result["value"] !== true) return;

//         this.loader = true;
//         const value = this.initForm.value;
        
//         this.coreService
//           .addItem([value], this.url)
//           .pipe(takeUntil(this.destroy$))
//           .subscribe(
//             (resp) => {
//               if (resp["responseCode"] == 201) {
//                 this.snackbar.openSnackBar(MESSAGES.ADD_SUCCESS, "OK", [
//                   "mycssSnackbarGreen",
//                 ]);
//                 this.loader = false;
//                 this.matDialogRef.close(resp["data"]);
//                 this.changeDetectorRefs.markForCheck();
//               } else {
//                 this.loader = false;
//                 this.changeDetectorRefs.markForCheck();
//               }
//             },
//             (error) => {
//               console.error("Error adding PAP Habitat:", error);
//               this.loader = false;
//               this.changeDetectorRefs.markForCheck();
//               this.snackbar.showErrors(error.message);
//             }
//           );
//       });
//   }

//   updateItems(): void {
//     this.snackbar
//       .showConfirmation(MESSAGES.UPDATE_CONFIRM)
//       .then((result) => {
//         if (result["value"] !== true) return;

//         this.loader = true;
//         const value = this.initForm.value;
        
//         this.coreService
//           .updateItem(value, this.id, this.url)
//           .pipe(takeUntil(this.destroy$))
//           .subscribe(
//             (resp) => {
//               if (resp) {
//                 this.loader = false;
//                 this.matDialogRef.close(resp);
//                 this.snackbar.openSnackBar(
//                   MESSAGES.UPDATE_SUCCESS,
//                   "OK",
//                   ["mycssSnackbarGreen"]
//                 );
//               } else {
//                 this.loader = false;
//                 this.snackbar.openSnackBar(resp["message"], "OK", [
//                   "mycssSnackbarRed",
//                 ]);
//               }
//             },
//             (error) => {
//               this.loader = false;
//               this.snackbar.showErrors(error);
//             }
//           );
//       });
//   }

//   checkRecap(type: string): void {
//     if (type == "new") {
//       this.addItems();
//     } else if (type == "edit") {
//       this.updateItems();
//     }
//   }

//   // File handling
//   selectOnFile(evt: any, type: string, name: string): void {
//     const accept = [".png", ".PNG", ".jpg", ".JPG"];
//     const extension = "une image";

//     for (const file of evt.target.files) {
//       const index = file.name.lastIndexOf(".");
//       const strsubstring = file.name.substring(index, file.name.length);

//       if (accept.indexOf(strsubstring) === -1) {
//         this.snackbar.openSnackBar(
//           MESSAGES.FILE_ERROR + file.name + " n'est " + extension,
//           "OK",
//           ["mycssSnackbarRed"]
//         );
//         return;
//       } else {
//         const reader = new FileReader();
//         reader.onload = (e: any) => {
//           const img = new Image();
//           img.src = e.target.result;
//           this.saveStoreFile(file);
//         };
//         reader.readAsDataURL(file);
//       }
//     }
//   }

//   saveStoreFile(file: File): void {
//     let formData = new FormData();
//     formData.append("file", file);
//     this.changeDetectorRefs.detectChanges();
//     this.loader = true;
    
//     this.clientServive
//       .saveStoreFile(formData)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (resp) => {
//           if (resp) {
//             this.imageToff = `${this.urlImage + resp["fileName"]}`;
//             this.initForm.get("photoPap").setValue(this.imageToff);
//             this.snackbar.openSnackBar(
//               MESSAGES.FILE_UPLOAD_SUCCESS + file.name,
//               "OK",
//               ["mycssSnackbarGreen"]
//             );
//           }
//           this.loader = false;
//         },
//         (error) => {
//           console.error("Error uploading file:", error);
//           this.snackbar.showErrors(error);
//           this.loader = false;
//         }
//       );
//   }

//   openImageModal(imageUrl: string): void {
//     if (imageUrl) {
//       this._matDialog.open(ImageModalComponent, {
//         data: { imageUrl: imageUrl },
//       });
//     }
//   }

//   // Contact management
//   addContact(): void {
//     this.contactForm.markAllAsTouched();
    
//     if (this.contactForm.valid) {
//       const newContact = this.contactForm.value;
//       this.contacts.data = [...this.contacts.data, newContact];
//       this.contactForm.reset();
//       this.contactForm.setValue({
//         codeCoProprietaire: "",
//         nomComplet: "",
//         infoComplementaire: "",
//         sexeCoProprietaire: "",
//         contactTelephonique: "",
//       });
//     }
//   }

//   // Stepper navigation
//   goToStep(index: number): void {
//     this.stepper.selectedIndex = index;
//   }

//   nextStep(stepper: MatStepper): void {
//     const currentStep = stepper.selectedIndex;

//     switch (currentStep) {
//       case 0:
//         this.validateStep1();
//         break;
//       case 1:
//         this.validateStep2();
//         break;
//       case 2:
//         this.validateStep3();
//         break;
//       case 4:
//         this.validateStep5();
//         break;
//     }

//     if (this.isStepValid(currentStep)) {
//       stepper.next();
//     }
//   }

//   // Validation methods
//   validateStep1(): void {
//     const step1Controls = [
//       "prenom",
//       "nom",
//       "sexe",
//       "codePap",
//       "nationalite",
//       "situationMatrimoniale",
//       "commune",
//       "departement",
//       "nombreParcelles",
//     ];
//     this.markControlsAsTouched(step1Controls);
//   }

//   validateStep2(): void {
//     const step2Controls = [
//       "codeParcelle",
//       "superficie",
//       "evaluationPerte",
//       "perteTotaleArbre",
//       "caracteristiqueParcelle",
//     ];
//     this.markControlsAsTouched(step2Controls);
//   }

//   validateStep3(): void {
//     const step3Controls = [
//       "statutPap",
//       "vulnerabilite",
//       "typePni",
//       "numeroPni",
//       "surnom",
//       "numeroTelephone",
//       "membreFamilial",
//       "membreFamilialHandicape",
//     ];
//     this.markControlsAsTouched(step3Controls);
//   }

//   validateStep5(): void {
//     const step5Controls = [
//       "perteEquipement",
//       "perteBatiment",
//       "perteCloture",
//       "perteRevenue",
//       "fraisDeplacement",
//       "appuiRecolalisation",
//       "perteTotale",
//       "optionPaiement",
//     ];
//     this.markControlsAsTouched(step5Controls);
//   }

//   markControlsAsTouched(controls: string[]): void {
//     controls.forEach((control) => {
//       this.initForm.get(control)?.markAsTouched();
//     });
//   }

//   isStepValid(stepIndex: number): boolean {
//     switch (stepIndex) {
//       case 0:
//         return (
//           this.initForm.get("prenom")?.valid &&
//           this.initForm.get("nom")?.valid &&
//           this.initForm.get("sexe")?.valid &&
//           this.initForm.get("codePap")?.valid &&
//           this.initForm.get("nationalite")?.valid &&
//           this.initForm.get("situationMatrimoniale")?.valid &&
//           this.initForm.get("commune")?.valid &&
//           this.initForm.get("departement")?.valid &&
//           this.initForm.get("nombreParcelles")?.valid
//         );
//       case 1:
//         return (
//           this.initForm.get("codeParcelle")?.valid &&
//           this.initForm.get("superficie")?.valid &&
//           this.initForm.get("evaluationPerte")?.valid &&
//           this.initForm.get("caracteristiqueParcelle")?.valid
//         );
//       case 2:
//         return (
//           this.initForm.get("statutPap")?.valid &&
//           this.initForm.get("vulnerabilite")?.valid
//         );
//       case 3:
//         return this.contacts.data.length >= 0;
//       case 4:
//         return (
//           this.initForm.get("optionPaiement")?.valid
//         );
//       default:
//         return false;
//     }
//   }
// }
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
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
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
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
import { MatTableDataSource } from "@angular/material/table";
import { ImageModalComponent } from "src/app/shared/image-modal.component";
import { LoaderComponent } from "src/app/shared/loader/loader.component";
import { Subject, takeUntil } from "rxjs";
import { DialogHeaderComponent } from "src/app/shared/refactore/dialog-header/dialog-header.component";

// Messages constants
const MESSAGES = {
  ADD_CONFIRM: "Voulez-vous vraiment ajouter ce pap habitat ?",
  UPDATE_CONFIRM: "Voulez-vous vraiment modifier cette personne affectée ?",
  ADD_SUCCESS: "Pap habitat ajouté avec succés",
  UPDATE_SUCCESS: "Personne affectée modifiée avec succés",
  FILE_UPLOAD_SUCCESS: "Fichier chargé avec succès : ",
  FILE_ERROR: "Ce fichier n'est ",
  FIELD_REQUIRED: "Le champ est obligatoire",
} as const;

@Component({
  selector: "app-add-pap-habitat",
  standalone: true,
  templateUrl: "./add-pap-habitat.component.html",
  styleUrl: "./add-pap-habitat.component.css",
  imports: [
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
export class AddPapHabitatComponent implements OnInit, OnDestroy {
  @ViewChild("stepper") private stepper: MatStepper;

  // Form
  initForm: UntypedFormGroup;
  contactForm: FormGroup;

  // UI State
  dialogTitle: string;
  labelButton: string;
  loader: boolean = false;
  action: string;

  // Data
  id: string;
  currentProjectId: any;
  imageToff: any;
  readonly url = "databasePapHabitat";
  readonly urlImage = environment.apiUrl + "image/getFile/";

  // Table
  displayedColumns: string[] = ["nom", "prenom", "sexe", "telephone"];
  contacts = new MatTableDataSource<any>();

  // Options
  sexeOptions = [
    { id: "M", name: "Masculin" },
    { id: "F", name: "Féminin" },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    public matDialogRef: MatDialogRef<AddPapHabitatComponent>,
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
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
      this.initForm.get("sexe").setValue(_data.data.sexe);
      
      if (_data.data?.coProprietaire) {
        this.contacts.data.push(_data.data.coProprietaire);
        this.contacts._updateChangeSubscription();
      }
    }

    this.dialogTitle = this.labelButton + " un pap habitat";
    this.createCoProprietaire();
  }

  ngOnInit(): void {
    this.createCoProprietaire();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Form initialization
  initForms(donnees?: any): void {
    this.initForm = this.fb.group({
      prenom: [donnees?.prenom || "", Validators.required],
      nom: [donnees?.nom || "", Validators.required],
      sexe: [donnees?.sexe || "", Validators.required],
      codePap: [donnees?.codePap || "", Validators.required],
      nationalite: [donnees?.nationalite || "", Validators.required],
      langueParlee: [donnees?.langueParlee || "", Validators.required],
      situationMatrimoniale: [donnees?.situationMatrimoniale || "", Validators.required],
      commune: [donnees?.commune || "", Validators.required],
      departement: [donnees?.departement || "", Validators.required],
      codeHabitat: [donnees?.codeHabitat || "", Validators.required],
      typeHabitat: [donnees?.typeHabitat || "", Validators.required],
      superficieHabitat: [donnees?.superficieHabitat || "", Validators.required],
      nombrePieces: [donnees?.nombrePieces || 0, Validators.required],
      etatHabitat: [donnees?.etatHabitat || "", Validators.required],
      materiauxConstruction: [donnees?.materiauxConstruction || "", Validators.required],
      evaluationPerte: [donnees?.evaluationPerte || "", Validators.required],
      statutPap: [donnees?.statutPap || "", Validators.required],
      vulnerabilite: [donnees?.vulnerabilite || "", Validators.required],
      typePni: [donnees?.typePni || ""],
      numeroPni: [donnees?.numeroPni || ""],
      surnom: [donnees?.surnom || ""],
      numeroTelephone: [donnees?.numeroTelephone || ""],
      membreFoyer: [donnees?.membreFoyer || ""],
      membreFoyerHandicape: [donnees?.membreFoyerHandicape || ""],
      vulne: [donnees?.vulne || ""],
      perteEquipement: [donnees?.perteEquipement || 0],
      perteTotale: [donnees?.perteTotale || 0],
      informationsEtendues: [donnees?.informationsEtendues || ""],
      photoPap: [donnees?.photoPap || null],
      photoHabitat: [donnees?.photoHabitat || null],
      pointGeometriques: [donnees?.pointGeometriques || null],
      description: [donnees?.description || null],
      niveauEtude: [donnees?.niveauEtude || null],
      religion: [donnees?.religion || null],
      optionPaiement: [donnees?.optionPaiement || "", Validators.required],
      projectId: [
        donnees?.projectId || (this.currentProjectId ? +this.currentProjectId : null),
        [Validators.required]
      ],
      coProprietaire: [donnees?.coProprietaire || null],
      typeHandicape: [donnees?.typeHandicape || ""],
    });
  }

  createCoProprietaire(): void {
    this.contactForm = this.fb.group({
      codeCoProprietaire: ["", Validators.required],
      nomComplet: ["", Validators.required],
      infoComplementaire: ["", Validators.required],
      sexeCoProprietaire: ["", Validators.required],
      contactTelephonique: ["", Validators.required],
    });
  }

  // CRUD Operations
  addItems(): void {
    this.snackbar
      .showConfirmation(MESSAGES.ADD_CONFIRM)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          
          this.coreService
            .addItemWithProject([value], this.url, this.currentProjectId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (resp) => {
                if (resp["responseCode"] == 201) {
                  this.snackbar.openSnackBar(MESSAGES.ADD_SUCCESS, "OK", [
                    "mycssSnackbarGreen",
                  ]);
                  this.loader = false;
                  this.matDialogRef.close(resp["data"]);
                  this.changeDetectorRefs.markForCheck();
                } else {
                  this.loader = false;
                  this.changeDetectorRefs.markForCheck();
                }
              },
              (error) => {
                console.log(error);
                this.loader = false;
                this.changeDetectorRefs.markForCheck();
                this.snackbar.showErrors(error.message);
              }
            );
        }
      });
  }

  updateItems(): void {
    this.snackbar
      .showConfirmation(MESSAGES.UPDATE_CONFIRM)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          
          this.coreService
            .updateItem(value, this.id, this.url)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (resp) => {
                if (resp) {
                  this.loader = false;
                  this.matDialogRef.close(resp);
                  this.snackbar.openSnackBar(
                    MESSAGES.UPDATE_SUCCESS,
                    "OK",
                    ["mycssSnackbarGreen"]
                  );
                } else {
                  this.loader = false;
                  this.snackbar.openSnackBar(resp["message"], "OK", [
                    "mycssSnackbarRed",
                  ]);
                }
              },
              (error) => {
                this.loader = false;
                this.snackbar.showErrors(error);
              }
            );
        }
      });
  }

  checkRecap(type: string): void {
    if (type == "new") {
      this.addItems();
    } else if (type == "edit") {
      this.updateItems();
    }
  }

  // File handling
  selectOnFile(evt: any, type: string, name: string): void {
    const accept = [".png", ".PNG", ".jpg", ".JPG"];
    const extension = "une image";

    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);

      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          MESSAGES.FILE_ERROR + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const img = new Image();
          img.src = e.target.result;
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
    
    this.clientServive
      .saveStoreFile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (resp) => {
          if (resp) {
            this.imageToff = `${this.urlImage + resp["fileName"]}`;
            this.initForm.get("photoPap").setValue(this.imageToff);
            this.snackbar.openSnackBar(
              MESSAGES.FILE_UPLOAD_SUCCESS + file.name,
              "OK",
              ["mycssSnackbarGreen"]
            );
          }
          this.loader = false;
        },
        (error) => {
          console.log(error);
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

  // Contact management
  addContact(): void {
    this.contactForm.markAllAsTouched();
    
    if (this.contactForm.valid) {
      const newContact = this.contactForm.value;
      this.contacts.data = [...this.contacts.data, newContact];
      this.contactForm.reset();
      this.contactForm.setValue({
        codeCoProprietaire: "",
        nomComplet: "",
        infoComplementaire: "",
        sexeCoProprietaire: "",
        contactTelephonique: "",
      });
    }
  }

  // Stepper navigation
  goToStep(index: number): void {
    this.stepper.selectedIndex = index;
  }

  /**
   * Gère la navigation vers l'étape suivante.
   * Valide l'étape actuelle avant de passer à la suivante.
   */
  nextStep(stepper: MatStepper): void {
    const currentStep = stepper.selectedIndex;

    switch (currentStep) {
      case 0:
        this.validateStep1();
        break;
      case 1:
        this.validateStep2();
        break;
      case 2:
        this.validateStep3();
        break;
      case 4:
        this.validateStep5();
        break;
    }

    if (this.isStepValid(currentStep)) {
      stepper.next();
    }
  }

  // Validation methods
  /**
   * Valide l'étape 1 : Informations personnelles.
   */
  validateStep1(): void {
    const step1Controls = [
      "prenom",
      "nom",
      "sexe",
      "codePap",
      "nationalite",
      "situationMatrimoniale",
      "commune",
      "departement",
    ];
    this.markControlsAsTouched(step1Controls);
  }

  /**
   * Valide l'étape 2 : Informations sur l'habitat.
   */
  validateStep2(): void {
    const step2Controls = [
      "codeHabitat",
      "typeHabitat",
      "superficieHabitat",
      "nombrePieces",
      "etatHabitat",
      "materiauxConstruction",
      "evaluationPerte",
    ];
    this.markControlsAsTouched(step2Controls);
  }

  /**
   * Valide l'étape 3 : Documents et détails supplémentaires.
   */
  validateStep3(): void {
    const step3Controls = [
      "statutPap",
      "vulnerabilite",
      "typePni",
      "numeroPni",
      "surnom",
      "numeroTelephone",
      "membreFoyer",
      "membreFoyerHandicape",
    ];
    this.markControlsAsTouched(step3Controls);
  }

  /**
   * Valide l'étape 5 : Pertes et indemnisation.
   */
  validateStep5(): void {
    const step5Controls = [
      "perteEquipement",
      "perteTotale",
      "informationsEtendues",
    ];
    this.markControlsAsTouched(step5Controls);
  }

  /**
   * Marque les contrôles spécifiés comme "touchés" pour afficher les erreurs de validation.
   */
  markControlsAsTouched(controls: string[]): void {
    controls.forEach((control) => {
      this.initForm.get(control)?.markAsTouched();
    });
  }

  /**
   * Vérifie si l'étape actuelle est valide.
   */
  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return (
          this.initForm.get("prenom")?.valid &&
          this.initForm.get("nom")?.valid &&
          this.initForm.get("sexe")?.valid &&
          this.initForm.get("codePap")?.valid &&
          this.initForm.get("nationalite")?.valid &&
          this.initForm.get("situationMatrimoniale")?.valid &&
          this.initForm.get("commune")?.valid &&
          this.initForm.get("departement")?.valid
        );
      case 1:
        return (
          this.initForm.get("codeHabitat")?.valid &&
          this.initForm.get("typeHabitat")?.valid &&
          this.initForm.get("superficieHabitat")?.valid &&
          this.initForm.get("nombrePieces")?.valid &&
          this.initForm.get("etatHabitat")?.valid &&
          this.initForm.get("materiauxConstruction")?.valid &&
          this.initForm.get("evaluationPerte")?.valid
        );
      case 2:
        return (
          this.initForm.get("statutPap")?.valid &&
          this.initForm.get("vulnerabilite")?.valid &&
          this.initForm.get("typePni")?.valid &&
          this.initForm.get("numeroPni")?.valid &&
          this.initForm.get("surnom")?.valid &&
          this.initForm.get("numeroTelephone")?.valid &&
          this.initForm.get("membreFoyer")?.valid &&
          this.initForm.get("membreFoyerHandicape")?.valid
        );
      case 3:
        return this.contacts.data.length >= 0;
      case 4:
        return (
          this.initForm.get("perteEquipement")?.valid &&
          this.initForm.get("perteTotale")?.valid &&
          this.initForm.get("informationsEtendues")?.valid
        );
      default:
        return false;
    }
  }
}