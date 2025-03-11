import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,

} from "@angular/core";
import {
  UntypedFormGroup,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

import { AjoutAttributComplementaireComponent } from "./ajout-attribut-complementaire/ajout-attribut-complementaire.component";
import { TemplateConsentementComponent } from "./template-consentement/template-consentement.component";
import { CoreService } from "src/app/shared/core/core.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { PapAddComponent } from "../pap-add/pap-add.component";
import { MessageService } from "src/app/shared/core/message.service";
import { AddConsetementComponent } from "./add-consetement/add-consetement.component";
import { PapService } from "../pap.service";

@Component({
  selector: "info-client",
  templateUrl: "./info-client.component.html",
  styleUrl: "./info-client.component.css",
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [AngularMaterialModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: MatDialogRef,
      useValue: [],
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],
})
export class InfoClientComponent implements OnInit {
  _attributComplementaire = [];
  @Input() infosPap;

  employes: any[] = [];
  betails: any[] = [];
  cultures: any[] = [];
  equipements: any[] = [];
  batiments: any[] = [];
  polygones: any[] = [];


  parsedEquipements: any[] = [];
parsedBatiments: any[] = [];


  set attributComplementaire(data: any) {
    this._attributComplementaire = data ? data : [];
  }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  accountForm: UntypedFormGroup;
  data: any;
  paramsId: any;
  constantes = CONSTANTES;
  isLoading = false;
  dialogRef: any;
  naturePersonnesMorales: any = [];
  responsable: any = [];
  statutJuridiques: any = [];
  countries: any = [];
  listetemplate: any;

  /**
   * Constructor
   */
  constructor(
    private route: ActivatedRoute,
    private coreService: CoreService,
    private papservice: PapService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private messageService: MessageService //  private messageService: MessageService
  ) {
    this.route.params.subscribe((params) => {
      this.paramsId = params["id"];
    });
  }
  ngOnInit(): void {
    this.getBatimentByCodePap();
    this.getDescriptionBatimentCodePap();
    this.getBetailsCodePap();
    this.getCultureCodePap();
    this.getCopropriétaireByCodePap();
    this.getPolygoneByCodePap();
    this.getEmployeByCodePap();
    if (this.infosPap && this.infosPap.evaluationPerte) {
      this.parsedEquipements = this.infosPap.evaluationPerte.perteEquipement
        ? JSON.parse(this.infosPap.evaluationPerte.perteEquipement)
        : [];

      this.parsedBatiments = this.infosPap.evaluationPerte.perteBatiment
        ? JSON.parse(this.infosPap.evaluationPerte.perteBatiment)
        : [];
    }
  }

  getAttributComplementaireClient(infosPap) {
    this.isLoading = true;
    const data = {
      natureAttribut: "CLIENT",
      referenceObjet: infosPap.id,
    };
    this.coreService
      .getAttributComplementaire(data, "attribut-complementaire/mine")
      .subscribe(
        (resp) => {
          if (
            resp[this.constantes.RESPONSE_CODE] ===
            this.constantes.HTTP_STATUS.SUCCESSFUL
          ) {
            this.isLoading = false;
            this._attributComplementaire = resp[this.constantes.RESPONSE_DATA];
            this._changeDetectorRef.markForCheck();
          } else {
            this.isLoading = false;
          }
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  getListNaturePersonnesMorales() {
    this.coreService
      .list("nature-personne-morale", 0, 1000)
      .subscribe((response) => {
        if (response["responseCode"] === 200) {
          this.naturePersonnesMorales = response["data"];
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  getListresponsable() {
    this.coreService
      .list("personne-physique", 0, 1000)
      .subscribe((response) => {
        if (response["responseCode"] === 200) {
          this.responsable = response["data"];
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  getListStatutJuridique() {
    this.coreService.list("statut-juridique", 0, 1000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.statutJuridiques = response["data"];
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  getListPays() {
    this.coreService.list("pays", 0, 1000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.countries = response["data"];
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  getNaturePersonneMorale(value: any) {
    const liste = this.naturePersonnesMorales.filter(
      (type) => type.id == value
    );
    return liste.length != 0 ? liste[0].libelle : value;
  }

  getResponsable(value: any) {
    const liste = this.responsable.filter((type) => type.id == value);
    return liste.length != 0 ? liste[0].prenom + " " + liste[0].nom : value;
  }

  getstatutJuridique(value: any) {
    const liste = this.statutJuridiques.filter((type) => type.id == value);
    return liste.length != 0 ? liste[0].libelle : value;
  }

  updateItems(information) {
    // this.snackbar.openModal( AjoutPersonnePhysiqueComponent, '50rem', 'edit', '', information, information.id, () => {
    //     this.relod();
    // });
  }

  relod() {
    window.location.reload();
  }
  updateItemsMoral(information) {
    // this.snackbar.openModal( AjoutPersonneMoraleComponent, '50rem', 'edit', '', information, information.id, () => {
    //     this.relod();
    // });
  }

  updateClient(client): void {
    console.log("====================================");
    console.log(client);
    console.log("====================================");
    // this.snackbar.openModal(PapAddComponent,"60rem","edit",'',client,client.id,() => {

    // });
    const dialogRef = this._matDialog.open(PapAddComponent, {
      autoFocus: true,
      width: "60rem",
      height: "auto",
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: "edit",
        data: client,
        dataOther: {},
      },
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  ajoutAttributComplementaire(client, listAttributCompl): void {
    this.dialogRef = this._matDialog.open(
      AjoutAttributComplementaireComponent,
      {
        autoFocus: true,
        width: "30rem",
        panelClass: "event-form-dialog",
        data: {
          action: "new",
          client: client,
          listAttribut: listAttributCompl,
          type: "CLIENT",
          check: true,
        },
      }
    );
    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        this.getAttributComplementaireClient(this.infosPap);
      }
    });
  }

  updateAttributComplementaire(attribut, client): void {
    this.dialogRef = this._matDialog.open(
      AjoutAttributComplementaireComponent,
      {
        autoFocus: true,
        width: "30rem",
        panelClass: "event-form-dialog",
        data: {
          action: "edit",
          client: client,
          attribut: attribut,
          type: "CLIENT",
          check: true,
        },
      }
    );
    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        //window.location.reload();
        this.getAttributComplementaireClient(this.infosPap);
      }
    });
  }

  templateConsentementClient(client): void {
    this.messageService
      .getElementById(client.id, "lettres_consentement/personne_affecte")
      .subscribe(
        (response) => {
          const reponse = response;
          if (reponse["status"] == 200) {
            this.listetemplate = reponse["data"]["contenu"];
          }
          this.dialogRef = this._matDialog.open(TemplateConsentementComponent, {
            autoFocus: true,
            width: "50rem",
            panelClass: "event-form-dialog",
            data: {
              action: "edit",
              client: client,
              templateClient: this.listetemplate,
              check: true,
            },
          });
          this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp) {
            }
          });
        },
        (error) => {
          // console.log(error);
          this.dialogRef = this._matDialog.open(AddConsetementComponent, {
            autoFocus: true,
            width: "70rem",
            panelClass: "event-form-dialog",
            data: {
              pap: client,
            },
          });
          this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp) {
            }
          });
        }
      );
  }

  getKeys(object: any): string[] {
    return Object.keys(object);
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, " $1").toLowerCase();
  }

  splitIntoColumns<T>(array: T[], itemsPerColumn: number): T[][] {
    const columns: T[][] = [];
    for (let i = 0; i < array.length; i += itemsPerColumn) {
      columns.push(array.slice(i, i + itemsPerColumn));
    }
    return columns;
  }

  getBatimentByCodePap() {
    return this.papservice
      .getByCodePap("batiments", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.batiments = data.data[0];
        console.log(data);
      });
  }
  getCopropriétaireByCodePap() {
    return this.papservice
      .getByCodePap("coproprietaires", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.coProprietaires = data.data[0];
        console.log(data.data);
      });
  }

  getBetailsCodePap() {
    return this.papservice
      .getByCodePap("betails", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.betails = data.data[0];
      });
  }

  getCultureCodePap() {
    return this.papservice
      .getByCodePap("cultures", this.infosPap.codePap)
      .subscribe((data: any) => {
        console.log(data.data);
        this.cultures = data.data[0];
      });
  }

  getDescriptionBatimentCodePap() {
    return this.papservice
      .getByCodePap("equipements", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.equipements = data.data[0];
      });
  }

  getCoproprietaireCodePap() {
    return this.papservice
      .getByCodePap("coproprietaires", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.coProprietaires = data.data[0];
      });
  }

  getPolygoneByCodePap() {
    return this.papservice
      .getByCodePap("geopolys", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.polygones = data.data;
      });
  }

  getEmployeByCodePap() {
    return this.papservice
      .getByCodePap("employePap", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.employes = data.data[0];
      });
  }






  coProprietaires: any[]  = [
    {
      codeCoProprietaire: 'CP001',
      nomComplet: 'Jean Dupont',
      contactTelephonique: '+33 6 12 34 56 78',
      sexe: 'Homme',
      age: 35,
      situationMatrimoniale: 'Marié(e)',
      infoComplementaire: 'Propriétaire depuis 2015.'
    },
    {
      codeCoProprietaire: 'CP002',
      nomComplet: 'Marie Curie',
      contactTelephonique: '+33 6 98 76 54 32',
      sexe: 'Femme',
      age: 42,
      situationMatrimoniale: 'Célibataire',
      infoComplementaire: 'Propriétaire depuis 2018.'
    },
    {
      codeCoProprietaire: 'CP003',
      nomComplet: 'Pierre Durand',
      contactTelephonique: '+33 6 55 44 33 22',
      sexe: 'Homme',
      age: 28,
      situationMatrimoniale: 'Divorcé(e)',
      infoComplementaire: 'Propriétaire depuis 2020.'
    },
    {
      codeCoProprietaire: 'CP004',
      nomComplet: 'Sophie Martin',
      contactTelephonique: '+33 6 11 22 33 44',
      sexe: 'Femme',
      age: 50,
      situationMatrimoniale: 'Veuf/Veuve',
      infoComplementaire: 'Propriétaire depuis 2010.'
    }
  ];














}
