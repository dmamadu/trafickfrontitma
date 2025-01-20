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
import { MatStepper } from "@angular/material/stepper";
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
import { Router } from "@angular/router";
import { LocalService } from "src/app/core/services/local.service";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-pap-add",
  templateUrl: "./pip-add.component.html",
  styleUrl: "./pip-add.component.css",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AngularMaterialModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: DateAdapter, useClass: MatNativeDateModule },
    { provide: MatPaginatorIntl },
    SnackBarService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PipAddComponent implements OnInit {
  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " une partie intéréssé ";
  countries: any;
  categories: any[] = [
    { id: "1", libelle: "Agricole" },
    { id: "2", libelle: "Miniere" },
  ];
  sexe = [
    { name: "Homme", id: "Masculin" },
    { name: "Femme", id: "Feminim" },
  ];
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
  url = "partie-interesse";
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
  //categories: any;
  lienBrute: string;
  lien: string;
  currentUser: any;
  dernierSegment: string;

  constructor(
    public matDialogRef: MatDialogRef<PipAddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private router: Router,
    private localService: LocalService
  ) {
    console.log("==data fomrmr==================================");
    console.log(_data.data.pays);
    console.log("====================================");

    this.currentUser = this.localService.getDataJson("user");

    console.log("user connecter", this.currentUser);
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
      if (_data && _data.data.pays) {
        this.initForm.get("pays").setValue(_data.data.pays);
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

  ngOnInit(): void {
    // this.getcategories();

    this.lienBrute = this.router.url;
    // Extraire une partie spécifique de l'URL
    this.lien = this.lienBrute.substring(1, this.lienBrute.length);
    console.log("URL modifiée:", this.lien);
    let segments = this.lien.split("/");
    this.dernierSegment = segments[segments.length - 1];
    this.createContactForm();
  }

  goToStep(index) {
    this.myStepper.selectedIndex = index;
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      //first step
      libelle: this.fb.control(donnees ? donnees?.libelle : null, [
        Validators.required,
      ]),
      statut: this.fb.control(donnees ? donnees?.statut : null, [
        Validators.required,
      ]),
      courielPrincipal: this.fb.control(
        donnees ? donnees?.courielPrincipal : null,
        [Validators.required]
      ),
      adresse: this.fb.control(donnees ? donnees?.adresse : null, [
        Validators.required,
      ]),
      localisation: this.fb.control(donnees ? donnees?.localisation : null, [
        Validators.required,
      ]),
      categorie: this.fb.control(donnees ? donnees?.categorie : null, [
        Validators.required,
      ]),
      //step 3
      normes: this.fb.control(donnees ? donnees?.normes : null, [
        Validators.required,
      ]),
      //projet
      project_id: this.fb.control(
        this.currentUser.projects ? this.currentUser.projects[0]?.id : null,
        [Validators.required]
      ),
      contacts: [[]],
    });
  }

  refresh(): void {
    this.initForm.get("numeroIdentification").setValue(null);
    this.initForm.get("dateDelivrancePiece").setValue(null);
    this.initForm.get("dateValiditePiece").setValue(null);
  }

  firstStep() {
    if (
      this.initForm.get("libelle").invalid ||
      this.initForm.get("statut").invalid ||
      this.initForm.get("courielPrincipal").invalid ||
      this.initForm.get("adresse").invalid ||
      this.initForm.get("localisation").invalid ||
      this.initForm.get("categorie").invalid
    ) {
      return false;
    } else {
      return true;
    }
  }

  thirdStep() {
    if (this.initForm.get("normes").invalid) {
      return false;
    } else {
      return true;
    }
  }

  get phoneValue() {
    return this.initForm.controls["numeroTelephonePersonneContact"];
  }

  // getNationalite(value: any) {
  //   if (this.countries) {
  //     const liste = this.countries.filter((type) => type.id == value);
  //     return liste.length != 0 ? liste[0]?.nationalite : value;
  //   }
  // }

  // getcategories() {
  //   this.coreService.list("categoriesPip", 0, 10000).subscribe((response) => {
  //     if (response["responseCode"] === 200) {
  //       this.categories = response["data"];
  //       console.log("====================================");
  //       console.log(this.categories);
  //       console.log("====================================");
  //       this.changeDetectorRefs.markForCheck();
  //     }
  //   });
  // }

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

  addItems() {
    this.initForm.get("contacts")?.setValue(this.contacts.data);
    this.initForm.get("categorie").setValue(this.dernierSegment)

    console.log(this.initForm.value);

    this.snackbar
      .showConfirmation(`Voulez-vous vraiment ajouter ce pip ? `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.addItem(value, this.url).subscribe(
            (resp) => {
              if (resp["responseCode"] == 200) {
                this.snackbar.openSnackBar("Pip  ajoutée avec succés", "OK", [
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
              this.loader = false;
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  updateItems() {
    this.snackbar
      .showConfirmation(
        `Voulez-vous vraiment modifier ce pip?
         `
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
                  `${this.getCategorie(
                    this.initForm?.get("categorie")?.value
                  )} modifiée avec succés `,
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
    this.addItems();
    if (this.initForm.invalid) {
      this.checkValidity(this.initForm);
    } else {
      if (this.canAdd == false) {
        this.addItems();
      }
      if (type == "new") {
        this.addItems();
      } else if (type == "edit") {
        this.updateItems();
      }
    }
  }

  getCategorie(value: any) {
    if (this.categories) {
      const liste = this.categories.filter((type) => type.id == value);
      return liste.length != 0 ? liste[0]?.libelle : value;
    }
  }

  contactForm: FormGroup;
  sexeOptions = [
    { id: "M", name: "Masculin" },
    { id: "F", name: "Féminin" },
  ];
  displayedColumns: string[] = ["nom", "prenom", "email", "telephone"];
  contacts = new MatTableDataSource<any>();

  // Fonction pour créer le formulaire
  createContactForm() {
    this.contactForm = this.fb.group({
      nomContactPrincipal: ["", Validators.required],
      prenomContactPrincipal: ["", Validators.required],
      adresseContactPrincipal: ["", Validators.required],
      sexeContactPrincipal: ["", Validators.required],
      emailContactPrincipal: ["", [Validators.required, Validators.email]],
      telephoneContactPrincipal: ["", Validators.required],
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
        nomContactPrincipal: "",
        prenomContactPrincipal: "",
        adresseContactPrincipal: "",
        sexeContactPrincipal: "",
        emailContactPrincipal: "",
        telephoneContactPrincipal: "",
      });

      console.log(this.contacts.data); // Affiche le tableau mis à jour
    } else {
      console.log("Le formulaire est invalide");
    }
  }
}
