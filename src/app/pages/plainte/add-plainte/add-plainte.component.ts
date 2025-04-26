import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  model,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { AddComponent } from "../../tasks/add/add.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { environment } from "src/environments/environment";
import { provideNativeDateAdapter } from "@angular/material/core";
import { SignatureComponent } from "../../entente-compensation/signature/signature.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { ImageModalComponent } from "src/app/shared/image-modal.component";

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
  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " une plainte";
  signature = "";
  situationsMatrimoniales: string[];
  typeIdentifications: any = [];
  loader: boolean = false;
  action: string;
  today = new Date();
  canAdd: boolean;
  errorCNI;
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  ng2TelOptions;
  categoriePartieInteresses: any;
  uploadedImage!: File;
  imageURL: string | undefined;
  // urlImage = environment.apiUrl + "image/getFile/";
  urlImage = environment.apiUrl + "fileAws/download/";
  isLoading: boolean = false;

  sexe = [
    { id: "1", value: "Masculin" },
    { id: "2", value: "Feminin" },
  ];

  ngOnInit(): void {
    this.situationsMatrimoniales = [
      "Célibataire",
      "Marié(e)",
      "Divorcé(e)",
      "Veuf/Veuve",
    ];
  }
  constructor(
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private localService: LocalService,
    private clientServive: ClientVueService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.signature = "assets/images/noImage.png";
    // console.log("user connecter",this.currentProjectId)
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
    }

    this.action = _data?.action;
    this.canAdd = _data.canAdd;
    this.dialogTitle = this.labelButton + this.suffixe;
    this.ng2TelOptions = { initialCountry: "sn" };
  }

  checkValidOnWhatsApp(event: any): void {
    const value = event.value;
    this.initForm.get("statutVulnerable")?.setValue(value);
  }

  // getImageFromBase64(imageType: string, imageName: number[]): string {
  //   const base64Representation = "data:" + imageType + ";base64," + imageName;
  //   return base64Representation;
  // }

  currentProjectId: any;

  initForms(donnees?) {
    //firstep
    this.initForm = this.fb.group({
      libelleProjet: this.fb.control(donnees ? donnees?.libelleProjet : null, [
        Validators.required,
      ]),
      numeroDossier: this.fb.control(donnees ? donnees?.numeroDossier : null, [
        Validators.required,
      ]),
      lieuEnregistrement: this.fb.control(
        donnees ? donnees?.lieuEnregistrement : null,
        [Validators.required]
      ),
      dateEnregistrement: this.fb.control(
        donnees ? donnees?.dateEnregistrement : null,
        [Validators.required]
      ),
      isRecensed: this.fb.control(donnees ? donnees?.isRecensed : null, []),
      isSignedFileRecensement: this.fb.control(
        donnees ? donnees?.isSignedFileRecensement : null,
        []
      ),
      dateRecensement: this.fb.control(
        donnees ? donnees?.dateRecensement : null,
        [Validators.required]
      ),

      natureBienAffecte: this.fb.control(
        donnees ? donnees?.natureBienAffecte : null,
        [Validators.required]
      ),
      emplacementBienAffecte: this.fb.control(
        donnees ? donnees?.emplacementBienAffecte : null,
        [Validators.required]
      ),
      typeIdentification: this.fb.control(
        donnees ? donnees?.typeIdentification : null,
        [Validators.required]
      ),
      numeroIdentification: this.fb.control(
        donnees ? donnees?.numeroIdentification : null,
        [Validators.required]
      ),
      //secondStep

      projectId: this.fb.control(
        this.currentProjectId ? this.currentProjectId : null,
        [Validators.required]
      ),
      contact: this.fb.control(donnees ? donnees?.contact : null, [
        Validators.required
      ]),

      prenom: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required
      ]),
      sexe: this.fb.control(donnees ? donnees?.sexe : null, [
        Validators.required
      ]),
      nom: this.fb.control(donnees ? donnees?.nom : null, [
        Validators.required
      ]),
      codePap: this.fb.control(donnees ? donnees?.codePap : null, [
        Validators.required
      ]),

      vulnerabilite: this.fb.control(donnees ? donnees?.vulnerabilite : null, [
        Validators.required
      ]),

      email: this.fb.control(donnees ? donnees?.email : null, [
        Validators.required
      ]),

      situationMatrimoniale: this.fb.control(
        donnees ? donnees?.situationMatrimoniale : null,
        [Validators.required]
      ),
      descriptionObjet: this.fb.control(
        donnees ? donnees?.descriptionObjet : null,
        [Validators.required]
      ),
      hasDocument: this.fb.control(donnees ? donnees?.hasDocument : null, [
        Validators.required
      ]),

      recommandation: this.fb.control(
        donnees ? donnees?.recommandation : null,
        [Validators.required]
      ),
      etat: this.fb.control(donnees ? donnees?.etat : null, [
        Validators.required
      ]),
      documentUrls: this.fb.array(
        donnees && donnees.documentUrls
          ? donnees.documentUrls.map((url) => this.fb.control(url))
          : [],
        [Validators.required]
      ),
      urlSignaturePap: this.fb.control(
        donnees ? donnees?.urlSignaturePap : null,
        [Validators.required]
      ),
      urlSignatureResponsable: this.fb.control(
        donnees ? donnees?.urlSignatureResponsable : null,
        [Validators.required]
      ),
    });
  }

  get phoneValue() {
    return this.initForm.controls["numeroTelephonePersonneContact"];
  }

  checkValidity(g: UntypedFormGroup) {
    Object.keys(g.controls).forEach((key) => {
      g.get(key).markAsDirty();
    });
    Object.keys(g.controls).forEach((key) => {
      g.get(key).markAsTouched();
    });
    Object.keys(g.controls).forEach((key) => {
      g.get(key).updateValueAndValidity();
    });
  }

  updatePlainte() {
    console.log(this.initForm.value);
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment modifier ce consultant `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.updateItem(value, this.id, "plaintes").subscribe(
            (resp) => {
              if (resp) {
                this.loader = false;
                this.matDialogRef.close(resp);
                this.snackbar.openSnackBar(
                  "Plainte  modifié avec succés",
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

  checkRecap(type) {
    if (type == "new") {
      this.addItems();
    } else if (type == "edit") {
      this.updatePlainte();
    }
  }

  checkCNI() {
    this.errorCNI = "";
    const fieldCNI = "numeroIdentification";
    if (
      this.initForm.get(fieldCNI).value &&
      this.initForm.get("typeIdentification").value
    ) {
      const cni = this.initForm.get(fieldCNI).value.toString();
      const taille = cni.length;
      const type = this.initForm.get("typeIdentification").value;
      const nombreCaractereMin = this.typeIdentifications.find(
        (piece) => piece?.id == type
      )?.nombreCaractereMin;
      const nombreCaractereMax = this.typeIdentifications.find(
        (piece) => piece?.id == type
      )?.nombreCaractereMax;
      if (taille < nombreCaractereMin || taille > nombreCaractereMax) {
        this.errorCNI = `Le numéro de pièce doit contenir ${nombreCaractereMin} ou ${nombreCaractereMax} caractères`;
      }
    }
  }

  //file sun telecom

  fileSelected;
  loaderImg = false;
  dialogRef: any;

  signatureClient(val: string): void {
    this.dialogRef = this._matDialog.open(SignatureComponent, {
      autoFocus: true,
      width: "35rem",
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: "new",
      },
    });
    this.dialogRef.afterClosed().subscribe((signatureUrl) => {
      if (signatureUrl) {
        this.initForm.get(val).setValue(signatureUrl);
      }
    });
  }

  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    let file: File = fileList.files[0];
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll("#member-img").forEach((element: any) => {
        element.src = this.imageURL;
      });
    };
    reader.readAsDataURL(file);
  }

  deleteImage() {
    document
      .getElementById("member-img")
      .setAttribute("src", "assets/images/users/user-dummy-img.jpg");
    // Réinitialisation de l'input de type fichier pour effacer la sélection
    const inputElement = document.getElementById(
      "member-image-input"
    ) as HTMLInputElement;
    inputElement.value = "";
    this.uploadedImage = null;
  }

  savePlainte() {
    console.log(this.initForm.value);
    return this.addItems();
  }

  addItems() {
    console.log(this.initForm.value);
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment crée cette plainte `)
      .then((result) => {
        if (result["value"] == true) {
          this.isLoading = true;
          const value = this.initForm.value;
          this.coreService.addItem(value, "plaintes").subscribe(
            (resp) => {
              if (resp["responseCode"] == 201) {
                this.snackbar.openSnackBar(
                  "plainte  ajoutée avec succés",
                  "OK",
                  ["mycssSnackbarGreen"]
                );
                this.isLoading = false;
                this.matDialogRef.close(resp["data"]);
                this.changeDetectorRefs.markForCheck();
              } else {
                this.isLoading = false;
                this.changeDetectorRefs.markForCheck();
              }
            },
            (error) => {
              this.isLoading = false;
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  gettypeIdentification(value: any) {
    if (this.typeIdentifications) {
      const liste = this.typeIdentifications.filter((type) => type.id == value);
      return liste.length != 0 ? liste[0]?.libelle : value;
    }
  }

  // checkValidity(g: UntypedFormGroup) {
  //   Object.keys(g.controls).forEach((key) => {
  //     g.get(key).markAsDirty();
  //   });
  //   Object.keys(g.controls).forEach((key) => {
  //     g.get(key).markAsTouched();
  //   });
  //   Object.keys(g.controls).forEach((key) => {
  //     g.get(key).updateValueAndValidity();
  //   });
  // }

  goToStep(index) {
    this.myStepper.selectedIndex = index;
  }

  uploadedFiles: File[] = [];
  // selectOnFile1(event: any, type: string, format: string): void {
  //   const files = event.target.files;
  //   if (files && files.length > 0) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         console.log(e.target.result);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }
  selectOnFile(evt, type, name) {
    let accept = [];
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".jpg", ".jpeg", ".JPG", ".PNG", "JPEG"];
      extension = "une image";
    }

    const files = evt.target.files;
    const fileUrls = [];

    for (const file of files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index).toLowerCase();
      const ext = strsubstring;

      if (accept.indexOf(ext) === -1) {
        this.snackbar.openSnackBar(
          `Ce fichier ${file.name} n'est pas accepté comme ${extension}`,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        this.uploadedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          //if (type === "photo_profile") {
          //const img = new Image();
          // img.src = e.target.result;
          // const docBase64Path = e.target.result;
          this.saveStoreFile(file).then((signatureUrl) => {
            if (signatureUrl) {
              fileUrls.push(signatureUrl);
              this.updateFileUrls(fileUrls);
            }
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  saveStoreFile(file) {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append("file", file);
      this.isLoading = true;
      this.clientServive.saveStoreFile(formData).subscribe(
        (resp) => {
          if (resp) {
            console.log("====================================");
            console.log(resp);
            console.log("====================================");
            //   const signatureUrl = resp["data"];
            const signatureUrl = `${this.urlImage + resp["fileName"]}`;
            resolve(signatureUrl);
          }
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
          this.snackbar.showErrors(error);
          reject(error);
          this.isLoading = false;
        }
      );
    });
  }

  documentUrls: string[] = [];
  updateFileUrls(urls: string[]) {
    const formArray = this.initForm.get("documentUrls") as FormArray;
    const currentUrls = formArray.value || [];
    const allUrls = [...currentUrls, ...urls];

    formArray.clear();
    allUrls.forEach((url) => formArray.push(this.fb.control(url)));

    // Mettez à jour `documentUrls` avec les nouvelles URLs
    this.documentUrls = allUrls;
  }

  etats: string[] = ["Résolue", "En Attente", "En Cours"];



   openImageModal(imageUrl: string) {
      if (imageUrl) {
        this._matDialog.open(ImageModalComponent, {
          data: { imageUrl: imageUrl },
        });
      }
    }








    nextStep(stepper: MatStepper) {
      const currentStep = stepper.selectedIndex;

      // Valider l'étape actuelle
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
        case 3:
          this.validateStep4();
          break;
        case 4:
          this.validateStep5();
          break;
      }

      // Passer à l'étape suivante si l'étape actuelle est valide
      if (this.isStepValid(currentStep)) {
        stepper.next();
      }
      console.log('====================================');
      console.log(currentStep)
      console.log(this.isStepValid(currentStep));
      console.log('====================================');
    }


    /**
 * Valide l'étape 1 : Préambule
 */
validateStep1() {
  const step1Controls = [
    "libelleProjet",
    "numeroDossier",
    "lieuEnregistrement",
    "dateEnregistrement",
    "isRecensed",
    "dateRecensement",
    "isSignedFileRecensement",
    "natureBienAffecte",
    "emplacementBienAffecte"
  ];
  this.markControlsAsTouched(step1Controls);
}

/**
 * Valide l'étape 2 : Informations personnelles
 */
validateStep2() {
  const step2Controls = [
    "prenom",
    "nom",
    "typeIdentification",
    "numeroIdentification",
    "sexe",
    "situationMatrimoniale",
    "contact",
    "email",
    "codePap",
    "vulnerabilite"
  ];
  this.markControlsAsTouched(step2Controls);
}

/**
 * Valide l'étape 3 : Description & Recommandation
 */
validateStep3() {
  const step3Controls = [
    "descriptionObjet",
    "hasDocument",
    "recommandation",
    "etat"
  ];
  this.markControlsAsTouched(step3Controls);
}

/**
 * Valide l'étape 4 : Signatures
 */
validateStep4() {
  const step4Controls = [
    "urlSignaturePap",
    "urlSignatureResponsable"
  ];
  this.markControlsAsTouched(step4Controls);
}

/**
 * Valide l'étape 5 : Récapitulatif
 */
validateStep5() {
  // Aucun contrôle à valider ici, car c'est une étape de récapitulatif
}


/**
 * Marque les contrôles spécifiés comme "touchés" pour afficher les erreurs de validation.
 */
markControlsAsTouched(controls: string[]) {
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
        this.initForm.get("libelleProjet")?.valid &&
        this.initForm.get("numeroDossier")?.valid &&
        this.initForm.get("lieuEnregistrement")?.valid &&
        this.initForm.get("dateEnregistrement")?.valid &&
        this.initForm.get("isRecensed")?.valid &&
        this.initForm.get("dateRecensement")?.valid &&
        this.initForm.get("isSignedFileRecensement")?.valid &&
        this.initForm.get("natureBienAffecte")?.valid &&
        this.initForm.get("emplacementBienAffecte")?.valid
      );
    case 1:
      return (
        this.initForm.get("prenom")?.valid &&
        this.initForm.get("nom")?.valid &&
        this.initForm.get("typeIdentification")?.valid &&
        this.initForm.get("numeroIdentification")?.valid &&
        this.initForm.get("sexe")?.valid &&
        this.initForm.get("situationMatrimoniale")?.valid &&
        this.initForm.get("contact")?.valid &&
        this.initForm.get("email")?.valid &&
        this.initForm.get("codePap")?.valid &&
        this.initForm.get("vulnerabilite")?.valid
      );
    case 2:
      return (
        this.initForm.get("descriptionObjet")?.valid &&
        (this.initForm.get("hasDocument") ? this.initForm.get("hasDocument").valid : true) &&
        this.initForm.get("recommandation")?.valid &&
        this.initForm.get("etat")?.valid
      );
    case 3:
      return (
        this.initForm.get("urlSignaturePap")?.valid &&
        this.initForm.get("urlSignatureResponsable")?.valid
      );
    case 4:
      return true; // L'étape de récapitulatif est toujours valide
    default:
      return false;
  }
}
}
