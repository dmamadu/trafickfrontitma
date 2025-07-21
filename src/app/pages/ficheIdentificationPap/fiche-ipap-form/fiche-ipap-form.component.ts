import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  FormGroup,
  FormArray,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import * as moment from "moment";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { DatePipe } from "@angular/common";

import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { LocalService } from "src/app/core/services/local.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
import { environment } from "src/environments/environment";
import { MatTableDataSource } from "@angular/material/table";
import { ImageModalComponent } from "src/app/shared/image-modal.component";
import { LoaderComponent } from "src/app/shared/loader/loader.component";

@Component({
  selector: 'app-fiche-ipap-form',
  standalone: true,
  templateUrl: './fiche-ipap-form.component.html',
  styleUrl: './fiche-ipap-form.component.css',
    imports: [
      MatFormFieldModule,
      MatInputModule,
      MatStepperModule,
      MatIconModule,
      LoaderComponent,
      AngularMaterialModule,
      MatDatepickerModule,
      MatNativeDateModule, //
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
export class FicheIPapFormComponent implements OnInit {

  panelOpenState = false;
    @ViewChild("drawer") drawer: MatDrawer;
    @ViewChild("stepper") private stepper: MatStepper;
    dialogTitle: string;
    id: string;
    initForm: UntypedFormGroup;
    labelButton: string;
    suffixe: string = " une personne affectée";
    nrSelect;
    situationsMatrimoniales: any;
    typeIdentifications: any = [];
    capaciteJuridiques: any;
    dateDelivrance;
    regimeMatrimoniaux: any;
    professions: any;
    loader: boolean;
    action: string;
    minBirthDay: any;
    today = new Date();
    fields: any;
    canAdd: boolean;
    dataCheck;
    url = "databasePapPlaceAffaire";
    hasPhoneError: boolean;
    currentValue: any;
    countryChange: boolean = false;
    eventNumber: any;
    isFocus: unknown;
    errorCNI;
    newDate = new Date();
    emailPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    isValidOnWhatsApp: boolean = true;
    ng2TelOptions;
    idPiece;
    listeNoire: boolean = false;
    currentProjectId: any;
  
    urlImage = environment.apiUrl + "image/getFile/";
  
    uploadedImage!: File;
  
    constructor(
      public matDialogRef: MatDialogRef<FicheIPapFormComponent>,
      @Inject(MAT_DIALOG_DATA) _data,
      private fb: UntypedFormBuilder,
      private coreService: CoreService,
      private _matDialog: MatDialog,
      private snackbar: SnackBarService,
      private changeDetectorRefs: ChangeDetectorRef,
      private localService: LocalService,
      private clientServive: ClientVueService
    ) {
      //this.currentProjectId = this.localService.getDataJson("user");
  
      this.currentProjectId = this.localService.getData("ProjectId");
  
      console.log("user connecter", this.currentProjectId);
  
      if (_data?.action == "new") {
        this.initForms();
        this.labelButton = "Ajouter ";
        this.createCoProprietaire();
      } else if (_data?.action == "edit") {
        this.labelButton = "Modifier ";
        this.id = _data.data.id;
        this.initForms(_data.data);
        console.log(_data.data);
        this.initForm.get("sexe").setValue(_data.data.sexe);
        if (_data.data?.coProprietaire) {
          this.contacts.data.push(_data.data.coProprietaire);
          this.contacts._updateChangeSubscription();
        }
      }
  
      this.contactForm = this.fb.group({
        coProprietaires: this.fb.array([]),
      });
      this.action = _data?.action;
      this.canAdd = _data.canAdd;
      this.dialogTitle = this.labelButton + this.suffixe;
      this.ng2TelOptions = { initialCountry: "sn" };
    }
    ngOnInit(): void {
      this.createCoProprietaire();
    }
  
    checkValidOnWhatsApp(event: any): void {
      const value = event.value;
      this.initForm.get("statutVulnerable")?.setValue(value);
    }
  
    goToStep(index) {
      this.stepper.selectedIndex = index;
      console.log(index);
    }
  
    initForms(donnees?: any) {
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
        nombrePlaceAffaire: [donnees?.nombrePlaceAffaire || "", Validators.required],
        codePlaceAffaire: [donnees?.codePlaceAffaire || "", Validators.required],
        evaluationPerte: [donnees?.evaluationPerte || "", Validators.required],
        caracteristiquePlaceAffaire: [donnees?.caracteristiquePlaceAffaire || "", Validators.required],
        perteArbreJeune: [donnees?.perteArbreJeune || "", Validators.required],
        perteArbreAdulte: [donnees?.perteArbreAdulte || "", Validators.required],
        statutPap: [donnees?.statutPap || "", Validators.required],
        vulnerabilite: [donnees?.vulnerabilite || "", Validators.required],
        typePni: [donnees?.typePni || "", Validators.required],
        numeroPni: [donnees?.numeroPni || "", Validators.required],
        surnom: [donnees?.surnom || "", Validators.required],
        numeroTelephone: [donnees?.numeroTelephone || "", Validators.required],
        membreFoyer: [donnees?.membreFoyer || "", Validators.required],
        membreFoyerHandicape: [donnees?.membreFoyerHandicape || "", Validators.required],
        perteEquipement: [donnees?.perteEquipement || "", Validators.required],
        perteBatiment: [donnees?.perteBatiment || "", Validators.required],
        perteTotale: [donnees?.perteTotale || "", Validators.required],
        informationsEtendues: [donnees?.informationsEtendues || ""],
        existePni: [donnees?.existePni || null],
        photoPap: [donnees?.photoPap || null],
        pointGeometriques: [donnees?.pointGeometriques || null],
        superficie: [donnees?.superficie || null],
        niveauEtude: [donnees?.niveauEtude || null],
        religion: [donnees?.religion || null],
        pj1: [donnees?.pj1 || null],
        pj2: [donnees?.pj2 || null],
        pj3: [donnees?.pj3 || null],
        pj4: [donnees?.pj4 || null],
        pj5: [donnees?.pj5 || null],
        infos_complemenataires: [donnees?.infos_complemenataires || null],
        projectId: [
          donnees?.projectId || (this.currentProjectId ? +this.currentProjectId : null),
          [Validators.required]
        ],
        coProprietaire: [donnees?.coProprietaire || null],
      });
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
  
    contactForm: FormGroup;
    addItems() {
      // if(this.listeNoire){
  
      //this.initForm.get('coProprietaire').setValue(this.contactForm.value)
  
      this.initForm
        .get("coProprietaire")
        .setValue(JSON.stringify(this.contactForm.value));
      console.log("====================================");
      console.log(this.initForm.value);
      console.log("====================================");
      this.snackbar
        .showConfirmation("Voulez-vous vraiment ajouter ce pap ?")
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.addItem([value], this.url).subscribe(
              (resp) => {
                if (resp["responseCode"] == 201) {
                  this.snackbar.openSnackBar("Pap  ajoutée avec succés", "OK", [
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
      // }else if(!this.listeNoire){
      //
      // }
    }
  
    updateItems() {
      this.snackbar
        .showConfirmation(
          "Voulez-vous vraiment modifier cette personne affectée ?"
        )
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.updateItem(value, this.id, this.url).subscribe(
              (resp) => {
                if (resp) {
                  this.loader = false;
                  this.matDialogRef.close(resp);
                  this.snackbar.openSnackBar(
                    "Personne affectée modifiée avec succés",
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
                console.log("====================================");
                console.log(error);
                console.log("====================================");
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
        this.updateItems();
      }
    }
  
    selectOnFile(evt, type, name) {
      let accept = [];
      let extension = "";
      if (type === "photo_profile") {
        accept = [".png", ".PNG", ".jpg", ".JPG"];
        extension = "une image";
      }
      for (const file of evt.target.files) {
        const index = file.name.lastIndexOf(".");
        const strsubstring = file.name.substring(index, file.name.length);
        const ext = strsubstring;
        if (accept.indexOf(strsubstring) === -1) {
          this.snackbar.openSnackBar(
            "Ce fichier " + file.name + " n'est " + extension,
            "OK",
            ["mycssSnackbarRed"]
          );
          return;
        } else {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            if (type === "photo_profile") {
              const img = new Image();
              img.src = e.target.result;
              this.saveStoreFile(file);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  
    imageToff: any;
  
    saveStoreFile(file) {
      let formData = new FormData();
      formData.append("file", file);
      this.changeDetectorRefs.detectChanges();
      const dataFile = { file: file };
      this.loader = true;
      this.clientServive.saveStoreFile(formData).subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.imageToff = `${this.urlImage + resp["fileName"]}`;
            this.initForm.get("photoPap").setValue(this.imageToff);
            this.snackbar.openSnackBar(
              "Fichier chargé avec succès : " + file.name,
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
  
    sexeOptions = [
      { id: "M", name: "Masculin" },
      { id: "F", name: "Féminin" },
    ];
  
    displayedColumns: string[] = ["nom", "prenom", "sexe", "telephone"];
    contacts = new MatTableDataSource<any>();
  
    get coProprietaires() {
      return this.contactForm.get("coProprietaires") as FormArray;
    }
  
    // Fonction pour créer le formulaire
    createCoProprietaire() {
      this.contactForm = this.fb.group({
        codeCoProprietaire: ["", Validators.required],
        nomComplet: ["", Validators.required],
        infoComplementaire: ["", Validators.required],
        sexeCoProprietaire: ["", Validators.required],
        // emailCoProprietaire: ["", [Validators.required, Validators.email]],
        contactTelephonique: ["", Validators.required],
      });
    }
  
    // Fonction pour ajouter un contact
  
    addContact(): void {
      this.contactForm.markAllAsTouched();
  
      if (this.contactForm.valid) {
        const newContact = this.contactForm.value;
  
        // Ajoutez le nouveau contact à la source de données
        this.contacts.data = [...this.contacts.data, newContact]; // Mettez à jour l'objet "data"
  
        // Réinitialiser le formulaire
        this.contactForm.reset();
        this.contactForm.setValue({
          codeCoProprietaire: "",
          nomComplet: "",
          age: "",
          sexeCoProprietaire: "",
          //  emailCoProprietaire: "",
          contactTelephonique: "",
        });
  
        console.log(this.contacts.data); // Affiche le tableau mis à jour
      } else {
        console.log("Le formulaire est invalide");
      }
    }
  
    openImageModal(imageUrl: string) {
      if (imageUrl) {
        this._matDialog.open(ImageModalComponent, {
          data: { imageUrl: imageUrl },
        });
      }
    }
  
    //validation du formulaire
  
    nextStep(stepper: MatStepper) {
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
        // case 3:
        //   this.validateStep4();
        //   break;
        case 4:
          this.validateStep5();
          break;
      }
      if (this.isStepValid(currentStep)) {
        stepper.next();
      }
  
    }
  
    validateStep1() {
      const step1Controls = [
        "prenom",
        "nom",
        "sexe",
        "codePap",
        "nationalite",
        "situationMatrimoniale",
        "commune",
        "departement",
        "nombrePlaceAffaire",
      ];
      this.markControlsAsTouched(step1Controls);
    }
  
    validateStep2() {
      const step2Controls = [
        "codePlaceAffaire",
        "evaluationPerte",
        "caracteristiquePlaceAffaire",
        "perteArbreJeune",
        "perteArbreAdulte",
      ];
      this.markControlsAsTouched(step2Controls);
    }
  
    validateStep3() {
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
  
    validateStep4(): boolean {
      return this.contacts.data.length > 0;
    }
  
    validateStep5() {
      const step5Controls = [
        "perteEquipement",
        "perteBatiment",
        "perteTotale",
        "informationsEtendues",
      ];
      this.markControlsAsTouched(step5Controls);
    }
  
    markControlsAsTouched(controls: string[]) {
      controls.forEach((control) => {
        this.initForm.get(control)?.markAsTouched();
      });
    }
  
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
            this.initForm.get("departement")?.valid &&
            this.initForm.get("nombrePlaceAffaire")?.valid
          );
        case 1:
          return (
            this.initForm.get("codePlaceAffaire")?.valid &&
            this.initForm.get("evaluationPerte")?.valid &&
            this.initForm.get("caracteristiquePlaceAffaire")?.valid &&
            this.initForm.get("perteArbreJeune")?.valid &&
            this.initForm.get("perteArbreAdulte")?.valid
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
          return this.contacts.data.length > 0;
        case 4:
          return (
            this.initForm.get("perteEquipement")?.valid &&
            this.initForm.get("perteBatiment")?.valid &&
            this.initForm.get("perteTotale")?.valid &&
            this.initForm.get("informationsEtendues")?.valid
          );
        default:
          return false;
      }
    }

}
