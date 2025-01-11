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
import { MoService } from "src/app/core/services/mo.service";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { AddComponent } from "../../tasks/add/add.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { Image } from "src/app/shared/models/image.model";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { environment } from "src/environments/environment";
import {provideNativeDateAdapter} from '@angular/material/core';

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
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    // { provide: DateAdapter, useClass: MatNativeDateModule },
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
  countries: any;
  signature = "";

  nrSelect;
  situationsMatrimoniales: string[] ;
  typeIdentifications: any = [];
  capaciteJuridiques: any;
  dateDelivrance;
  regimeMatrimoniaux: any;
  professions: any;
  loader: boolean;
  action: string;
  minBirthDay: any;
  today = new Date();
  loaderss = false;
  fields: any;
  canAdd: boolean;
  dataCheck;
  url = "users/createConsultant";
  hasPhoneError: boolean;
  currentValue: any;
  countryChange: boolean = false;
  eventNumber: any;
  isFocus: unknown;
  noImage = "";
  errorCNI;
  newDate = new Date();
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  isValidOnWhatsApp: boolean = true;
  ng2TelOptions;
  idPiece;
  listeNoire: boolean = false;
  categoriePartieInteresses: any;
  uploadedImage!: File;
  imageURL: string | undefined;
  urlImage = environment.apiUrl + "image/getFile/";
  readonly labelPosition = model<"before" | "after">("after");
  categories: any[] = [
    { id: "1", libelle: "Agricole" },
    { id: "2", libelle: "Miniere" },
  ];
  sexe = [
    { id: "1", value: "Masculin" },
    { id: "2", value: "Feminin" },
  ];

  ngOnInit(): void {
    this.getListPays();
    this.situationsMatrimoniales = [
      "Célibataire",
      "Marié(e)",
      "Divorcé(e)",
      "Veuf/Veuve",
    ];
    //this.getListSituationsMatrimoniales();
  }
  constructor(
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private clientService: ClientVueService,
    private moservice: MoService,
    private _matDialog: MatDialog,
    private localService: LocalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private clientServive: ClientVueService
  ) {
    this.currentUser = this.localService.getDataJson("user");
    this.signature = "assets/images/noImage.png";
    // console.log("user connecter",this.currentUser)
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
      const imageToEdit = _data.data.image;
      // console.log("is",_data.data.image.type);

      if (imageToEdit) {
        document.querySelectorAll("#member-img").forEach((element: any) => {
          element.src = this.getImageFromBase64(
            imageToEdit.type,
            imageToEdit.image
          );
        });
        const image: any = this.getImageFromBase64(
          imageToEdit.type,
          imageToEdit.image
        );
        const file = this.base64ToFile(image, imageToEdit.name);
        this.uploadedImage = file;
      }
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

  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  base64ToFile(base64String: string, fileName: string): File {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }

  currentUser: any;

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
      isRecensed: this.fb.control(donnees ? donnees?.isRecensed : null, [
        Validators.required,
      ]),
      typeIdentification: this.fb.control(
        donnees ? donnees?.typeIdentification : null,
        [Validators.required]
      ),
      numeroIdentification: this.fb.control(
        donnees ? donnees?.numeroIdentification : null,
        [Validators.required]
      ),
      //secondStep
      date_of_birth: this.fb.control(donnees ? donnees?.date_of_birth : null, [
        Validators.required,
      ]),
      place_of_birth: this.fb.control(
        donnees ? donnees?.place_of_birth : null,
        [Validators.required]
      ),
      projectId: this.fb.control(
        this.currentUser.projects ? this.currentUser.projects[0]?.id : null,
        [Validators.required]
      ),
      contact: this.fb.control(donnees ? donnees?.contact : null, [
        Validators.required,
      ]),

      prenom: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required,
      ]),
      nom: this.fb.control(donnees ? donnees?.nom : null, [
        Validators.required,
      ]),
      codePap: this.fb.control(donnees ? donnees?.codePap : null, [
        Validators.required,
      ]),
      dateNaissance: this.fb.control(donnees ? donnees?.dateNaissance : null, [
        Validators.required,
      ]),
      lieuNaissance: this.fb.control(donnees ? donnees?.lieuNaissance : null, [
        Validators.required,
      ]),

      vulnerabilite: this.fb.control(donnees ? donnees?.vulnerabilite : null, [
        Validators.required,
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
        Validators.required,
      ]),

      recommandation: this.fb.control(
        donnees ? donnees?.recommandation : null,
        [Validators.required]
      ),
      etat: this.fb.control(donnees ? donnees?.etat : null, [
        Validators.required,
      ]),
      documentUrls: this.fb.array(
        donnees && donnees.documentUrls
          ? donnees.documentUrls.map((url) => this.fb.control(url))
          : [],
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
          this.coreService
            .updateItem(value, this.id, "users/updateConsultant")
            .subscribe(
              (resp) => {
                if (resp) {
                  this.loader = false;
                  this.matDialogRef.close(resp);
                  this.snackbar.openSnackBar(
                    "Consultant  modifié avec succés",
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

  getCategorie(value: any) {
    if (this.categoriePartieInteresses) {
      const liste = this.categoriePartieInteresses.filter(
        (type) => type.id == value
      );
      return liste.length != 0 ? liste[0]?.libelle : value;
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

  // saveFile(file, type, name) {
  //   let formData = new FormData();
  //   formData.append("file", file);

  //   this.loaderImg = true;
  //   this.changeDetectorRefs.detectChanges();
  //   const dataFile = { file: file };
  //   this.clientService.saveStoreFile("store-file", formData).subscribe(
  //     (resp) => {
  //       if (resp) {
  //         this.noImage = resp["urlprod"];
  //         this.initForm.get(name).setValue(this.noImage);
  //         this.loaderImg = false;
  //         this.changeDetectorRefs.detectChanges();
  //         this.snackbar.openSnackBar("Fichier chargé avec succès", "OK", [
  //           "mycssSnackbarGreen",
  //         ]);
  //       }
  //     },
  //     (error) => {
  //       this.loaderImg = false;
  //       this.snackbar.showErrors(error);
  //     }
  //   );
  // }

  // Fin file sun telecom

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
    // Logique pour supprimer l'image sélectionnée
    // Par exemple, réinitialisation de l'image à une image par défaut
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
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment crée cette plainte `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.addItem(value, "plaintes").subscribe(
            (resp) => {
              if (resp["responseCode"] == 201) {
                this.snackbar.openSnackBar(
                  "plainte  ajoutée avec succés",
                  "OK",
                  ["mycssSnackbarGreen"]
                );
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
              console.log("====================================");
              console.log(error);
              console.log("====================================");
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  getNationalite(value: any) {
    if (this.countries) {
      const liste = this.countries.filter((type) => type.id == value);
      return liste.length != 0 ? liste[0]?.nationalite : value;
    }
  }



  getcapaciteJuridique(value: any) {
    if (this.capaciteJuridiques) {
      const liste = this.capaciteJuridiques.filter((type) => type.id == value);
      return liste.length != 0 ? liste[0]?.libelle : value;
    }
  }

  getpays(value: any) {
    if (this.countries) {
      const liste = this.countries.filter((type) => type.id == value);
      return liste.length != 0 ? liste[0]?.nom : value;
    }
  }

  gettypeIdentification(value: any) {
    if (this.typeIdentifications) {
      const liste = this.typeIdentifications.filter((type) => type.id == value);
      return liste.length != 0 ? liste[0]?.libelle : value;
    }
  }

  firstStep() {
    if (
      this.initForm.get("prenom").invalid ||
      this.initForm.get("nom").invalid ||
      this.initForm.get("dateNaissance").invalid ||
      this.initForm.get("lieuNaissance").invalid ||
      this.initForm.get("departementNaissance").invalid ||
      this.initForm.get("pays").invalid ||
      this.initForm.get("nationalite").invalid ||
      this.initForm.get("situationMatrimoniale").invalid ||
      this.initForm.get("capaciteJuridique").invalid ||
      this.initForm.get("nonVoyant").invalid ||
      this.initForm.get("illettre").invalid ||
      this.initForm.get("descriptionBienAffecte").invalid
    ) {
      return false;
    } else {
      return true;
    }
  }

  secondStep() {
    if (
      this.initForm.get("typeIdentification").invalid ||
      this.initForm.get("numeroIdentification").invalid ||
      this.initForm.get("dateDelivrancePiece").invalid ||
      this.initForm.get("dateValiditePiece").invalid ||
      this.initForm.get("paysDelivrancePiece").invalid ||
      this.initForm.get("lieuDelivrancePiece").invalid ||
      this.initForm.get("prenomPere").invalid ||
      this.initForm.get("prenomMere").invalid ||
      this.initForm.get("nomMere").invalid ||
      this.initForm.get("prenomPersonneContact").invalid ||
      this.initForm.get("nomPersonneContact").invalid ||
      this.initForm.get("emailPersonneContact").invalid ||
      this.initForm.get("numeroTelephonePersonneContact").invalid
    ) {
      return false;
    } else {
      return true;
    }
  }

  getListPays() {
    this.coreService.list("pays", 0, 10000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.countries = response["data"];
        console.log("countries", this.countries);

        this.nrSelect = response["data"]
          .filter((el) => el.codeAlpha2 == "SN" || el.codeAlpha2 == "SEN")
          .map((e) => e.id)[0];
        this.initForm.get("pays").setValue(this.nrSelect);

        this.changeDetectorRefs.markForCheck();
      }
    });
  }

  getListSituationsMatrimoniales() {
    this.coreService
      .list("situation-matrimoniale", 0, 10000)
      .subscribe((response) => {
        console.log(response);
        // alert("Please select")

        if (response["responseCode"] === 200) {
          this.situationsMatrimoniales = response["data"];
          this.changeDetectorRefs.markForCheck();
        }
      });
  }

  getRegimeBySituation(situation) {
    if (situation) {
      this.regimeMatrimoniaux = situation.regimesMatrimonials;
    }
  }

  getListtypeIdentifications() {
    this.coreService.list("nature-piece", 0, 10000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.typeIdentifications = response["data"];
        this.changeDetectorRefs.markForCheck();
      }
    });
  }

  getListCapaciteJuridiques() {
    this.coreService
      .list("capacite-juridique", 0, 10000)
      .subscribe((response) => {
        if (response["responseCode"] === 200) {
          this.capaciteJuridiques = response["data"];
          this.changeDetectorRefs.markForCheck();
        }
      });
  }

  getListProfession() {
    this.coreService.list("profession", 0, 10000).subscribe((response) => {
      if (response) {
        this.professions = response["data"];
        this.changeDetectorRefs.markForCheck();
      }
    });
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
  listNoire(event?) {
    this.listeNoire = true;
    const montant = 0;
    const compte = 0;
    this.changeDetectorRefs.markForCheck();
    const data = {
      compte: compte,
      montant: montant,
    };
    if (montant && compte) {
      this.coreService.addItem(data, "verifier-liste-noire").subscribe(
        (response) => {
          if (response["responseCode"] === 200) {
            this.listeNoire = true;
          } else if (response["responseCode"] === 400) {
            this.listeNoire = false;
          }
        },
        (error) => {
          if (error.status == 400) {
            this.listeNoire = false;
            this.changeDetectorRefs.markForCheck();
          } else if (error.status == 200) {
            this.listeNoire = true;
          }
        }
      );
    }
  }
  uploadedFiles: File[] = [];
  selectOnFile1(event: any, type: string, format: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Ajoutez la logique pour gérer les fichiers ici.
          // Par exemple, vous pouvez ajouter les fichiers à une liste et afficher les vignettes.
          console.log(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }
  selectOnFile(evt, type, name) {
    let accept = [];
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".jpg"];
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
          if (type === "photo_profile") {
            const img = new Image();
            img.src = e.target.result;
            const docBase64Path = e.target.result;
            console.log("====================================");
            console.log("base");
            console.log("====================================");
            this.saveStoreFile(file).then((signatureUrl) => {
              if (signatureUrl) {
                fileUrls.push(signatureUrl);
                this.updateFileUrls(fileUrls);
              }
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  saveStoreFile(file) {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append("file", file);

      this.clientServive
        .saveStoreFile("image/uploadFileDossier", formData)
        .subscribe(
          (resp) => {
            if (resp) {
              console.log("====================================");
              console.log(resp);
              console.log("====================================");
              //   const signatureUrl = resp["data"];
              const signatureUrl = `${this.urlImage + resp["data"]}`;
              resolve(signatureUrl);
            }
          },
          (error) => {
            console.log(error);
            this.snackbar.showErrors(error);
            reject(error);
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

  etats: string[] = ["Résolu", "En Attente", "En Cours"];
}
