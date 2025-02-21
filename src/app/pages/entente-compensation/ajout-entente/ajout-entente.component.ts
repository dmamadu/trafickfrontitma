import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  OnInit,
} from "@angular/core";
import {
  FormArray,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { LocalService } from "src/app/core/services/local.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { SignatureComponent } from "../signature/signature.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { LoaderComponent } from "../../../shared/loader/loader.component";

@Component({
  selector: "app-ajout-entente",
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, UIModule, LoaderComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: MatPaginatorIntl },
    SnackBarService,
    MatDatepickerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./ajout-entente.component.html",
  styleUrl: "./ajout-entente.component.css",
})
export class AjoutEntenteComponent implements OnInit {
  initForm: UntypedFormGroup;
  dialogRef: any;
  form: FormGroup;
  currentUser: any;
  action: string;

  labelButton: string;

  isLoading: boolean = false;
  id: any;
  constructor(
    public matDialogRef: MatDialogRef<AjoutEntenteComponent>,
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private localService: LocalService,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentUser = this.localService.getDataJson("user");

    console.log("data");

    console.log(_data);

    console.log("action");
    console.log(_data.action);

    // Initialiser arbreForm avant de l'utiliser
    this.arbreForm = this.fb.group({
      arbres: this.fb.array([]),
    });

    this.equipementForm = this.fb.group({
      equipements: this.fb.array([]),
    });

    this.recolteForm = this.fb.group({
      recoltes: this.fb.array([]),
    });

    this.perteRevenueForm = this.fb.group({
      pertes: this.fb.array([]),
    });


    this.action = _data?.action;
    this.id = _data.data.id;

    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
      this.ajouterEquipement();
      this.ajouterRecolte();
      this.ajouterPerte();
      this.ajouterArbre();
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      // this.id = _data.data.id;
      this.initForms(_data.data);

      // Vérifier si _data.data.perteArbres est défini avant de l'utiliser
      if (_data.data?.perteArbres) {
        try {
          // Parse les données JSON
          const perteArbres = JSON.parse(_data.data.perteArbres);

          // Vérifie que perteArbres est un tableau
          if (Array.isArray(perteArbres)) {
            // Pour chaque élément dans perteArbres, ajoutez un arbre
            perteArbres.forEach((arbre: any) => {
              this.ajouterArbre(arbre); // Utilisez ajouterArbre() pour ajouter chaque arbre
            });
          } else {
            console.error(
              "perteArbres n'est pas un tableau valide :",
              perteArbres
            );
          }
        } catch (error) {
          console.error("Erreur lors du parsing de perteArbres :", error);
        }
      }

      if (_data.data?.perteEquipements) {
        try {
          // Parse les données JSON
          const perteEquipements = JSON.parse(_data.data.perteEquipements);

          // Vérifie que perteEquipements est un tableau
          if (Array.isArray(perteEquipements)) {
            // Pour chaque élément dans perteEquipements, ajoutez un équipement
            perteEquipements.forEach((equipement: any) => {
              this.ajouterEquipement(equipement); // Utilisez ajouterEquipement() pour ajouter chaque équipement
            });
          } else {
            console.error(
              "perteEquipements n'est pas un tableau valide :",
              perteEquipements
            );
          }
        } catch (error) {
          console.error("Erreur lors du parsing de perteEquipements :", error);
        }
      }

      if (_data.data?.perteRecoltes) {
        try {
          // Parse les données JSON
          const perteRecoltes = JSON.parse(_data.data.perteRecoltes);

          // Vérifie que perteRecoltes est un tableau
          if (Array.isArray(perteRecoltes)) {
            // Pour chaque élément dans perteRecoltes, ajoutez une récolte
            perteRecoltes.forEach((recolte: any) => {
              this.ajouterRecolte(recolte); // Utilisez ajouterRecolte() pour ajouter chaque récolte
            });
          } else {
            console.error(
              "perteRecoltes n'est pas un tableau valide :",
              perteRecoltes
            );
          }
        } catch (error) {
          console.error("Erreur lors du parsing de perteRecoltes :", error);
        }
      }

      if (_data.data?.perteRevenues) {
        try {
          const revenues = JSON.parse(_data.data.perteRevenues);

          // Vérifie que revenues est un tableau
          if (Array.isArray(revenues)) {
            revenues.forEach((revenue: any) => {
              this.ajouterPerte(revenue); // Ajoute chaque revenu au FormArray
            });
          } else {
            console.error("revenues n'est pas un tableau valide :", revenues);
          }
        } catch (error) {
          console.error("Erreur lors du parsing de revenues :", error);
        }
      }

    }

