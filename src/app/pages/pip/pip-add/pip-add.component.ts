// import {
//   CUSTOM_ELEMENTS_SCHEMA,
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
//   Component,
//   Inject,
//   OnInit,
//   ViewChild,
// } from "@angular/core";
// import {
//   UntypedFormGroup,
//   UntypedFormBuilder,
//   Validators,
//   FormGroup,
//   FormArray,
// } from "@angular/forms";
// import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
// import { MatDrawer } from "@angular/material/sidenav";
// import { MatStepper } from "@angular/material/stepper";
// import { CoreService } from "src/app/shared/core/core.service";
// import { SnackBarService } from "src/app/shared/core/snackBar.service";
// import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
// import { MatPaginatorIntl } from "@angular/material/paginator";
// import { MatFormFieldModule } from "@angular/material/form-field";
// import { MatIconModule } from "@angular/material/icon";
// import { MatInputModule } from "@angular/material/input";

// import {
//   DateAdapter,
//   MAT_DATE_LOCALE,
//   MatNativeDateModule,
// } from "@angular/material/core";
// import { Router } from "@angular/router";
// import { LocalService } from "src/app/core/services/local.service";
// import { MatTableDataSource } from "@angular/material/table";

// @Component({
//   selector: "app-pap-add",
//   templateUrl: "./pip-add.component.html",
//   styleUrl: "./pip-add.component.css",
//   standalone: true,
//   imports: [
//     MatFormFieldModule,
//     MatInputModule,
//     MatIconModule,
//     AngularMaterialModule,
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   providers: [
//     { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
//     { provide: DateAdapter, useClass: MatNativeDateModule },
//     { provide: MatPaginatorIntl },
//     SnackBarService,
//   ],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
// })
// export class PipAddComponent implements OnInit {
//   panelOpenState = false;
//   @ViewChild("drawer") drawer: MatDrawer;
//   @ViewChild("stepper") private myStepper: MatStepper;
//   dialogTitle: string;
//   id: string;
//   initForm: UntypedFormGroup;
//   labelButton: string;
//   suffixe: string = " une partie intéréssé ";
//   countries: any;
//   categories: any[] = [
//     { id: "1", libelle: "Agricole" },
//     { id: "2", libelle: "Miniere" },
//   ];
//   sexe = [
//     { name: "Homme", id: "Masculin" },
//     { name: "Femme", id: "Feminim" },
//   ];
//   nrSelect;
//   situationsMatrimoniales: any;
//   typeIdentifications: any = [];
//   capaciteJuridiques: any;
//   dateDelivrance;
//   regimeMatrimoniaux: any;
//   professions: any;
//   loader: boolean;
//   action: string;
//   minBirthDay: any;
//   today = new Date();
//   fields: any;
//   canAdd: boolean;
//   dataCheck;
//   url = "partie-interesse";
//   hasPhoneError: boolean;
//   currentValue: any;
//   countryChange: boolean = false;
//   eventNumber: any;
//   isFocus: unknown;
//   errorCNI;
//   newDate = new Date();
//   emailPattern =
//     /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   isValidOnWhatsApp: boolean = true;
//   ng2TelOptions;
//   idPiece;
//   listeNoire: boolean = false;
//   //categories: any;
//   lienBrute: string;
//   lien: string;
//   currentUser: any;
//   dernierSegment: string;

//   currentProjectId: any;

//   constructor(
//     public matDialogRef: MatDialogRef<PipAddComponent>,
//     @Inject(MAT_DIALOG_DATA) _data,
//     private fb: UntypedFormBuilder,
//     private coreService: CoreService,
//     private snackbar: SnackBarService,
//     private changeDetectorRefs: ChangeDetectorRef,
//     private router: Router,
//     private localService: LocalService
//   ) {
//     // this.currentUser = this.localService.getDataJson("user");
//     this.currentProjectId = this.localService.getData("ProjectId");
//     console.log("user connecter", this.currentUser);
//     if (_data?.action == "new") {
//       this.initForms();
//       this.labelButton = "Ajouter ";
//     } else if (_data?.action == "edit") {
//       this.labelButton = "Modifier ";
//       console.log("===================dat=================");
//       console.log(_data.data);
//       console.log("====================================");
//       this.id = _data.data.id;
//       this.initForms(_data.data);
//       // Mise à jour des contacts avec les données reçues
//       if (_data.data.contacts && Array.isArray(_data.data.contacts)) {
//         this.contacts = new MatTableDataSource<any>(_data.data.contacts);
//       } else {
//         this.contacts = new MatTableDataSource<any>([]);
//       }
//       if (_data && _data.data.pays) {
//         this.initForm.get("pays").setValue(_data.data.pays);
//       }
//     }
//       this.contacts = new MatTableDataSource<any>([]);

//     this.action = _data?.action;
//     this.canAdd = _data.canAdd;
//     this.dialogTitle = this.labelButton + this.suffixe;
//     this.ng2TelOptions = { initialCountry: "sn" };
//   }
//   contacts = new MatTableDataSource<any>([]);
//   checkValidOnWhatsApp(event: any): void {
//     const value = event.value;
//     this.initForm.get("statutVulnerable")?.setValue(value);
//   }

//   displayedColumns: string[] = ['nom', 'prenom', 'email', 'telephone', 'actions'];


//   ngOnInit(): void {
//     this.displayedColumns = ['nom', 'prenom', 'email', 'telephone','actions'];
//     this.lienBrute = this.router.url;
//     this.lien = this.lienBrute.substring(1, this.lienBrute.length);
//     console.log("URL modifiée:", this.lien);
//     let segments = this.lien.split("/");
//     this.dernierSegment = segments[segments.length - 1];
//     this.createContactForm();
//   this.contacts = new MatTableDataSource<any>(this.contacts.data || []);
//   }

//   goToStep(index) {
//     this.myStepper.selectedIndex = index;
//   }

//   initForms(donnees?) {
//     this.initForm = this.fb.group({
//       //first step
//       libelle: this.fb.control(donnees ? donnees?.libelle : null, [
//         Validators.required,
//       ]),
//       statut: this.fb.control(donnees ? donnees?.statut : null, [
//         Validators.required,
//       ]),
//       courrielPrincipal: this.fb.control(
//         donnees ? donnees?.courrielPrincipal : null,
//         [Validators.required]
//       ),
//       adresse: this.fb.control(donnees ? donnees?.adresse : null, [
//         Validators.required,
//       ]),
//       localisation: this.fb.control(donnees ? donnees?.localisation : null, [
//         Validators.required,
//       ]),
//       categorie: this.fb.control(donnees ? donnees?.categorie : null, [
//         Validators.required,
//       ]),
//       project_id: this.fb.control(
//         this.currentProjectId ? this.currentProjectId : null,
//         [Validators.required]
//       ),
//       contacts: [[]],
//     });
//   }



//   firstStep() {
//     if (
//       this.initForm.get("libelle").invalid ||
//       this.initForm.get("statut").invalid ||
//       this.initForm.get("courrielPrincipal").invalid ||
//       this.initForm.get("adresse").invalid ||
//       this.initForm.get("localisation").invalid
//     ) {
//       return false;
//     } else {
//       return true;
//     }
//   }

//   thirdStep() {
//     if (this.initForm.get("normes").invalid) {
//       return false;
//     } else {
//       return true;
//     }
//   }

//   get phoneValue() {
//     return this.initForm.controls["numeroTelephonePersonneContact"];
//   }
//   checkValidity(g: UntypedFormGroup) {
//     Object.keys(g.controls).forEach((key) => {
//       g.get(key).markAsDirty();
//     });
//     Object.keys(g.controls).forEach((key) => {
//       g.get(key).markAsTouched();
//     });
//     Object.keys(g.controls).forEach((key) => {
//       g.get(key).updateValueAndValidity();
//     });
//   }

//   addItems() {
//     this.initForm.get("contacts")?.setValue(this.contacts.data);
//     this.initForm.get("categorie").setValue(this.dernierSegment);
//     this.snackbar
//       .showConfirmation(`Voulez-vous vraiment ajouter ? `)
//       .then((result) => {
//         if (result["value"] == true) {
//           this.loader = true;
//           const value = this.initForm.value;
//           this.coreService.addItem(value, this.url).subscribe(
//             (resp) => {
//               if (resp["responseCode"] == 200) {
//                 this.snackbar.openSnackBar("Ajoutée avec succés", "OK", [
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
//               this.loader = false;
//               this.changeDetectorRefs.markForCheck();
//               this.snackbar.showErrors(error);
//             }
//           );
//         }
//       });
//   }

//   updateItems() {
//     this.snackbar
//       .showConfirmation(
//         `Voulez-vous vraiment modifier ce pip?
//          `
//       )
//       .then((result) => {
//         if (result["value"] == true) {
//           this.loader = true;
//           const value = this.initForm.value;
//           this.coreService.updateItem(value, this.id, this.url).subscribe(
//             (resp) => {
//               if (resp) {
//                 this.loader = false;
//                 this.matDialogRef.close(resp);
//                 this.snackbar.openSnackBar(
//                   `${this.getCategorie(
//                     this.initForm?.get("categorie")?.value
//                   )} modifiée avec succés `,
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
//               this.loader = false;
//               this.snackbar.showErrors(error);
//             }
//           );
//         }
//       });
//   }

//   checkRecap(type) {
//     this.addItems();
//     if (this.initForm.invalid) {
//       this.checkValidity(this.initForm);
//     } else {
//       if (this.canAdd == false) {
//         this.addItems();
//       }
//       if (type == "new") {
//         this.addItems();
//       } else if (type == "edit") {
//         this.updateItems();
//       }
//     }
//   }

//   getCategorie(value: any) {
//     if (this.categories) {
//       const liste = this.categories.filter((type) => type.id == value);
//       return liste.length != 0 ? liste[0]?.libelle : value;
//     }
//   }

//   contactForm: FormGroup;
//   sexeOptions = [
//     { id: "M", name: "Masculin" },
//     { id: "F", name: "Féminin" },
//   ];
//   // displayedColumns: string[] = ["nom", "prenom", "email", "telephone"];

//   // Fonction pour créer le formulaire
//   createContactForm() {
//     this.contactForm = this.fb.group({
//       nomContactPrincipal: ["", Validators.required],
//       prenomContactPrincipal: ["", Validators.required],
//       emailContactPrincipal: ["", [Validators.required, Validators.email]],
//       telephoneContactPrincipal: ["", Validators.required],
//     });
//   }

//   // Fonction pour ajouter un contact

//   addContact(): void {
//     this.contactForm.markAllAsTouched();

//     if (this.contactForm.valid) {
//       const newContact = this.contactForm.value;

//       // Ajoutez le nouveau contact à la source de données
//       this.contacts.data = [...this.contacts.data, newContact]; // Mettez à jour l'objet "data"

//       // Réinitialiser le formulaire
//       this.contactForm.reset();
//       this.contactForm.setValue({
//         nomContactPrincipal: "",
//         prenomContactPrincipal: "",
//         // adresseContactPrincipal: "",
//         // sexeContactPrincipal: "",
//         emailContactPrincipal: "",
//         telephoneContactPrincipal: "",
//       });

//       console.log(this.contacts.data); // Affiche le tableau mis à jour
//     } else {
//       console.log("Le formulaire est invalide");
//     }
//   }

//   isStepValid(stepIndex: number): boolean {
//     switch (stepIndex) {
//       case 0:
//         return this.initForm.valid;
//       case 1:
//         return this.contactForm.valid;
//       case 2:
//         return this.initForm.get("normes")?.valid;
//       default:
//         return false;
//     }
//   }

//   onStepChange(event: any) {
//     const selectedIndex = event.selectedIndex;
//     if (selectedIndex > 0 && !this.isStepValid(selectedIndex - 1)) {
//       this.myStepper.selectedIndex = selectedIndex - 1;
//     }
//   }

//   editingIndex: number = -1;
// isEditing: boolean = false;

//   // Méthode pour éditer un contact
// editContact(contact: any, index: number): void {
//   this.contactForm.patchValue({
//     nomContactPrincipal: contact.nomContactPrincipal,
//     prenomContactPrincipal: contact.prenomContactPrincipal,
//     emailContactPrincipal: contact.emailContactPrincipal,
//     telephoneContactPrincipal: contact.telephoneContactPrincipal
//   });
//   this.editingIndex = index;
//   this.isEditing = true;
// }

// // Méthode pour supprimer un contact
// deleteContact(index: number): void {
//   const currentData = this.contacts.data;
//   currentData.splice(index, 1);
//   this.contacts.data = [...currentData];
  
//   if (this.isEditing && this.editingIndex === index) {
//     this.cancelEdit();
//   }
// }

// // Méthode pour annuler l'édition
// cancelEdit(): void {
//   this.contactForm.reset();
//   this.isEditing = false;
//   this.editingIndex = -1;
// }

// // Méthode pour réinitialiser le formulaire
// resetContactForm(): void {
//   this.contactForm.reset();
//   this.contactForm.setValue({
//     nomContactPrincipal: "",
//     prenomContactPrincipal: "",
//     emailContactPrincipal: "",
//     telephoneContactPrincipal: "",
//   });
// }
// }

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
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";

import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { Router } from "@angular/router";
import { LocalService } from "src/app/core/services/local.service";
import { MatTableDataSource } from "@angular/material/table";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-pap-add",
  templateUrl: "./pip-add.component.html",
  styleUrl: "./pip-add.component.css",
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
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
  suffixe: string = " une partie intéressée ";
  loader: boolean = false;
  action: string;
  canAdd: boolean;
  url = "partie-interesse";
  currentProjectId: any;
  
  // Catégories
  categories: any[] = [];
  isLoadingCategories: boolean = false;
  categoriesLoadError: boolean = false;
  
  // Contacts
  contacts = new MatTableDataSource<any>([]);
  contactForm: FormGroup;
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'telephone', 'actions'];
  
  // Édition contact
  editingIndex: number = -1;
  isEditing: boolean = false;
  
  // Options par défaut
  sexeOptions = [
    { id: "M", name: "Masculin" },
    { id: "F", name: "Féminin" },
  ];
  
  ng2TelOptions = { initialCountry: "sn" };

  constructor(
    public matDialogRef: MatDialogRef<PipAddComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private localService: LocalService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.action = _data?.action;
    this.canAdd = _data?.canAdd;
    
    this.initializeForm();
    this.setDialogTitle();
  }

  ngOnInit(): void {
    this.createContactForm();
    this.loadCategories();
  }

  /**
   * Initialise le formulaire
   */
  private initializeForm(): void {
    if (this.action === "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (this.action === "edit" && this._data?.data) {
      this.labelButton = "Modifier ";
      this.id = this._data.data.id;
      this.initForms(this._data.data);
      this.loadExistingContacts();
    }
    this.contacts = new MatTableDataSource<any>([]);
  }

  /**
   * Charge les contacts existants en édition
   */
  private loadExistingContacts(): void {
    if (this._data.data.contacts?.length) {
      this.contacts.data = [...this._data.data.contacts];
    }
  }

  /**
   * Définit le titre du dialogue
   */
  private setDialogTitle(): void {
    this.dialogTitle = this.labelButton + this.suffixe;
  }

  /**
   * Charge les catégories depuis l'API
   */
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesLoadError = false;
    
    // Essayer différentes URLs possibles
    const possibleUrls = ["categoriesPip", "categorie-pip", "pip-categories", "categories"];
    
    this.tryLoadCategories(possibleUrls, 0);
  }

  /**
   * Essaie de charger les catégories depuis différentes URLs
   */
  private tryLoadCategories(urls: string[], index: number): void {
    if (index >= urls.length) {
      // Toutes les URLs ont échoué, utiliser les catégories par défaut
      this.useDefaultCategories();
      return;
    }
    
    const url = urls[index];
    console.log(`Tentative de chargement des catégories depuis: ${url}`);
    
    this.coreService.list(url, 0, 1000).subscribe({
      next: (response: any) => {
        this.isLoadingCategories = false;
        
        if (response?.responseCode === 200 && response?.data?.length > 0) {
          this.categories = response.data;
          console.log(`Catégories chargées depuis ${url}:`, this.categories);
          this.cdr.detectChanges();
        } else if (response?.data?.length > 0) {
          // Certaines APIs retournent directement le tableau
          this.categories = response.data;
          console.log(`Catégories chargées depuis ${url}:`, this.categories);
          this.cdr.detectChanges();
        } else {
          // Essayer l'URL suivante
          this.tryLoadCategories(urls, index + 1);
        }
      },
      error: (error) => {
        console.warn(`Erreur chargement depuis ${url}:`, error);
        this.tryLoadCategories(urls, index + 1);
      }
    });
  }

  /**
   * Utilise les catégories par défaut
   */
  private useDefaultCategories(): void {
    this.isLoadingCategories = false;
    this.categoriesLoadError = true;
    
    // this.categories = [
    //   { id: 1, libelle: "🏭 Agricole" },
    //   { id: 2, libelle: "⛏️ Minière" },
    //   { id: 3, libelle: "🏭 Industrielle" },
    //   { id: 4, libelle: "🏪 Commerciale" },
    //   { id: 5, libelle: "💼 Services" },
    //   { id: 6, libelle: "🏗️ BTP" },
    //   { id: 7, libelle: "🚚 Transport" },
    //   { id: 8, libelle: "💻 Technologie" },
    // ];
    this.categories = [
  { id: 1, libelle: "🏢 Entreprise" },
  { id: 2, libelle: "📰 Média" },
  { id: 3, libelle: "🤝 ONG" },
  { id: 4, libelle: "🏛️ Organisation" },
  { id: 5, libelle: "💰 Bailleur de fonds" },
  { id: 6, libelle: "🏫 Institution académique" },
  { id: 7, libelle: "🏥 Structure de santé" },
  { id: 8, libelle: "🏦 Institution financière" },
  { id: 9, libelle: "⚖️ Cabinet juridique" },
  { id: 10, libelle: "🏭 Industrie & BTP" },
  { id: 11, libelle: "🌍 Coopération internationale" },
  { id: 12, libelle: "🔬 Centre de recherche" },
];
    
    console.log("Utilisation des catégories par défaut:", this.categories);
    this.cdr.detectChanges();
    
    // Optionnel: Afficher un message discret
    this.snackbar.openSnackBar("Utilisation des catégories par défaut", "OK", ["mycssSnackbarInfo"]);
  }

  /**
   * Rafraîchit les catégories manuellement
   */
  refreshCategories(): void {
    this.loadCategories();
  }

  /**
   * Initialise le formulaire
   */
  initForms(donnees?: any): void {
    this.initForm = this.fb.group({
      libelle: [donnees?.libelle || null, Validators.required],
      statut: [donnees?.statut || null, Validators.required],
      courrielPrincipal: [donnees?.courrielPrincipal || null, [Validators.required, Validators.email]],
      adresse: [donnees?.adresse || null, Validators.required],
      localisation: [donnees?.localisation || null, Validators.required],
      categorie: [donnees?.categorie || null, Validators.required],
      project_id: [this.currentProjectId || null, Validators.required],
      contacts: [[]],
    });
  }

  /**
   * Vérifie si la première étape est valide
   */
  firstStep(): boolean {
    return this.initForm?.valid ?? false;
  }

  /**
   * Vérifie tous les champs du formulaire
   */
  checkValidity(formGroup: UntypedFormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsDirty();
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  /**
   * Ajoute un nouvel élément
   */
  addItems(): void {
    this.initForm.get("contacts")?.setValue(this.contacts.data);
    
    this.snackbar.showConfirmation(`Voulez-vous vraiment ajouter cette partie intéressée ?`)
      .then((result) => {
        if (result?.value === true) {
          this.loader = true;
          const value = this.initForm.value;
          
          this.coreService.addItem(value, this.url).subscribe({
            next: (resp: any) => {
              this.loader = false;
              if (resp?.responseCode === 200) {
                this.snackbar.openSnackBar("Ajoutée avec succès", "OK", ["mycssSnackbarGreen"]);
                this.matDialogRef.close(resp.data);
              } else {
                this.snackbar.openSnackBar(resp?.message || "Erreur lors de l'ajout", "OK", ["mycssSnackbarRed"]);
              }
              this.cdr.markForCheck();
            },
            error: (error) => {
              this.loader = false;
              this.snackbar.showErrors(error);
              this.cdr.markForCheck();
            }
          });
        }
      });
  }

  /**
   * Met à jour un élément existant
   */
  updateItems(): void {
    this.initForm.get("contacts")?.setValue(this.contacts.data);
    
    this.snackbar.showConfirmation(`Voulez-vous vraiment modifier cette partie intéressée?`)
      .then((result) => {
        if (result?.value === true) {
          this.loader = true;
          const value = this.initForm.value;
          
          this.coreService.updateItem(value, this.id, this.url).subscribe({
            next: (resp: any) => {
              this.loader = false;
              if (resp) {
                this.matDialogRef.close(resp);
                this.snackbar.openSnackBar("Partie intéressée modifiée avec succès", "OK", ["mycssSnackbarGreen"]);
              } else {
                this.snackbar.openSnackBar(resp?.message || "Erreur lors de la modification", "OK", ["mycssSnackbarRed"]);
              }
              this.cdr.markForCheck();
            },
            error: (error) => {
              this.loader = false;
              this.snackbar.showErrors(error);
              this.cdr.markForCheck();
            }
          });
        }
      });
  }

  /**
   * Vérifie le récapitulatif avant soumission
   */
  checkRecap(type: string): void {
    if (this.initForm.invalid) {
      this.checkValidity(this.initForm);
      this.snackbar.openSnackBar("Veuillez remplir tous les champs obligatoires", "OK", ["mycssSnackbarRed"]);
    } else {
      if (type === "new") {
        this.addItems();
      } else if (type === "edit") {
        this.updateItems();
      }
    }
  }

  /**
   * Retourne le libellé d'une catégorie
   */
  getCategorieLabel(categoryId: number): string {
    if (!this.categories.length) return String(categoryId);
    const category = this.categories.find(c => c.id === categoryId);
    return category?.libelle || String(categoryId);
  }

  /**
   * Crée le formulaire de contact
   */
  createContactForm(): void {
    this.contactForm = this.fb.group({
      nomContactPrincipal: ["", Validators.required],
      prenomContactPrincipal: ["", Validators.required],
      emailContactPrincipal: ["", [Validators.required, Validators.email]],
      telephoneContactPrincipal: ["", Validators.required],
    });
  }

  /**
   * Ajoute un contact
   */
  addContact(): void {
    this.contactForm.markAllAsTouched();

    if (this.contactForm.valid) {
      const newContact = { ...this.contactForm.value };
      this.contacts.data = [...this.contacts.data, newContact];
      this.resetContactForm();
      this.cdr.detectChanges();
    }
  }

  /**
   * Édite un contact
   */
  editContact(contact: any, index: number): void {
    this.contactForm.patchValue({
      nomContactPrincipal: contact.nomContactPrincipal,
      prenomContactPrincipal: contact.prenomContactPrincipal,
      emailContactPrincipal: contact.emailContactPrincipal,
      telephoneContactPrincipal: contact.telephoneContactPrincipal
    });
    this.editingIndex = index;
    this.isEditing = true;
  }

  /**
   * Supprime un contact
   */
  deleteContact(index: number): void {
    const currentData = [...this.contacts.data];
    currentData.splice(index, 1);
    this.contacts.data = currentData;
    
    if (this.isEditing && this.editingIndex === index) {
      this.cancelEdit();
    }
    this.cdr.detectChanges();
  }

  /**
   * Annule l'édition
   */
  cancelEdit(): void {
    this.resetContactForm();
    this.isEditing = false;
    this.editingIndex = -1;
  }

  /**
   * Réinitialise le formulaire de contact
   */
  resetContactForm(): void {
    this.contactForm.reset({
      nomContactPrincipal: "",
      prenomContactPrincipal: "",
      emailContactPrincipal: "",
      telephoneContactPrincipal: "",
    });
  }

  /**
   * Vérifie si une étape est valide
   */
  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.initForm?.valid ?? false;
      case 1:
        return this.contacts.data.length > 0;
      default:
        return false;
    }
  }

  /**
   * Gère le changement d'étape
   */
  onStepChange(event: any): void {
    const selectedIndex = event.selectedIndex;
    if (selectedIndex > 0 && !this.isStepValid(selectedIndex - 1)) {
      this.myStepper.selectedIndex = selectedIndex - 1;
      if (selectedIndex === 1 && this.contacts.data.length === 0) {
        this.snackbar.openSnackBar("Veuillez ajouter au moins un contact", "OK", ["mycssSnackbarRed"]);
      }
    }
  }

  /**
   * Va à une étape spécifique
   */
  goToStep(index: number): void {
    this.myStepper.selectedIndex = index;
  }
}