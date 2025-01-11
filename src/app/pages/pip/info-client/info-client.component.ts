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
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
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
import { PipAddComponent } from "../pip-add/pip-add.component";

@Component({
  selector: "info-client",
  templateUrl: "./info-client.component.html",
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
  @Input() persPhysique;
  @Input()
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
    private _formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService
  ) //  private messageService: MessageService
  {
    // if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
    //     this.data = this.router.getCurrentNavigation().extras.state.extraData.data;
    // }

    this.route.params.subscribe((params) => {
      this.paramsId = params["id"];
    });
  }
  ngOnInit(): void {
    //  this.getListNaturePersonnesMorales();
    // // Create the form
    this.accountForm = this._formBuilder.group({
      name: ["Brian Hughes"],
      username: ["brianh"],
      title: ["Senior Frontend Developer"],
      company: ["YXZ Software"],
      about: [
        "Hey! This is Brian; husband, father and gamer. I'm mostly passionate about bleeding edge tech and chocolate! 🍫",
      ],
      email: ["hughes.brian@mail.com", Validators.email],
      phone: ["121-490-33-12"],
      country: ["usa"],
      language: ["english"],
    });

    // this.getListNaturePersonnesMorales();
    // this.getListresponsable();
    // this.getListStatutJuridique();
    // this.getListPays();
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
    console.log('====================================');
    console.log(client);
    console.log('====================================');
    const dialogRef = this._matDialog.open(PipAddComponent, {
      autoFocus: true,
      width: '60rem',
      height: 'auto',
      panelClass: 'event-form-dialog',
      disableClose: true,
      data: {
          action: 'edit',
          data: client,
         dataOther: {}
      }
  });
  dialogRef.afterClosed().subscribe(() => {

  });
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


}