    // this.initForms();

    this.initForm.valueChanges.subscribe(() => {
      this.calculerTotalFraisDeplacement();
      this.calculerTotalPerteTerre();
    });



    this.perteRevenueForm.valueChanges.subscribe(() => {
      this.calculerPerteTotale();
    });

    this.recolteForm.valueChanges.subscribe(() => {
      this.calculerPerteTotale();
    });

    this.equipementForm.valueChanges.subscribe(() => {
      this.calculerPerteTotale();
    });
  }



  calculerPerteTotale() {
    const fraisTotalDeplacement =
      this.initForm.get("fraisTotalDeplacement")?.value || 0;
    const perteTotalTerre = this.initForm.get("perteTotalTerre")?.value || 0;

    let perteArbres = 0;
    this.arbres.controls.forEach((arbre: FormGroup) => {
      const nombre = Number(arbre.get("nombre")?.value) || 0;
      const prix = Number(arbre.get("prix")?.value) || 0;
      perteArbres += nombre * prix;
    });

    const perteTotale =
      fraisTotalDeplacement +
      perteTotalTerre +
      this.getTotalReevenusGeneral() +
      perteArbres +
      this.getTotalGeneralRecolte() +
      this.getTotalGeneralEquipement();

    this.initForm
      .get("perteTotale")
      ?.setValue(perteTotale, { emitEvent: false });
  }

  calculerTotalFraisDeplacement() {
    const fraisDeplacement =
      Number(this.initForm.get("fraisDeplacement")?.value) || 0;
    const appuiRelocalisation =
      Number(this.initForm.get("appuiRelocalisation")?.value) || 0;
    const total = fraisDeplacement + appuiRelocalisation;
    this.initForm
      .get("fraisTotalDeplacement")
      ?.setValue(total, { emitEvent: false });

    this.calculerPerteTotale();
  }

  calculerTotalPerteTerre() {
    // Récupérer les valeurs des champs pour la superficie et l'appui
    const fraisDeplacement =
      Number(this.initForm.get("superficieAffecte")?.value) || 0;
    const appuiRelocalisation =
      Number(this.initForm.get("baremeTypeSol")?.value) || 0;
    const totalTerre = fraisDeplacement * appuiRelocalisation;
    this.initForm
      .get("perteTotalTerre")
      ?.setValue(totalTerre, { emitEvent: false });

    this.calculerPerteTotale();
  }

  ngOnInit(): void {
    // this.form = this.fb.group({
    //   articles: this.fb.array([]),
    // });
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      codePap: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required,
      ]),
      categoriePap: this.fb.control(donnees ? donnees?.categoriePap : null, [
        Validators.required,
      ]),
      prenom: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required,
      ]),
      nom: this.fb.control(donnees ? donnees?.nom : null, [
        Validators.required,
      ]),
      sexe: this.fb.control(donnees ? donnees?.sexe : null, [
        Validators.required,
      ]),
      departement: this.fb.control(donnees ? donnees?.departement : null, [
        Validators.required,
      ]),
      commune: this.fb.control(donnees ? donnees?.commune : null, [
        Validators.required,
      ]),
      nationalite: this.fb.control(donnees ? donnees?.nationalite : null, [
        Validators.required,
      ]),
      typePni: this.fb.control(donnees ? donnees?.typePni : null, [
        Validators.required,
      ]),
      numeroPni: this.fb.control(donnees ? donnees?.numeroPni : null, [
        Validators.required,
      ]),

      //signature
      urlSignaturePap: this.fb.control(
        donnees ? donnees?.urlSignaturePap : null,
        [Validators.required]
      ),
      urlSignatureResponsable: this.fb.control(
        donnees ? donnees?.urlSignatureResponsable : null,
        [Validators.required]
      ),
      projectId: this.fb.control(
        this.currentUser.projects
          ? parseInt(this.currentUser.projects[0]?.id, 10) || null
          : null,
        [Validators.required]
      ),

      //Frais deplacement

      fraisDeplacement: this.fb.control(
        donnees ? donnees?.fraisDeplacement : 0,
        [Validators.required]
      ),
      appuiRelocalisation: this.fb.control(
        donnees ? donnees?.appuiRelocalisation : 0,
        [Validators.required]
      ),

      fraisTotalDeplacement: this.fb.control(
        { value: donnees ? donnees.fraisTotalDeplacement : 0 },
        [Validators.required]
      ),

      //Perte de terre

      superficieAffecte: this.fb.control(
        donnees ? donnees?.superficieAffecte : null,
        [Validators.required]
      ),
      baremeTypeSol: this.fb.control(donnees ? donnees?.baremeTypeSol : null, [
        Validators.required,
      ]),

      perteTotalTerre: [
        { value: donnees ? donnees.perteTotalTerre : 0 },
        [Validators.required],
      ],

      // perteRevenues: this.pertes.value,

      perteRevenues: this.fb.control(
        donnees ? donnees?.perteRevenues : null,
        []
      ),

      perteEquipements: this.fb.control(
        donnees ? donnees?.perteEquipements : null,
        []
      ),

      perteRecoltes: this.fb.control(
        donnees ? donnees?.perteRecoltes : null,
        []
      ),

      //Fin perte recoltes

      perteArbres: this.fb.control(donnees ? donnees?.perteArbres : null, []),

      // arbres: this.fb.array([]),

      perteTotale: this.fb.control(donnees ? donnees?.perteTotale : null, [
        Validators.required,
      ]),

      //PapLier

      databasePapAgricoleId: this.fb.control(
        donnees ? donnees?.databasePapAgricoleId : null,
        []
      ),

      databasePapPlaceAffaireId: this.fb.control(
        donnees ? donnees?.databasePapPlaceAffaireId : null,
        []
      ),
    });
  }

  addEntente() {
    this.initForm
      .get("perteEquipements")
      ?.setValue(JSON.stringify(this.equipements.value));
    this.initForm
      .get("perteRevenues")
      ?.setValue(JSON.stringify(this.pertes.value));
    this.initForm
      .get("perteRecoltes")
      ?.setValue(JSON.stringify(this.recoltes.value));
    this.initForm
      .get("perteArbres")
      ?.setValue(JSON.stringify(this.arbres.value));
    console.log(this.initForm.value);
    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment ajouter cet entente `)
        .then((result) => {
          if (result["value"] == true) {
            this.isLoading = true;
            this.coreService.addItem(this.initForm.value, "ententes").subscribe(
              (resp) => {
                if (resp["responseCode"] == 201) {
                  this.snackbar.openSnackBar(
                    "Entente  de compensation ajouté avec succés",
                    "OK",
                    ["mycssSnackbarGreen"]
                  );
                  this._changeDetectorRef.markForCheck();
                  this.matDialogRef.close();
                } else {
                  this._changeDetectorRef.markForCheck();
                }
                this.isLoading = false;
                console.log(resp);
              },
              (error) => {
                this._changeDetectorRef.markForCheck();
                this.snackbar.showErrors(error);
                console.log(error);
                this.isLoading = false;
              }
            );
          }
        });
    }
  }

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

  cherchePap() {}
  typePap: string = "";
  papData: any = null;

  equipementForm: FormGroup;

  get equipements() {
    return this.equipementForm.get("equipements") as FormArray;
  }



  ajouterEquipement(equipement?: any): void {
    if (
      this.equipements.length === 0 ||
      this.equipements.at(this.equipements.length - 1).valid
    ) {
      const equipementF = this.fb.group({
        libelle: [equipement?.libelle || "", Validators.required],
        nombre: [
          equipement?.nombre || 0,
          [Validators.required, Validators.min(1)],
        ],
        prix: [equipement?.prix || 0, [Validators.required, Validators.min(0)]],
      });

      this.equipements.push(equipementF);
    } else {
      console.log(
        "Veuillez compléter les champs requis avant d'ajouter un nouvel équipement."
      );
    }
  }

  supprimerEquipement(index: number) {
    this.equipements.removeAt(index);
  }

  calculerTotalEquipement(equipement: any): number {
    return equipement.value.nombre * equipement.value.prix;
  }

  getTotalGeneralEquipement(): number {
    return this.equipements.controls.reduce((total, equipement) => {
      return total + equipement.value.nombre * equipement.value.prix;
    }, 0);
  }

  recolteForm: FormGroup;

  get recoltes(): FormArray {
    return this.recolteForm.get("recoltes") as FormArray;
  }


  ajouterRecolte(recolte?: any): void {
    if (
      this.recoltes.length === 0 ||
      this.recoltes.at(this.recoltes.length - 1).valid
    ) {
      const recolteF = this.fb.group({
        produit: [recolte?.produit || "", Validators.required],
        rendement: [
          recolte?.rendement || 0,
          [Validators.required, Validators.min(1)],
        ],
        prix: [recolte?.prix || 0, [Validators.required, Validators.min(0)]],
      });

      this.recoltes.push(recolteF);
    } else {
      console.log(
        "Veuillez compléter les champs requis avant d'ajouter une nouvelle récolte."
      );
    }
  }

  supprimerRecolte(index: number) {
    this.recoltes.removeAt(index);
    this.calculerPerteTotale();
  }

  calculerTotalRecolte(recolte: any): number {
    return recolte.value.rendement * recolte.value.prix;
  }

  getTotalGeneralRecolte(): number {
    return this.recoltes.controls.reduce((total, recolte) => {
      return total + recolte.value.rendement * recolte.value.prix;
    }, 0);
  }

  arbreForm: FormGroup;

  get arbres(): FormArray {
    return this.arbreForm.get("arbres") as FormArray;
  }



  ajouterArbre(arbre?: any): void {
    if (
      this.arbres.length === 0 ||
      this.arbres.at(this.arbres.length - 1).valid
    ) {
      const arbreF = this.fb.group({
        espece: [arbre?.espece || "", [Validators.required]],
        type: [arbre?.type || "", [Validators.required]],
        nombre: [arbre?.nombre || "", [Validators.required]],
        prix: [arbre?.prix || "", [Validators.required]],
        total: [
          { value: arbre?.total || 0, disabled: true },
          [Validators.required],
        ],
      });

      arbreF.valueChanges.subscribe(() => {
        this.calculerTotalArbre(arbreF);
        this.calculerTotalPerteTerre();
      });

      this.arbres.push(arbreF);
      this.calculerTotalGeneralArbre();
      this.calculerTotalPerteTerre();
    } else {
      console.log(
        "Veuillez compléter les champs requis avant d'ajouter un nouvel arbre."
      );
    }
  }

  calculerTotalArbre(arbreForm: FormGroup) {
    const nombre = Number(arbreForm.get("nombre")?.value) || 0;
    const prix = Number(arbreForm.get("prix")?.value) || 0;
    const total = nombre * prix;

    arbreForm.get("total")?.setValue(total, { emitEvent: false });
    this.calculerTotalGeneralArbre();

    this.calculerPerteTotale();
  }

  supprimerArbre(index: number) {
    this.arbres.removeAt(index);
    this.calculerTotalGeneralArbre();
    this.calculerPerteTotale();
  }
  totalGeneralArbre: number = 0;

  calculerTotalGeneralArbre() {
    let total = 0;
    this.arbres.controls.forEach((arbre) => {
      total += Number(arbre.get("total")?.value) || 0;
    });
    this.totalGeneralArbre = total;
  }

  perteRevenueForm: FormGroup;

  get pertes(): FormArray {
    return this.perteRevenueForm.get("pertes") as FormArray;
  }


  ajouterPerte(revenue?: any): void {
    if (this.pertes.length > 0) {
      const dernier = this.pertes.at(this.pertes.length - 1);
      if (!dernier.valid) {
        return;
      }
    }
    const revenueF = this.fb.group({
      categorieRevenue: [revenue?.categorieRevenue || "", Validators.required], // Champ obligatoire
      perteRevenue: [
        revenue?.perteRevenue || 0,
        [Validators.required, Validators.min(0)],
      ], // Champ obligatoire et positif
    });

    this.pertes.push(revenueF);
  }

  supprimerPerte(index: number): void {
    this.pertes.removeAt(index);
  }

  getTotalReevenusGeneral(): number {
    return this.pertes.controls.reduce((total, perte) => {
      const valeur = parseFloat(perte.get("perteRevenue")?.value) || 0;
      return total + valeur;
    }, 0);
  }

  fetchPap(): void {
    const type = this.initForm.get("categoriePap").value;
    const codePap = this.initForm.get("codePap").value;
    if (!type || !codePap) {
      this.snackbar.openSnackBar(
        "Veuillez remplir les champs requis avant de continuer.",
        "OK",
        ["mycssSnackbarRed"]
      );
      return;
    }
    this.isLoading = true;
    this.coreService.getPapByCodePap(type, codePap).subscribe(
      (resp) => {
        if (resp["responseCode"] == 200) {
          if (resp["data"] !== 0) {
            this.papData = resp["data"][0];
            console.log(resp);

            this.snackbar.openSnackBar("Pap trouvé avec succès", "OK", [
              "mycssSnackbarGreen",
            ]);
            this.initForm.get("prenom").setValue(this.papData.prenom);
            this.initForm.get("nom").setValue(this.papData.nom);
            this.initForm.get("departement").setValue(this.papData.departement);
            this.initForm.get("commune").setValue(this.papData.departement);
            this.initForm.get("commune").setValue(this.papData.commune);
            this.initForm.get("typePni").setValue(this.papData.typePni);
            this.initForm.get("numeroPni").setValue(this.papData.numeroPni);
            this.initForm.get("sexe").setValue(this.papData.sexe);
            this.initForm.get("nationalite").setValue(this.papData.nationalite);

            if (type == "agricole") {
              this.initForm
                .get("databasePapAgricoleId")
                .setValue(this.papData.id);
            } else if (type == "placeAffaire") {
              this.initForm
                .get("databasePapPlaceAffaireId")
                .setValue(this.papData.id);
            }
          } else {
            this.snackbar.openSnackBar("Pap non trouvé", "OK", [
              "mycssSnackbarRed",
            ]);
          }
        }
        this.isLoading = false;
      },
      (error) => {
        this._changeDetectorRef.markForCheck();
        this.snackbar.showErrors(error);
        this.isLoading = false;
      }
    );
  }

  checkRecap(type) {
    if (type == "new") {
      this.addEntente();
    } else if (type == "edit") {
      this.updateEntente();
    }
  }

  updateEntente() {
    this.initForm
      .get("perteEquipements")
      ?.setValue(JSON.stringify(this.equipements.value));
    this.initForm
      .get("perteRevenues")
      ?.setValue(JSON.stringify(this.pertes.value));
    this.initForm
      .get("perteRecoltes")
      ?.setValue(JSON.stringify(this.recoltes.value));
    this.initForm
      .get("perteArbres")
      ?.setValue(JSON.stringify(this.arbres.value));
    console.log(this.initForm.value);
    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment modifier cet entente `)
        .then((result) => {
          if (result["value"] == true) {
            this.isLoading = true;
            this.coreService
              .updateItem(this.initForm.value, this.id, "ententes")
              .subscribe(
                (resp) => {
                  if (resp["responseCode"] == 201) {
                    this.snackbar.openSnackBar(
                      "Entente de compensation  modifiée avec succés",
                      "OK",
                      ["mycssSnackbarGreen"]
                    );
                    this._changeDetectorRef.markForCheck();
                    this.matDialogRef.close();
                  } else {
                    this._changeDetectorRef.markForCheck();
                  }
                  this.isLoading = false;
                  console.log(resp);
                },
                (error) => {
                  this._changeDetectorRef.markForCheck();
                  this.snackbar.showErrors(error);
                  console.log(error);
                  this.isLoading = false;
                }
              );
          }
        });
    }
  }
}
